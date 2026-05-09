from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.oauth_token import OAuthToken

router = APIRouter()

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
]


def _client_config() -> dict:
    return {
        "web": {
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [settings.google_redirect_uri],
        }
    }


@router.get("/google")
async def google_login():
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status_code=503, detail="Google OAuth not configured")
    flow = Flow.from_client_config(
        _client_config(), scopes=SCOPES, redirect_uri=settings.google_redirect_uri
    )
    auth_url, _ = flow.authorization_url(prompt="consent", access_type="offline")
    return RedirectResponse(auth_url)


@router.get("/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status_code=503, detail="Google OAuth not configured")

    flow = Flow.from_client_config(
        _client_config(), scopes=SCOPES, redirect_uri=settings.google_redirect_uri
    )
    flow.fetch_token(code=code)
    creds = flow.credentials

    existing = (
        await db.execute(select(OAuthToken).where(OAuthToken.provider == "google"))
    ).scalar_one_or_none()

    scopes_str = " ".join(creds.scopes) if creds.scopes else None
    if existing is None:
        token = OAuthToken(
            provider="google",
            account_email=settings.gmail_account or None,
            access_token=creds.token,
            refresh_token=creds.refresh_token,
            token_uri=creds.token_uri,
            scopes=scopes_str,
            expires_at=creds.expiry,
        )
        db.add(token)
    else:
        existing.access_token = creds.token
        # Without prompt=consent re-grants, refresh_token is None on subsequent
        # flows — only overwrite when Google has issued a new one.
        if creds.refresh_token:
            existing.refresh_token = creds.refresh_token
        existing.token_uri = creds.token_uri
        existing.scopes = scopes_str
        existing.expires_at = creds.expiry
        existing.account_email = settings.gmail_account or existing.account_email
        existing.updated_at = datetime.utcnow()

    await db.commit()

    frontend_origin = settings.cors_origins[0] if settings.cors_origins else "/"
    return RedirectResponse(f"{frontend_origin}/settings?connected=google")


@router.get("/google/status")
async def google_status(db: AsyncSession = Depends(get_db)):
    token = (
        await db.execute(select(OAuthToken).where(OAuthToken.provider == "google"))
    ).scalar_one_or_none()
    if token is None:
        return {"connected": False}
    return {
        "connected": True,
        "account_email": token.account_email,
        "last_synced_at": token.last_synced_at,
        "scopes": (token.scopes or "").split() if token.scopes else [],
    }


@router.post("/google/disconnect")
async def google_disconnect(db: AsyncSession = Depends(get_db)):
    token = (
        await db.execute(select(OAuthToken).where(OAuthToken.provider == "google"))
    ).scalar_one_or_none()
    if token:
        await db.delete(token)
        await db.commit()
    return {"ok": True}


async def load_google_credentials(db: AsyncSession) -> Credentials | None:
    """Reconstruct google-auth Credentials from the persisted OAuthToken row.

    Used by the ingest worker. The Credentials object auto-refreshes via
    google-auth when used, given token_uri + client id/secret + refresh_token.
    """
    token = (
        await db.execute(select(OAuthToken).where(OAuthToken.provider == "google"))
    ).scalar_one_or_none()
    if token is None or token.refresh_token is None:
        return None
    return Credentials(
        token=token.access_token,
        refresh_token=token.refresh_token,
        token_uri=token.token_uri or "https://oauth2.googleapis.com/token",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        scopes=(token.scopes or "").split() if token.scopes else None,
    )
