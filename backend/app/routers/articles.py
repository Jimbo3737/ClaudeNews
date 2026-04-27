from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db
from app.models.article import Article, ArticleStatus

router = APIRouter()


class ArticleOut(BaseModel):
    id: UUID
    url: str
    title: str
    author: str | None
    image_url: str | None
    summary: str | None
    read_time_minutes: int | None
    status: str
    is_saved: bool
    published_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class SaveArticleIn(BaseModel):
    url: str
    title: str | None = None


@router.get("/", response_model=list[ArticleOut])
async def list_articles(
    status: str | None = Query(None),
    is_saved: bool | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    q = select(Article).order_by(Article.created_at.desc()).limit(limit).offset(offset)
    if status:
        q = q.where(Article.status == status)
    if is_saved is not None:
        q = q.where(Article.is_saved == is_saved)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{article_id}", response_model=ArticleOut)
async def get_article(article_id: UUID, db: AsyncSession = Depends(get_db)):
    article = await db.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.post("/{article_id}/read")
async def mark_read(article_id: UUID, db: AsyncSession = Depends(get_db)):
    await db.execute(
        update(Article)
        .where(Article.id == article_id)
        .values(status=ArticleStatus.read, read_at=datetime.utcnow())
    )
    await db.commit()
    return {"ok": True}


@router.post("/{article_id}/save")
async def toggle_save(article_id: UUID, db: AsyncSession = Depends(get_db)):
    article = await db.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    article.is_saved = not article.is_saved
    article.saved_at = datetime.utcnow() if article.is_saved else None
    await db.commit()
    return {"is_saved": article.is_saved}


@router.delete("/{article_id}")
async def delete_article(article_id: UUID, db: AsyncSession = Depends(get_db)):
    article = await db.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    await db.delete(article)
    await db.commit()
    return {"ok": True}
