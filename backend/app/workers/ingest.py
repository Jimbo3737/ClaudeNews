"""Newsletter ingest worker.

Fetches recent Gmail messages, parses each as a newsletter article, dedupes by
Gmail message id, creates a `Source` row per sender, and persists an `Article`
record. Run via the `/api/ingest/run` endpoint for now; later this becomes an
RQ task on a periodic schedule.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime

from bs4 import BeautifulSoup
from readability import Document
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.article import Article, ArticleStatus
from app.models.oauth_token import OAuthToken
from app.models.source import Source, SourceType
from app.routers.auth import load_google_credentials
from app.services.gmail_client import GmailClient, GmailMessage

EXTERNAL_SOURCE = "gmail"
WORDS_PER_MINUTE = 220


@dataclass
class IngestResult:
    fetched: int
    inserted: int
    skipped_duplicate: int
    skipped_empty: int


async def ingest_recent(db: AsyncSession, max_messages: int = 25) -> IngestResult:
    creds = await load_google_credentials(db)
    if creds is None:
        raise RuntimeError("Gmail not connected — visit /auth/google to authorise.")

    client = GmailClient(creds)
    message_ids = client.list_recent_message_ids(max_results=max_messages)

    result = IngestResult(fetched=len(message_ids), inserted=0, skipped_duplicate=0, skipped_empty=0)

    for msg_id in message_ids:
        if await _already_ingested(db, msg_id):
            result.skipped_duplicate += 1
            continue

        msg = client.get_message(msg_id)
        if not msg.html and not msg.text:
            result.skipped_empty += 1
            continue

        source = await _get_or_create_source(db, msg.sender_name, msg.sender_email)
        article = _build_article(msg, source.id)
        db.add(article)
        result.inserted += 1

    # Touch last_synced_at on the OAuth token so the Settings page can show it.
    token = (
        await db.execute(select(OAuthToken).where(OAuthToken.provider == "google"))
    ).scalar_one_or_none()
    if token is not None:
        token.last_synced_at = datetime.utcnow()

    await db.commit()
    return result


async def _already_ingested(db: AsyncSession, gmail_message_id: str) -> bool:
    existing = await db.execute(
        select(Article.id).where(
            Article.external_source == EXTERNAL_SOURCE,
            Article.external_id == gmail_message_id,
        )
    )
    return existing.first() is not None


async def _get_or_create_source(
    db: AsyncSession, sender_name: str, sender_email: str
) -> Source:
    """Resolve the Source row for this newsletter sender, creating one if needed."""
    name = (sender_name or sender_email or "Unknown").strip() or sender_email
    feed_url = f"mailto:{sender_email}" if sender_email else None

    if feed_url is not None:
        found = (
            await db.execute(select(Source).where(Source.feed_url == feed_url))
        ).scalar_one_or_none()
        if found is not None:
            return found

    source = Source(
        name=name,
        feed_url=feed_url,
        source_type=SourceType.newsletter.value,
        is_active=True,
        last_fetched_at=datetime.utcnow(),
    )
    db.add(source)
    await db.flush()  # so source.id is populated for the article FK
    return source


def _build_article(msg: GmailMessage, source_id) -> Article:
    html = msg.html or ""
    title, clean_text = _readability_extract(html, fallback_title=msg.subject)
    image_url = _first_image(html)
    primary_url = _first_external_link(html) or _gmail_permalink(msg.id)
    word_count = len((clean_text or msg.text or "").split())
    read_time = max(1, round(word_count / WORDS_PER_MINUTE)) if word_count else None

    return Article(
        source_id=source_id,
        external_id=msg.id,
        external_source=EXTERNAL_SOURCE,
        url=primary_url,
        title=(title or msg.subject)[:512],
        author=msg.sender_name[:256] if msg.sender_name else None,
        image_url=image_url,
        raw_html=html or None,
        clean_text=clean_text or msg.text,
        summary=None,  # filled in by the AI summary pass (next phase)
        read_time_minutes=read_time,
        status=ArticleStatus.unread.value,
        is_saved=False,
        published_at=msg.received_at,
    )


def _readability_extract(html: str, fallback_title: str) -> tuple[str, str]:
    """Use readability-lxml to pull title + main content text."""
    if not html:
        return fallback_title, ""
    try:
        doc = Document(html)
        title = (doc.short_title() or fallback_title).strip()
        summary_html = doc.summary(html_partial=True)
        text = BeautifulSoup(summary_html, "lxml").get_text("\n", strip=True)
        return title, text
    except Exception:
        # readability is brittle on malformed newsletter HTML; just take the raw text
        text = BeautifulSoup(html, "lxml").get_text("\n", strip=True)
        return fallback_title, text


def _first_image(html: str) -> str | None:
    """Pick the first plausibly-real image — skip 1x1 trackers, gif spacers, base64 data URIs."""
    if not html:
        return None
    soup = BeautifulSoup(html, "lxml")
    for img in soup.find_all("img"):
        src = (img.get("src") or "").strip()
        if not src or src.startswith("data:") or "1x1" in src:
            continue
        try:
            w = int(img.get("width") or 0)
            h = int(img.get("height") or 0)
        except ValueError:
            w = h = 0
        if 0 < w < 50 or 0 < h < 50:
            continue
        return src
    return None


_TRACKING_HOSTS = re.compile(
    r"(?:list-manage\.com|sendgrid|mailchimp|substackcdn|email\.|track\.|click\.|links\.|t\.co)",
    re.I,
)


def _first_external_link(html: str) -> str | None:
    """Heuristic: the first link to an external (non-tracking) URL is usually the headline."""
    if not html:
        return None
    soup = BeautifulSoup(html, "lxml")
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if not href.startswith(("http://", "https://")):
            continue
        if _TRACKING_HOSTS.search(href):
            continue
        return href
    return None


def _gmail_permalink(message_id: str) -> str:
    return f"https://mail.google.com/mail/u/0/#inbox/{message_id}"
