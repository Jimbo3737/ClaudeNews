"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-05-09

Creates the full ClaudeNews schema in one shot — articles, sources, tags,
notes, highlights, bookmarks, library_items, digests, digest_episodes, and
oauth_tokens. The Article table includes the external_id / external_source
columns used to dedup Gmail messages (and later RSS guids) on ingest.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "tags",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(64), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "sources",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("url", sa.Text(), nullable=True),
        sa.Column("feed_url", sa.Text(), nullable=True),
        sa.Column("source_type", sa.String(32), nullable=False, server_default="rss"),
        sa.Column("favicon_url", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("last_fetched_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "articles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "source_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("sources.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("external_id", sa.String(256), nullable=True),
        sa.Column("external_source", sa.String(32), nullable=True),
        sa.Column("url", sa.Text(), nullable=False, unique=True),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("author", sa.String(256), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=True),
        sa.Column("raw_html", sa.Text(), nullable=True),
        sa.Column("clean_text", sa.Text(), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("why_it_matters", sa.Text(), nullable=True),
        sa.Column("read_time_minutes", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(16), nullable=False, server_default="unread"),
        sa.Column("is_saved", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("published_at", sa.DateTime(), nullable=True),
        sa.Column("saved_at", sa.DateTime(), nullable=True),
        sa.Column("read_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_articles_status", "articles", ["status"])
    op.create_index("ix_articles_is_saved", "articles", ["is_saved"])
    op.create_index("ix_articles_created_at", "articles", ["created_at"])
    op.create_index(
        "ix_articles_external",
        "articles",
        ["external_source", "external_id"],
        unique=True,
        postgresql_where=sa.text(
            "external_source IS NOT NULL AND external_id IS NOT NULL"
        ),
    )

    op.create_table(
        "article_tags",
        sa.Column(
            "article_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("articles.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "tag_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tags.id", ondelete="CASCADE"),
            primary_key=True,
        ),
    )

    op.create_table(
        "notes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "article_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("articles.id", ondelete="CASCADE"),
            nullable=True,
        ),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "highlights",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "article_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("articles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("color", sa.String(16), nullable=False, server_default="yellow"),
        sa.Column("position_start", sa.Integer(), nullable=True),
        sa.Column("position_end", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "bookmarks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("url", sa.Text(), nullable=False, unique=True),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("favicon_url", sa.Text(), nullable=True),
        sa.Column("folder", sa.String(256), nullable=True),
        sa.Column("browser", sa.String(32), nullable=True),
        sa.Column("is_reading_list", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_archived", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("bookmarked_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "library_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("item_type", sa.String(16), nullable=False),
        sa.Column("status", sa.String(16), nullable=False, server_default="want"),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("creator", sa.String(256), nullable=True),
        sa.Column("year", sa.Integer(), nullable=True),
        sa.Column("cover_url", sa.Text(), nullable=True),
        sa.Column("external_id", sa.String(128), nullable=True),
        sa.Column("external_source", sa.String(64), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("rating", sa.Float(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "digests",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("digest_date", sa.Date(), nullable=False, unique=True),
        sa.Column("title", sa.String(256), nullable=False),
        sa.Column("summary_text", sa.Text(), nullable=True),
        sa.Column("article_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "digest_articles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "digest_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("digests.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "article_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("articles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("why_it_matters", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("digest_id", "article_id", name="uq_digest_articles_digest_article"),
        sa.UniqueConstraint("digest_id", "position", name="uq_digest_articles_digest_position"),
    )

    op.create_table(
        "digest_episodes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "digest_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("digests.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("audio_url", sa.Text(), nullable=True),
        sa.Column("audio_duration_seconds", sa.Integer(), nullable=True),
        sa.Column("audio_file_size", sa.Integer(), nullable=True),
        sa.Column("tts_provider", sa.String(32), nullable=True),
        sa.Column("is_ready", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "oauth_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("provider", sa.String(32), nullable=False, unique=True),
        sa.Column("account_email", sa.String(256), nullable=True),
        sa.Column("access_token", sa.Text(), nullable=True),
        sa.Column("refresh_token", sa.Text(), nullable=True),
        sa.Column("token_uri", sa.Text(), nullable=True),
        sa.Column("scopes", sa.Text(), nullable=True),
        sa.Column("expires_at", sa.DateTime(), nullable=True),
        sa.Column("last_synced_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("oauth_tokens")
    op.drop_table("digest_episodes")
    op.drop_table("digest_articles")
    op.drop_table("digests")
    op.drop_table("library_items")
    op.drop_table("bookmarks")
    op.drop_table("highlights")
    op.drop_table("notes")
    op.drop_table("article_tags")
    op.drop_index("ix_articles_external", table_name="articles")
    op.drop_index("ix_articles_created_at", table_name="articles")
    op.drop_index("ix_articles_is_saved", table_name="articles")
    op.drop_index("ix_articles_status", table_name="articles")
    op.drop_table("articles")
    op.drop_table("sources")
    op.drop_table("tags")
