import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import String, DateTime, Text, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class LibraryType(str, Enum):
    book = "book"
    film = "film"
    tv = "tv"


class LibraryStatus(str, Enum):
    want = "want"
    in_progress = "in_progress"
    done = "done"


class LibraryItem(Base):
    __tablename__ = "library_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_type: Mapped[str] = mapped_column(String(16), nullable=False)
    status: Mapped[str] = mapped_column(String(16), default=LibraryStatus.want, nullable=False)

    title: Mapped[str] = mapped_column(String(512), nullable=False)
    creator: Mapped[str | None] = mapped_column(String(256))
    year: Mapped[int | None] = mapped_column(Integer)
    cover_url: Mapped[str | None] = mapped_column(Text)
    external_id: Mapped[str | None] = mapped_column(String(128))
    external_source: Mapped[str | None] = mapped_column(String(64))

    notes: Mapped[str | None] = mapped_column(Text)
    rating: Mapped[float | None] = mapped_column(Float)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
