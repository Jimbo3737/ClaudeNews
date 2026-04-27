from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db
from app.models.bookmark import Bookmark

router = APIRouter()


class BookmarkOut(BaseModel):
    id: UUID
    url: str
    title: str
    description: str | None
    favicon_url: str | None
    folder: str | None
    browser: str | None
    is_reading_list: bool
    is_archived: bool
    bookmarked_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class BookmarkIn(BaseModel):
    url: str
    title: str
    description: str | None = None
    folder: str | None = None
    browser: str | None = None
    is_reading_list: bool = False
    bookmarked_at: datetime | None = None


@router.get("/", response_model=list[BookmarkOut])
async def list_bookmarks(
    browser: str | None = Query(None),
    is_reading_list: bool | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    q = select(Bookmark).where(Bookmark.is_archived == False).order_by(Bookmark.created_at.desc())
    if browser:
        q = q.where(Bookmark.browser == browser)
    if is_reading_list is not None:
        q = q.where(Bookmark.is_reading_list == is_reading_list)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/bulk", response_model=dict)
async def bulk_import(items: list[BookmarkIn], db: AsyncSession = Depends(get_db)):
    created = 0
    for item in items:
        existing = await db.execute(select(Bookmark).where(Bookmark.url == item.url))
        if existing.scalar_one_or_none():
            continue
        bm = Bookmark(**item.model_dump())
        db.add(bm)
        created += 1
    await db.commit()
    return {"imported": created}


@router.delete("/{bookmark_id}")
async def delete_bookmark(bookmark_id: UUID, db: AsyncSession = Depends(get_db)):
    bm = await db.get(Bookmark, bookmark_id)
    if not bm:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    await db.delete(bm)
    await db.commit()
    return {"ok": True}
