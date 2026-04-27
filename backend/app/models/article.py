import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import String, DateTime, Boolean, Text, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.tag import article_tags


class ArticleStatus(str, Enum):
    unread = "unread"
    read = "read"
    archived = "archived"


class Article(Base):
    __tablename__ = "articles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("sources.id", ondelete="SET NULL"))

    url: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    author: Mapped[str | None] = mapped_column(String(256))
    image_url: Mapped[str | None] = mapped_column(Text)

    raw_html: Mapped[str | None] = mapped_column(Text)
    clean_text: Mapped[str | None] = mapped_column(Text)
    summary: Mapped[str | None] = mapped_column(Text)

    read_time_minutes: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(16), default=ArticleStatus.unread, nullable=False)
    is_saved: Mapped[bool] = mapped_column(Boolean, default=False)

    published_at: Mapped[datetime | None] = mapped_column(DateTime)
    saved_at: Mapped[datetime | None] = mapped_column(DateTime)
    read_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    source: Mapped["Source"] = relationship("Source", back_populates="articles")
    notes: Mapped[list["Note"]] = relationship("Note", back_populates="article", cascade="all, delete-orphan")
    highlights: Mapped[list["Highlight"]] = relationship("Highlight", back_populates="article", cascade="all, delete-orphan")
    tags: Mapped[list["Tag"]] = relationship("Tag", secondary=article_tags, lazy="selectin")
