"""Daily digest generator.

Picks 3–5 articles from the day's ingested set, writes a per-pick framing,
and produces a short title for the brief. Each call costs one Anthropic
request. Defaults to Opus 4.7 with adaptive thinking — this is a curation
+ composition task and cost is bounded (one call per day).

Override the model via `ANTHROPIC_DIGEST_MODEL` if you'd rather optimise
cost or run a quick experiment with Sonnet.
"""
from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from uuid import UUID

from anthropic import AsyncAnthropic
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.models.article import Article
from app.models.digest import Digest, DigestArticle

logger = logging.getLogger(__name__)

DEFAULT_MODEL = os.getenv("ANTHROPIC_DIGEST_MODEL", "claude-opus-4-7")
LOOKBACK_HOURS = 36  # forgiving window — covers timezones and Friday-newsletters-on-Saturday
MAX_CANDIDATES = 40  # cap how many articles we ship to the model in one prompt
MIN_PICKS = 3
MAX_PICKS = 5

SYSTEM_PROMPT = """You are an editor curating a short daily news brief for a thoughtful, time-poor reader.

You'll receive a numbered list of candidate articles ingested in the last 24–36 hours. Pick the {min_picks}–{max_picks} that, taken together, give the most signal about what changed in the world today. Optimise for:

  • Importance — stories with real consequences, not chatter
  • Diversity — avoid stacking multiple takes on the same story; prefer breadth across topics
  • Signal over recency — a thoughtful piece on a developing story beats a hot take

For each pick, write a single sentence on why it matters in the context of *today's* brief. Don't restate the headline — name the consequence, the signal, or the trend it confirms. Be precise and confident. No hype.

Then write a short title for the brief (8–12 words) that captures the day's character — e.g. "AI Act enforcement clarifies, London housing market flips."

Skip the intro field unless there's a genuinely useful one-line frame for the day. Return an empty string if none."""


class DigestPickSchema(BaseModel):
    candidate_index: int = Field(
        description="1-based index into the candidates list (matching the [N] markers in the user message)."
    )
    why_it_matters: str = Field(
        description="One sentence on why this story matters in today's brief."
    )


class DigestSchema(BaseModel):
    title: str = Field(description="Short headline title for the day's brief (8–12 words).")
    intro: str = Field(
        default="", description="Optional one-line intro framing the day. Empty string if none."
    )
    picks: list[DigestPickSchema] = Field(description=f"{MIN_PICKS}–{MAX_PICKS} ordered picks.")


@dataclass(frozen=True)
class GenerateResult:
    digest_id: UUID
    digest_date: date
    pick_count: int
    candidate_count: int


_client: AsyncAnthropic | None = None


def _get_client() -> AsyncAnthropic:
    global _client
    if _client is None:
        if not settings.anthropic_api_key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY is not configured — can't generate digest."
            )
        _client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    return _client


async def _candidate_articles(db: AsyncSession, target_date: date) -> list[Article]:
    """Articles ingested in the lookback window relative to target_date end-of-day."""
    end = datetime.combine(target_date, datetime.max.time())
    start = end - timedelta(hours=LOOKBACK_HOURS)

    q = (
        select(Article)
        .options(selectinload(Article.source), selectinload(Article.tags))
        .where(Article.created_at >= start)
        .where(Article.created_at <= end)
        .order_by(Article.created_at.desc())
        .limit(MAX_CANDIDATES)
    )
    return list((await db.execute(q)).scalars().all())


def _format_candidates(articles: list[Article]) -> str:
    lines: list[str] = []
    for i, a in enumerate(articles, start=1):
        source = a.source.name if a.source else "Unknown source"
        tags = ", ".join(t.name for t in (a.tags or [])) or "—"
        summary = (a.summary or "").strip() or "(no summary)"
        why = (a.why_it_matters or "").strip()
        block = (
            f"[{i}] {a.title}\n"
            f"    Source: {source} | Tags: {tags}\n"
            f"    Summary: {summary}"
        )
        if why:
            block += f"\n    Article-level why-it-matters: {why}"
        lines.append(block)
    return "\n\n".join(lines)


