import uuid
from datetime import datetime, date
from sqlalchemy import String, DateTime, Date, Text, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Digest(Base):
    __tablename__ = "digests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    digest_date: Mapped[date] = mapped_column(Date, unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    summary_text: Mapped[str | None] = mapped_column(Text)
    article_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    episodes: Mapped[list["DigestEpisode"]] = relationship("DigestEpisode", back_populates="digest", cascade="all, delete-orphan")


class DigestEpisode(Base):
    __tablename__ = "digest_episodes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    digest_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), __import__("sqlalchemy").ForeignKey("digests.id", ondelete="CASCADE"), nullable=False)
    audio_url: Mapped[str | None] = mapped_column(Text)
    audio_duration_seconds: Mapped[int | None] = mapped_column(Integer)
    audio_file_size: Mapped[int | None] = mapped_column(Integer)
    tts_provider: Mapped[str | None] = mapped_column(String(32))
    is_ready: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    digest: Mapped["Digest"] = relationship("Digest", back_populates="episodes")
