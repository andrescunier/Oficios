#!/usr/bin/env python3
"""Desactiva agrupación SKU y semáforo de stock en ecommerce-config live."""
from __future__ import annotations

import json
import os
import urllib.request

ACCOUNT = "cccedb72-8267-4513-9b9f-48c2d1fae78d"
API = os.environ.get("OFICIOSHUB_API", "http://127.0.0.1:8000")
EMAIL = "oficioshub@cumar.com.ar"
PASSWORD = "Hola4751.."


def api(method: str, path: str, token: str | None = None, body: dict | None = None):
    data = None if body is None else json.dumps(body, ensure_ascii=False).encode("utf-8")
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json; charset=utf-8",
        "X-Account-ID": ACCOUNT,
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"{API}{path}", data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=60) as resp:
        raw = resp.read().decode("utf-8")
        return json.loads(raw) if raw else {}


def main() -> int:
    login = api("POST", "/api/auth/login", body={"email": EMAIL, "password": PASSWORD})
    token = (login.get("data") or login).get("access_token")
    cfg = api("GET", f"/api/accounts/{ACCOUNT}/ecommerce-config", token=token)
    config = cfg.get("data") or cfg
    features = config.get("features") if isinstance(config.get("features"), dict) else {}
    features["skuGrouping"] = False
    config["features"] = features
    ui = config.get("ui") if isinstance(config.get("ui"), dict) else {}
    stock = ui.get("stockSemaforo") if isinstance(ui.get("stockSemaforo"), dict) else {}
    stock["enabled"] = False
    ui["stockSemaforo"] = stock
    config["ui"] = ui
    api("PUT", f"/api/accounts/{ACCOUNT}/ecommerce-config", token=token, body=config)
    print("OK skuGrouping=false stockSemaforo.enabled=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