async def generate_digest_for_date(
    db: AsyncSession, target_date: date | None = None, force: bool = False
) -> GenerateResult | None:
    """Generate (or regenerate) the digest for a date.

    Returns None if there are no candidate articles. Raises if the model call fails.
    """
    target = target_date or date.today()

    existing = (
        await db.execute(
            select(Digest)
            .options(selectinload(Digest.picks))
            .where(Digest.digest_date == target)
        )
    ).scalar_one_or_none()
    if existing is not None and not force:
        return GenerateResult(
            digest_id=existing.id,
            digest_date=existing.digest_date,
            pick_count=len(existing.picks),
            candidate_count=existing.article_count,
        )

    candidates = await _candidate_articles(db, target)
    if not candidates:
        logger.info("No articles in lookback window for %s — skipping digest.", target)
        return None

    user_content = (
        f"Today is {target.isoformat()}. Candidate articles (most recent first):\n\n"
        + _format_candidates(candidates)
        + "\n\nReturn the picks in the order you'd like them to appear in the brief."
    )

    client = _get_client()
    response = await client.messages.parse(
        model=DEFAULT_MODEL,
        max_tokens=2000,
        thinking={"type": "adaptive"},
        system=SYSTEM_PROMPT.format(min_picks=MIN_PICKS, max_picks=MAX_PICKS),
        messages=[{"role": "user", "content": user_content}],
        output_format=DigestSchema,
    )
    parsed = response.parsed_output
    if parsed is None:
        raise RuntimeError(
            f"Digest generation returned no parsed_output (stop_reason={response.stop_reason})."
        )

    # Map 1-based candidate indices back to article IDs; drop any out-of-range / dup picks.
    seen: set[UUID] = set()
    cleaned_picks: list[tuple[Article, str]] = []
    for p in parsed.picks:
        idx = p.candidate_index - 1
        if idx < 0 or idx >= len(candidates):
            logger.warning("Digest pick index out of range: %s", p.candidate_index)
            continue
        article = candidates[idx]
        if article.id in seen:
            continue
        seen.add(article.id)
        cleaned_picks.append((article, p.why_it_matters.strip()))
        if len(cleaned_picks) >= MAX_PICKS:
            break

    if not cleaned_picks:
        raise RuntimeError("Digest generation returned no usable picks.")

    # Compose the persisted summary_text from the picks (used for the podcast TTS later).
    summary_text = (parsed.intro or "").strip()
    if summary_text:
        summary_text += "\n\n"
    for i, (article, why) in enumerate(cleaned_picks, start=1):
        source = article.source.name if article.source else "Unknown source"
        summary_text += f"{i}. {article.title} — {source}\n   {why}\n"

    if existing is None:
        digest = Digest(
            digest_date=target,
            title=parsed.title.strip()[:256],
            summary_text=summary_text.strip(),
            article_count=len(cleaned_picks),
        )
        db.add(digest)
        await db.flush()
    else:
        # Force regenerate — clear old picks and update fields in place.
        digest = existing
        digest.title = parsed.title.strip()[:256]
        digest.summary_text = summary_text.strip()
        digest.article_count = len(cleaned_picks)
        for old_pick in list(digest.picks):
            await db.delete(old_pick)
        await db.flush()

    for position, (article, why) in enumerate(cleaned_picks, start=1):
        db.add(
            DigestArticle(
                digest_id=digest.id,
                article_id=article.id,
                position=position,
                why_it_matters=why,
            )
        )

    await db.commit()

    return GenerateResult(
        digest_id=digest.id,
        digest_date=digest.digest_date,
        pick_count=len(cleaned_picks),
        candidate_count=len(candidates),
    )
