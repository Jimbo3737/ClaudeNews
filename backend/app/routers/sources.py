from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db
from app.models.source import Source, SourceType

router = APIRouter()


class SourceOut(BaseModel):
    id: UUID
    name: str
    url: str | None
    feed_url: str | None
    source_type: str
    favicon_url: str | None
    is_active: bool
    last_fetched_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class SourceIn(BaseModel):
    name: str
    url: str | None = None
    feed_url: str | None = None
    source_type: str = SourceType.rss


@router.get("/", response_model=list[SourceOut])
async def list_sources(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Source).order_by(Source.name))
    return result.scalars().all()


@router.post("/", response_model=SourceOut, status_code=201)
async def create_source(data: SourceIn, db: AsyncSession = Depends(get_db)):
    source = Source(**data.model_dump())
    db.add(source)
    await db.commit()
    await db.refresh(source)
    return source


@router.delete("/{source_id}")
async def delete_source(source_id: UUID, db: AsyncSession = Depends(get_db)):
    source = await db.get(Source, source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    await db.delete(source)
    await db.commit()
    return {"ok": True}
