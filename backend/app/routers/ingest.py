from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.workers.ingest import ingest_recent

router = APIRouter()


@router.post("/run")
async def run_ingest(max_messages: int = 25, db: AsyncSession = Depends(get_db)):
    """Trigger an immediate Gmail ingest. Used by the Settings "Sync now" button.

    Becomes a scheduled RQ task once we have a real host.
    """
    try:
        result = await ingest_recent(db, max_messages=max_messages)
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {
        "fetched": result.fetched,
        "inserted": result.inserted,
        "skipped_duplicate": result.skipped_duplicate,
        "skipped_empty": result.skipped_empty,
    }
