from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db
from app.models.note import Note, Highlight

router = APIRouter()


class NoteOut(BaseModel):
    id: UUID
    article_id: UUID | None
    content: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class NoteIn(BaseModel):
    article_id: UUID | None = None
    content: str


class HighlightOut(BaseModel):
    id: UUID
    article_id: UUID
    text: str
    note: str | None
    color: str
    created_at: datetime

    model_config = {"from_attributes": True}


class HighlightIn(BaseModel):
    article_id: UUID
    text: str
    note: str | None = None
    color: str = "yellow"
    position_start: int | None = None
    position_end: int | None = None


@router.get("/", response_model=list[NoteOut])
async def list_notes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Note).order_by(Note.updated_at.desc()))
    return result.scalars().all()


@router.post("/", response_model=NoteOut, status_code=201)
async def create_note(data: NoteIn, db: AsyncSession = Depends(get_db)):
    note = Note(**data.model_dump())
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


@router.get("/highlights", response_model=list[HighlightOut])
async def list_highlights(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Highlight).order_by(Highlight.created_at.desc()))
    return result.scalars().all()


@router.post("/highlights", response_model=HighlightOut, status_code=201)
async def create_highlight(data: HighlightIn, db: AsyncSession = Depends(get_db)):
    highlight = Highlight(**data.model_dump())
    db.add(highlight)
    await db.commit()
    await db.refresh(highlight)
    return highlight


@router.delete("/{note_id}")
async def delete_note(note_id: UUID, db: AsyncSession = Depends(get_db)):
    note = await db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    await db.delete(note)
    await db.commit()
    return {"ok": True}
