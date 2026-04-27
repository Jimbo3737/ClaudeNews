from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db
from app.models.library import LibraryItem, LibraryType, LibraryStatus

router = APIRouter()


class LibraryItemOut(BaseModel):
    id: UUID
    item_type: str
    status: str
    title: str
    creator: str | None
    year: int | None
    cover_url: str | None
    notes: str | None
    rating: float | None
    completed_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class LibraryItemIn(BaseModel):
    item_type: str
    title: str
    creator: str | None = None
    year: int | None = None
    cover_url: str | None = None
    external_id: str | None = None
    external_source: str | None = None
    status: str = LibraryStatus.want


class LibraryItemUpdate(BaseModel):
    status: str | None = None
    notes: str | None = None
    rating: float | None = None
    completed_at: datetime | None = None


@router.get("/", response_model=list[LibraryItemOut])
async def list_items(
    item_type: str | None = Query(None),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    q = select(LibraryItem).order_by(LibraryItem.created_at.desc())
    if item_type:
        q = q.where(LibraryItem.item_type == item_type)
    if status:
        q = q.where(LibraryItem.status == status)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/", response_model=LibraryItemOut, status_code=201)
async def add_item(data: LibraryItemIn, db: AsyncSession = Depends(get_db)):
    item = LibraryItem(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=LibraryItemOut)
async def update_item(item_id: UUID, data: LibraryItemUpdate, db: AsyncSession = Depends(get_db)):
    item = await db.get(LibraryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{item_id}")
async def delete_item(item_id: UUID, db: AsyncSession = Depends(get_db)):
    item = await db.get(LibraryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    await db.delete(item)
    await db.commit()
    return {"ok": True}
