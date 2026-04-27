import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import String, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class SourceType(str, Enum):
    rss = "rss"
    newsletter = "newsletter"
    manual = "manual"
    podcast = "podcast"


class Source(Base):
    __tablename__ = "sources"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    url: Mapped[str | None] = mapped_column(Text)
    feed_url: Mapped[str | None] = mapped_column(Text)
    source_type: Mapped[str] = mapped_column(String(32), nullable=False, default=SourceType.rss)
    favicon_url: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_fetched_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    articles: Mapped[list["Article"]] = relationship("Article", back_populates="source", lazy="dynamic")
