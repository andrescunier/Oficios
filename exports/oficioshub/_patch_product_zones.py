#!/usr/bin/env python3
"""Asigna zona a productos OficiosHub para que el filtro barrio funcione."""
from __future__ import annotations

import json
import urllib.error
import urllib.request

ACCOUNT = "cccedb72-8267-4513-9b9f-48c2d1fae78d"
API = __import__("os").environ.get("OFICIOSHUB_API", "https://api.cumar.com.ar")
EMAIL = "oficioshub@cumar.com.ar"
PASSWORD = "Hola4751.."
ZONES = [
    "Palermo",
    "Belgrano",
    "Caballito",
    "Quilmes",
    "Ramos Mejía",
    "San Isidro",
    "Avellaneda",
    "Flores",
]


def api(method: str, path: str, token: str | None = None, body: dict | None = None):
    data = None if body is None else json.dumps(body, ensure_ascii=False).encode("utf-8")
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json; charset=utf-8",
        "X-Account-ID": ACCOUNT,
        "X-Account-Slug": "oficioshub",
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
            payload = {"raw": raw[:500]}
        return e.code, payload


def main() -> int:
    status, payload = api("POST", "/api/auth/login", body={"email": EMAIL, "password": PASSWORD})
    if status >= 400:
        raise SystemExit(f"login {status}: {payload}")
    token = (payload.get("data") or payload).get("access_token")
    status, payload = api(
        "GET",
        f"/api/accounts/{ACCOUNT}/products?page=1&per_page=100&is_active=true",
        token=token,
    )
    if status >= 400:
        raise SystemExit(f"list {status}: {payload}")
    products = payload.get("data") or []
    updated = 0
    for idx, product in enumerate(products):
        if not isinstance(product, dict):
            continue
        meta = product.get("metadata") if isinstance(product.get("metadata"), dict) else {}
        provider = meta.get("provider") if isinstance(meta.get("provider"), dict) else {}
        pub = meta.get("public") if isinstance(meta.get("public"), dict) else {}
        if provider.get("zone") or pub.get("provider_zone"):
            continue
        zone = ZONES[idx % len(ZONES)]
        provider = {**provider, "zone": zone, "type": provider.get("type") or "person"}
        pub = {**pub, "provider_zone": zone}
        meta = {**meta, "provider": provider, "public": pub, "marketplace": meta.get("marketplace") or "oficioshub"}
        st, res = api(
            "PATCH",
            f"/api/accounts/{ACCOUNT}/products/{product['id']}",
            token=token,
            body={"metadata": meta},
        )
        print(product.get("name"), "->", zone, st)
        if st < 400:
            updated += 1
    print("updated", updated, "of", len(products))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
