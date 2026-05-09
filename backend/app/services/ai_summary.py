"""Per-article AI summarization via the Anthropic SDK.

Called from the ingest worker once a Gmail newsletter has been parsed. Produces
a structured summary, a one-line "why it matters", and 1–4 suggested tag
names. The result is plugged onto the Article row before commit.

Model defaults to Opus 4.7 (the SDK's recommended default). Set
`ANTHROPIC_SUMMARY_MODEL` to override (e.g. `claude-haiku-4-5` or
`claude-sonnet-4-6`) when you'd rather optimise for cost on bulk newsletter
ingest — per-article summaries are a workload Haiku handles well.
"""
from __future__ import annotations

import logging
import os
from dataclasses import dataclass

from anthropic import AsyncAnthropic
from bs4 import BeautifulSoup
from pydantic import BaseModel, Field

from app.config import settings

logger = logging.getLogger(__name__)

DEFAULT_MODEL = os.getenv("ANTHROPIC_SUMMARY_MODEL", "claude-opus-4-7")
MAX_INPUT_CHARS = 24_000  # ~6K tokens — trims long newsletters before they hit the model

SYSTEM_PROMPT = """You are an analyst writing a daily news brief for a thoughtful, time-poor reader.

For the article you're given, produce three things in plain, precise language:

1. SUMMARY — 2–3 sentences capturing what's actually new or said. No hype, no marketing language. If the email is light on substance (sponsorships, classifieds, table-of-contents), still produce a usable, honest summary that names that.

2. WHY IT MATTERS — exactly one sentence on the broader significance: why a generalist reader should care, what it changes, or what trend it confirms. Skip if genuinely none — set this to an empty string rather than padding.

3. TAGS — 1–4 short subject tags in Title Case (e.g. "AI Policy", "UK Housing", "Energy Transition", "Media Business"). Prefer broad, reusable tags over hyper-specific ones.

Be precise and confident. Don't editorialise."""


class ArticleSummary(BaseModel):
    """Structured response from the summariser. Maps to Article columns."""

    summary: str = Field(description="2–3 sentence summary of the article's content.")
    why_it_matters: str = Field(
        description="One sentence on the broader significance, or empty string if none."
    )
    suggested_tags: list[str] = Field(
        default_factory=list,
        description="1–4 short Title Case subject tags.",
    )


@dataclass(frozen=True)
class SummaryInput:
    title: str
    source: str
    html: str | None
    text: str | None


_client: AsyncAnthropic | None = None


def _get_client() -> AsyncAnthropic:
    global _client
    if _client is None:
        if not settings.anthropic_api_key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY is not configured — can't summarise articles."
            )
        _client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    return _client


def _to_plain_text(html: str | None, fallback_text: str | None) -> str:
    if html:
        text = BeautifulSoup(html, "lxml").get_text("\n", strip=True)
    elif fallback_text:
        text = fallback_text
    else:
        text = ""
    if len(text) > MAX_INPUT_CHARS:
        text = text[:MAX_INPUT_CHARS] + "\n\n[...truncated for length]"
    return text


async def summarize_article(payload: SummaryInput) -> ArticleSummary | None:
    """Run a single per-article summary call. Returns None on failure (logged).

    Designed to be called concurrently via asyncio.gather for batch ingest;
    failures of individual calls don't bring down the rest of the batch.
    """
    text = _to_plain_text(payload.html, payload.text)
    if not text.strip():
        return None

    user_content = (
        f"Source: {payload.source}\n"
        f"Title: {payload.title}\n\n"
        f"Article body (extracted from newsletter HTML):\n\n{text}"
    )

    try:
        client = _get_client()
        response = await client.messages.parse(
            model=DEFAULT_MODEL,
            max_tokens=800,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_content}],
            output_format=ArticleSummary,
        )
    except Exception as exc:
        logger.warning("AI summary failed for %s: %s", payload.title, exc)
        return None

    parsed = response.parsed_output
    if parsed is None:
        logger.warning(
            "AI summary returned no parsed_output for %s (stop_reason=%s)",
            payload.title,
            response.stop_reason,
        )
        return None

    # Normalise tags: strip, dedupe (case-insensitive), cap at 4.
    seen: set[str] = set()
    cleaned_tags: list[str] = []
    for tag in parsed.suggested_tags:
        t = (tag or "").strip()
        if not t:
            continue
        if t.lower() in seen:
            continue
        seen.add(t.lower())
        cleaned_tags.append(t)
        if len(cleaned_tags) >= 4:
            break
    parsed.suggested_tags = cleaned_tags
    return parsed
