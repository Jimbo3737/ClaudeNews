from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

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
    why_it_matters: str | None
    read_time_minutes: int | None
    status: str
    is_saved: bool
    published_at: datetime | None
    created_at: datetime
    source: str | None
    source_kind: str | None
    external_source: str | None
    tags: list[str]


def _serialize(a: Article) -> ArticleOut:
    return ArticleOut(
        id=a.id,
        url=a.url,
        title=a.title,
        author=a.author,
        image_url=a.image_url,
        summary=a.summary,
        why_it_matters=a.why_it_matters,
        read_time_minutes=a.read_time_minutes,
        status=a.status,
        is_saved=a.is_saved,
        published_at=a.published_at,
        created_at=a.created_at,
        source=a.source.name if a.source else None,
        source_kind=a.source.source_type if a.source else None,
        external_source=a.external_source,
        tags=[t.name for t in (a.tags or [])],
    )


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
    q = (
        select(Article)
        .options(selectinload(Article.source), selectinload(Article.tags))
        .order_by(Article.published_at.desc().nullslast(), Article.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    if status:
        q = q.where(Article.status == status)
    if is_saved is not None:
        q = q.where(Article.is_saved == is_saved)
    result = await db.execute(q)
    return [_serialize(a) for a in result.scalars().all()]


@router.get("/{article_id}", response_model=ArticleOut)
async def get_article(article_id: UUID, db: AsyncSession = Depends(get_db)):
    q = (
        select(Article)
        .options(selectinload(Article.source), selectinload(Article.tags))
        .where(Article.id == article_id)
    )
    article = (await db.execute(q)).scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return _serialize(article)


@router.post("/{article_id}/read")
async def mark_read(article_id: UUID, db: AsyncSession = Depends(get_db)):
    await db.execute(
        update(Article)
        .where(Article.id == article_id)
        .values(status=ArticleStatus.read.value, read_at=datetime.utcnow())
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
