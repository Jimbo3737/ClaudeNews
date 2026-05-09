"""Lightweight wrapper around the Gmail API.

We only need to:
  * list recent message ids (most recent newsletters)
  * fetch the full payload of a message and pull out subject, sender, date, html body

Anything more elaborate (labels, threading, attachments) can land later.
"""
from __future__ import annotations

import base64
from dataclasses import dataclass
from datetime import datetime, timezone
from email.utils import parseaddr, parsedate_to_datetime
from typing import Iterable

from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials


@dataclass
class GmailMessage:
    id: str
    thread_id: str
    sender_name: str
    sender_email: str
    subject: str
    received_at: datetime | None
    html: str | None
    text: str | None


class GmailClient:
    def __init__(self, credentials: Credentials):
        self._service = build("gmail", "v1", credentials=credentials, cache_discovery=False)

    def list_recent_message_ids(
        self,
        max_results: int = 25,
        query: str = "newer_than:14d -in:chats",
    ) -> list[str]:
        """Return the most recent N message ids matching `query`.

        Default query grabs the last 14 days, excluding chat. Tighten to e.g.
        `category:promotions` or `label:newsletters` once the user labels things.
        """
        resp = (
            self._service.users()
            .messages()
            .list(userId="me", q=query, maxResults=max_results)
            .execute()
        )
        return [m["id"] for m in resp.get("messages", [])]

    def get_message(self, message_id: str) -> GmailMessage:
        msg = (
            self._service.users()
            .messages()
            .get(userId="me", id=message_id, format="full")
            .execute()
        )
        headers = {h["name"].lower(): h["value"] for h in msg["payload"].get("headers", [])}
        sender_name, sender_email = parseaddr(headers.get("from", ""))
        received_at = _parse_date(headers.get("date"))

        html, text = _extract_bodies(msg["payload"])

        return GmailMessage(
            id=msg["id"],
            thread_id=msg.get("threadId", ""),
            sender_name=sender_name or sender_email,
            sender_email=sender_email,
            subject=headers.get("subject", "(no subject)"),
            received_at=received_at,
            html=html,
            text=text,
        )

    def iter_messages(self, message_ids: Iterable[str]):
        for mid in message_ids:
            yield self.get_message(mid)


def _parse_date(raw: str | None) -> datetime | None:
    if not raw:
        return None
    try:
        dt = parsedate_to_datetime(raw)
        return dt.astimezone(timezone.utc).replace(tzinfo=None) if dt.tzinfo else dt
    except (TypeError, ValueError):
        return None


def _extract_bodies(payload: dict) -> tuple[str | None, str | None]:
    """Walk a Gmail payload tree and pull out (html, text) bodies.

    Multipart messages nest parts; html and plaintext alternatives sit side by side.
    """
    html: str | None = None
    text: str | None = None

    def walk(part: dict) -> None:
        nonlocal html, text
        mime = part.get("mimeType", "")
        body = part.get("body", {})
        data = body.get("data")
        if data and mime == "text/html" and html is None:
            html = _decode_b64url(data)
        elif data and mime == "text/plain" and text is None:
            text = _decode_b64url(data)
        for sub in part.get("parts", []) or []:
            walk(sub)

    walk(payload)
    return html, text


def _decode_b64url(data: str) -> str:
    # Gmail returns url-safe base64 without padding.
    padding = "=" * (-len(data) % 4)
    raw = base64.urlsafe_b64decode(data + padding)
    return raw.decode("utf-8", errors="replace")
