from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import articles, sources, notes, library, bookmarks, digest, auth, ingest

app = FastAPI(title="ClaudeNews API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(articles.router, prefix="/api/articles", tags=["articles"])
app.include_router(sources.router, prefix="/api/sources", tags=["sources"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(library.router, prefix="/api/library", tags=["library"])
app.include_router(bookmarks.router, prefix="/api/bookmarks", tags=["bookmarks"])
app.include_router(digest.router, prefix="/api/digest", tags=["digest"])
app.include_router(ingest.router, prefix="/api/ingest", tags=["ingest"])


@app.get("/health")
async def health():
    return {"status": "ok"}
