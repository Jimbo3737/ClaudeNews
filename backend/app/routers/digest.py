from uuid import UUID
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.article import Article
from app.models.digest import Digest, DigestArticle, DigestEpisode
from app.routers.articles import ArticleOut, _serialize as serialize_article
from app.services.digest_generator import generate_digest_for_date

router = APIRouter()


class DigestPickOut(BaseModel):
    position: int
    why_it_matters: str | None
    article: ArticleOut


class DigestOut(BaseModel):
    id: UUID
    digest_date: date
    title: str
    summary_text: str | None
    article_count: int
    created_at: datetime
    picks: list[DigestPickOut] = []


class DigestEpisodeOut(BaseModel):
    id: UUID
    digest_id: UUID
    audio_url: str | None
    audio_duration_seconds: int | None
    is_ready: bool
    created_at: datetime

    model_config = {"from_attributes": True}


def _serialize_digest(d: Digest) -> DigestOut:
    return DigestOut(
        id=d.id,
        digest_date=d.digest_date,
        title=d.title,
        summary_text=d.summary_text,
        article_count=d.article_count,
        created_at=d.created_at,
        picks=[
            DigestPickOut(
                position=p.position,
                why_it_matters=p.why_it_matters,
                article=serialize_article(p.article),
            )
            for p in (d.picks or [])
        ],
    )


def _picks_loader():
    """Eager-load digest -> picks -> article -> (source, tags) so serializer doesn't lazy-load."""
    return (
        selectinload(Digest.picks)
        .selectinload(DigestArticle.article)
        .options(selectinload(Article.source), selectinload(Article.tags))
    )


@router.get("/", response_model=list[DigestOut])
async def list_digests(db: AsyncSession = Depends(get_db)):
    q = (
        select(Digest)
        .options(_picks_loader())
        .order_by(Digest.digest_date.desc())
        .limit(30)
    )
    digests = (await db.execute(q)).scalars().unique().all()
    return [_serialize_digest(d) for d in digests]


@router.get("/today", response_model=DigestOut | None)
async def get_today(db: AsyncSession = Depends(get_db)):
    """Returns today's digest if it exists, otherwise null. Used by the Today page."""
    today = date.today()
    q = (
        select(Digest)
        .options(_picks_loader())
        .where(Digest.digest_date == today)
    )
    digest = (await db.execute(q)).scalar_one_or_none()
    if digest is None:
        return None
    return _serialize_digest(digest)


@router.get("/{digest_id}", response_model=DigestOut)
async def get_digest(digest_id: UUID, db: AsyncSession = Depends(get_db)):
    q = select(Digest).options(_picks_loader()).where(Digest.id == digest_id)
    digest = (await db.execute(q)).scalar_one_or_none()
    if digest is None:
        raise HTTPException(status_code=404, detail="Digest not found")
    return _serialize_digest(digest)


@router.post("/generate")
async def generate_today(force: bool = False, db: AsyncSession = Depends(get_db)):
    """Generate (or regenerate) today's digest immediately. Sync — not a background task.

    The Anthropic call typically takes 5–15s; the endpoint blocks until done. Becomes
    a scheduled RQ task once the backend has a real host.
    """
    try:
        result = await generate_digest_for_date(db, force=force)
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    if result is None:
        return {"status": "no_candidates", "date": date.today()}
    return {
        "status": "ready",
        "digest_id": str(result.digest_id),
        "digest_date": result.digest_date,
        "pick_count": result.pick_count,
        "candidate_count": result.candidate_count,
    }


@router.get("/rss/feed.xml")
async def rss_feed(db: AsyncSession = Depends(get_db)):
    """Private podcast RSS feed for digest episodes."""
    result = await db.execute(
        select(Digest, DigestEpisode)
        .join(DigestEpisode, DigestEpisode.digest_id == Digest.id)
        .where(DigestEpisode.is_ready == True)  # noqa: E712
        .order_by(Digest.digest_date.desc())
        .limit(20)
    )
    rows = result.all()

    items_xml = ""
    for digest, episode in rows:
        items_xml += f"""
    <item>
      <title>{digest.title}</title>
      <description><![CDATA[{digest.summary_text or ""}]]></description>
      <pubDate>{digest.digest_date.strftime("%a, %d %b %Y 06:00:00 +0000")}</pubDate>
      <guid>claudenews-digest-{digest.id}</guid>
      <enclosure url="{episode.audio_url}" length="{episode.audio_file_size or 0}" type="audio/mpeg" />
      <itunes:duration>{episode.audio_duration_seconds or 0}</itunes:duration>
    </item>"""

    feed = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>ClaudeNews Daily Digest</title>
    <description>Your personal daily news digest</description>
    <language>en</language>
    <itunes:category text="News" />
    {items_xml}
  </channel>
</rss>"""

    return Response(content=feed, media_type="application/rss+xml")
