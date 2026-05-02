# ClaudeNews

A personal content intelligence hub — a single place for all newsletters, saved articles, bookmarks, notes, and a books/films/TV watchlist. Combines the best of Flipboard, Pocket, Instapaper, Gmail, and Goodreads.

## Key Decisions Made

- **Single-user only** (no auth, no multi-tenancy) — can be added later if monetising
- **Gmail OAuth** (read-only) against a dedicated newsletter Gmail account — no custom ingest email address needed
- **Podcast delivery** via a private RSS feed URL the user subscribes to in Apple Podcasts / any pod app
- **Apple Podcasts sync**: one-way via OPML export/import (Apple has no public API)
- **Offline-first PWA** — Service Worker + IndexedDB + Background Sync
- **iOS**: PWA first, Capacitor wrapper later

## Architecture

```
frontend/   Next.js 16 (App Router) + Tailwind — dark magazine UI
backend/    FastAPI (Python) + SQLAlchemy async — REST API
            PostgreSQL — main database
            Redis + RQ — background job queues
            Alembic — DB migrations
docker-compose.yml — postgres, redis, api, frontend, worker
```

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16 + Tailwind + lucide-react |
| Backend | FastAPI + SQLAlchemy 2 (async) |
| DB | PostgreSQL 16 |
| Queue | Redis + RQ |
| Migrations | Alembic (async) |
| AI | Anthropic Claude API (summaries, digest, insights) |
| TTS | OpenAI TTS or ElevenLabs (podcast audio) |
| Email ingest | Gmail API (OAuth2, read-only) |
| File storage | Cloudflare R2 / S3-compatible (podcast audio files) |

## Database Models (backend/app/models/)

- `Article` — saved/ingested articles with status (unread/read/archived), is_saved flag, clean_text, summary
- `Source` — RSS feeds, newsletter senders, manual sources
- `Tag` — many-to-many with Article via article_tags
- `Note` — freeform notes, optionally attached to an Article
- `Highlight` — selected text quotes from articles, with position + colour
- `LibraryItem` — books, films, TV shows with status (want/in_progress/done) and rating
- `Bookmark` — browser bookmarks synced from Chrome/Safari, with folder + browser fields
- `Digest` — daily AI-generated summary records
- `DigestEpisode` — TTS audio episodes linked to a Digest, with RSS feed URL

## API Routers (backend/app/routers/)

- `articles.py` — list, get, mark-read, toggle-save, delete
- `sources.py` — list, create, delete
- `notes.py` — notes CRUD + highlights CRUD
- `library.py` — list (filterable by type/status), add, update, delete
- `bookmarks.py` — list, bulk-import, delete
- `digest.py` — list digests, generate (async), private RSS feed at `/api/digest/rss/feed.xml`
- `auth.py` — Google OAuth2 flow for Gmail access

## Frontend Structure (frontend/src/)

- `app/` — App Router pages: `/` (feed), `/inbox`, `/saved`, `/notes`, `/library`, `/discover`, `/digest`, `/settings`
- `components/Sidebar.tsx` — left nav with all sections
- `components/TopBar.tsx` — header with search + refresh
- `components/ArticleCard.tsx` — magazine card (sm/md/lg sizes), hover save/open actions
- `components/FeedGrid.tsx` — filterable grid (All/Unread/Saved/topics) + state, currently uses mock data
- `components/ReaderPane.tsx` — right-side reading panel that opens on article click

## Build Phases

- **Phase 1** ✅ Scaffold: Next.js frontend, FastAPI backend, full DB schema, Docker Compose
- **Phase 2** — Gmail ingest pipeline: OAuth token storage, poll inbox, parse newsletters, extract article text via `readability-lxml`, store to DB, replace mock data in FeedGrid with real API calls
- **Phase 3** — Reader + save-to-app: article text extraction for any saved URL, browser extension (Chrome + Safari)
- **Phase 4** — Offline-first PWA: Service Worker, IndexedDB, Background Sync, audio caching
- **Phase 5** — AI layer: per-article summaries (Claude API), daily digest generation, TTS podcast, private RSS
- **Phase 6** — Discovery, Library UI, Insights weekly report
- **Phase 7** — Podcast OPML import, bookmark sync
- **Phase 8** — iOS (Capacitor)

## Running Locally

```bash
cp backend/.env.example backend/.env
# Fill in: ANTHROPIC_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GMAIL_ACCOUNT
docker compose up
# Frontend: http://localhost:3000
# API docs: http://localhost:8000/docs
```

## Environment Variables (backend/.env)

See `backend/.env.example` — key vars are:
- `ANTHROPIC_API_KEY` — for summaries and digest generation
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Gmail OAuth app credentials
- `GMAIL_ACCOUNT` — the dedicated newsletter Gmail address
- `STORAGE_BUCKET` / `STORAGE_ENDPOINT` etc. — R2/S3 for podcast audio

## Current State

The UI renders with mock article data. The backend schema and API are complete but not yet wired to the frontend. Phase 2 (Gmail ingest) is the immediate next step.
