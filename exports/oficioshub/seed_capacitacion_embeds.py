#!/usr/bin/env python3
"""Seed de una capacitación demo con video/iframe (metadata.content_blocks)."""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from datetime import UTC, datetime, timedelta
from uuid import uuid4

ACCOUNT_ID = "cccedb72-8267-4513-9b9f-48c2d1fae78d"
ACCOUNT_SLUG = "oficioshub"
API = os.environ.get("OFICIOSHUB_API", "http://127.0.0.1:8000")
EMAIL = "oficioshub@cumar.com.ar"
PASSWORD = "Hola4751.."


def api(method: str, path: str, token: str | None = None, body: dict | None = None):
    data = None if body is None else json.dumps(body, ensure_ascii=False).encode("utf-8")
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json; charset=utf-8",
        "X-Account-ID": ACCOUNT_ID,
        "X-Account-Slug": ACCOUNT_SLUG,
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"{API}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = {"raw": raw[:800]}
        return e.code, payload


def main() -> int:
    status, payload = api("POST", "/api/auth/login", body={"email": EMAIL, "password": PASSWORD})
    if status >= 400:
        raise SystemExit(f"login {status}: {payload}")
    token = (payload.get("data") or payload).get("access_token")
    if not token:
        raise SystemExit("no token")

    # Buscar un usuario supplier para asignar
    status, users = api("GET", f"/api/accounts/{ACCOUNT_ID}/users?per_page=50", token=token)
    payload_users = users.get("data") if isinstance(users, dict) else users
    if isinstance(payload_users, dict):
        rows = payload_users.get("items") or payload_users.get("data") or []
    elif isinstance(payload_users, list):
        rows = payload_users
    else:
        rows = []
    assignee = None
    for user in rows:
        if not isinstance(user, dict):
            continue
        role = str(user.get("role") or "").lower()
        if role == "supplier":
            assignee = user.get("id")
            break
    print("assignee", assignee)

    body = {
        "title": "Seguridad y trato al cliente (demo)",
        "description": "Módulo corto de OficiosHub: mirá el video y repasá el checklist.",
        "status": "open",
        "priority": "normal",
        "assigned_to_user_id": assignee,
        "due_at": (datetime.now(UTC) + timedelta(days=14)).isoformat(),
        "metadata": {
            "project": "capacitacion",
            "kind": "capacitacion",
            "seed": "oficioshub-demo-video",
            "content_blocks": [
                {
                    "type": "text",
                    "title": "Qué vas a aprender",
                    "body": "Cómo presentarte, cuidar el domicilio del cliente y coordinar solo por OficiosHub.",
                },
                {
                    "type": "video",
                    "provider": "youtube",
                    "title": "Video introductorio",
                    "url": "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
                },
                {
                    "type": "checklist",
                    "title": "Antes de marcar como hecha",
                    "items": [
                        "Vi el video completo",
                        "Entiendo que no debo pedir WhatsApp al cliente",
                        "Sé que el cobro depende del OK de calidad",
                    ],
                },
            ],
        },
    }
    status, created = api("POST", f"/api/accounts/{ACCOUNT_ID}/tasks", token=token, body=body)
    print("create_task", status, json.dumps(created, ensure_ascii=False)[:500])
    return 0 if status < 400 else 1


if __name__ == "__main__":
    raise SystemExit(main())
