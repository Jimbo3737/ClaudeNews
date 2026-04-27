from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime, date
from app.database import get_db
from app.models.digest import Digest, DigestEpisode

router = APIRouter()


class DigestOut(BaseModel):
    id: UUID
    digest_date: date
    title: str
    summary_text: str | None
    article_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class DigestEpisodeOut(BaseModel):
    id: UUID
    digest_id: UUID
    audio_url: str | None
    audio_duration_seconds: int | None
    is_ready: bool
    created_at: datetime

    model_config = {"from_attributes": True}


@router.get("/", response_model=list[DigestOut])
async def list_digests(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Digest).order_by(Digest.digest_date.desc()).limit(30))
    return result.scalars().all()


@router.get("/{digest_id}", response_model=DigestOut)
async def get_digest(digest_id: UUID, db: AsyncSession = Depends(get_db)):
    d = await db.get(Digest, digest_id)
    if not d:
        raise HTTPException(status_code=404, detail="Digest not found")
    return d


@router.post("/generate", status_code=202)
async def generate_digest(background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Queues a digest generation job for today. Actual generation handled by background worker."""
    today = date.today()
    existing = await db.execute(select(Digest).where(Digest.digest_date == today))
    if existing.scalar_one_or_none():
        return {"status": "already_exists", "date": today}
    background_tasks.add_task(_generate_digest_task, today)
    return {"status": "queued", "date": today}


async def _generate_digest_task(for_date: date):
    # Placeholder — real implementation calls Claude API + TTS
    pass


@router.get("/rss/feed.xml")
async def rss_feed(db: AsyncSession = Depends(get_db)):
    """Private podcast RSS feed for digest episodes."""
    result = await db.execute(
        select(Digest, DigestEpisode)
        .join(DigestEpisode, DigestEpisode.digest_id == Digest.id)
        .where(DigestEpisode.is_ready == True)
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

    from fastapi.responses import Response
    return Response(content=feed, media_type="application/rss+xml")
