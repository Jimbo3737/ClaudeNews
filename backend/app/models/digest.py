import uuid
from datetime import datetime, date
from sqlalchemy import String, DateTime, Date, Text, Integer, Boolean, ForeignKey, UniqueConstraint
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

    episodes: Mapped[list["DigestEpisode"]] = relationship(
        "DigestEpisode", back_populates="digest", cascade="all, delete-orphan"
    )
    picks: Mapped[list["DigestArticle"]] = relationship(
        "DigestArticle",
        back_populates="digest",
        cascade="all, delete-orphan",
        order_by="DigestArticle.position",
    )


class DigestArticle(Base):
    """Ordered article picks for a digest, with per-pick framing.

    Articles already carry their own why_it_matters (from the per-article
    summariser); this table stores the digest-specific reframing that ties
    each pick into the day's narrative.
    """

    __tablename__ = "digest_articles"
    __table_args__ = (
        UniqueConstraint("digest_id", "article_id", name="uq_digest_articles_digest_article"),
        UniqueConstraint("digest_id", "position", name="uq_digest_articles_digest_position"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    digest_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("digests.id", ondelete="CASCADE"), nullable=False
    )
    article_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("articles.id", ondelete="CASCADE"), nullable=False
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    why_it_matters: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    digest: Mapped["Digest"] = relationship("Digest", back_populates="picks")
    article: Mapped["Article"] = relationship("Article", lazy="joined")  # type: ignore[name-defined]  # noqa: F821


class DigestEpisode(Base):
    __tablename__ = "digest_episodes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    digest_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("digests.id", ondelete="CASCADE"), nullable=False
    )
    audio_url: Mapped[str | None] = mapped_column(Text)
    audio_duration_seconds: Mapped[int | None] = mapped_column(Integer)
    audio_file_size: Mapped[int | None] = mapped_column(Integer)
    tts_provider: Mapped[str | None] = mapped_column(String(32))
    is_ready: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    digest: Mapped["Digest"] = relationship("Digest", back_populates="episodes")
