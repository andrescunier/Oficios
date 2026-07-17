#!/usr/bin/env python3
"""Aplica pages.* + menú/footer claros al ecommerce-config live de OficiosHub."""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

from oficioshub_pages import build_pages

ACCOUNT_ID = "cccedb72-8267-4513-9b9f-48c2d1fae78d"
ACCOUNT_SLUG = "oficioshub"
API = os.environ.get("OFICIOSHUB_API", "https://api.cumar.com.ar")
EMAIL = "oficioshub@cumar.com.ar"
PASSWORD = "Hola4751.."


def api(method: str, path: str, token: str | None = None, body: dict | None = None):
    data = None if body is None else json.dumps(body, ensure_ascii=False).encode("utf-8")
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": "OficiosHubCMS/1.0",
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


def login() -> str:
    status, payload = api("POST", "/api/auth/login", body={"email": EMAIL, "password": PASSWORD})
    if status >= 400:
        raise SystemExit(f"login {status}: {payload}")
    token = (payload.get("data") or payload).get("access_token")
    if not token:
        raise SystemExit(f"no token: {payload}")
    return token


def main() -> int:
    token = login()
    status, payload = api("GET", f"/api/accounts/{ACCOUNT_ID}/ecommerce-config", token=token)
    if status >= 400:
        raise SystemExit(f"get config {status}")
    config = payload.get("data") or payload
    pages = build_pages()
    config["pages"] = pages

    header = config.get("header") if isinstance(config.get("header"), dict) else {}
    header["menu"] = [
        {"label": "Servicios", "href": "/productos"},
        {"label": "Cómo funciona", "href": "/como-funciona"},
        {"label": "Contacto", "href": "/contacto"},
    ]
    header["topBarMessage"] = (
        "Personas con oficio · Validamos idoneidad · Capacitamos con la intermediación"
    )
    header["topBarHref"] = "/como-funciona"
    config["header"] = header

    footer = config.get("footer") if isinstance(config.get("footer"), dict) else {}
    footer["sections"] = [
        {
            "title": "Oficios",
            "links": [
                {"label": "Hogar", "href": "/productos?buscar=hogar"},
                {"label": "Electricidad", "href": "/productos?buscar=electricidad"},
                {"label": "Pintura", "href": "/productos?buscar=pintura"},
                {"label": "Exterior", "href": "/productos?buscar=exterior"},
            ],
        },
        {
            "title": "El sistema",
            "links": [
                {"label": "Cómo funciona", "href": "/como-funciona"},
                {"label": "Sobre OficiosHub", "href": "/sobrenosotros"},
                {"label": "Ofrecer mi oficio", "href": "/registro-proveedor"},
                {"label": "Contacto", "href": "/contacto"},
            ],
        },
        {
            "title": "Ayuda",
            "links": [
                {"label": "Seguimiento", "href": "/seguimiento"},
                {"label": "Cambios / cancelaciones", "href": "/devoluciones"},
                {"label": "Calidad y reseñas", "href": "/garantias"},
                {"label": "Visitas y coordinación", "href": "/como-funciona"},
            ],
        },
        {
            "title": "Legal",
            "links": [
                {"label": "Términos", "href": "/terminos"},
                {"label": "Privacidad", "href": "/privacidad"},
                {"label": "Cookies", "href": "/cookies"},
                {"label": "Aviso legal", "href": "/aviso-legal"},
            ],
        },
    ]
    config["footer"] = footer

    app = config.get("app") if isinstance(config.get("app"), dict) else {}
    app["slogan"] = "Personas con oficio, con respaldo de plataforma"
    app["description"] = (
        "Marketplace de personas particulares. Validamos idoneidad y antecedentes, "
        "reinvertimos la intermediación en capacitaciones, y las contrataciones quedan "
        "como órdenes de venta con ficha de reserva."
    )
    config["app"] = app

    features = config.get("features") if isinstance(config.get("features"), dict) else {}
    features["benefits"] = [
        {
            "icon": "ShieldCheck",
            "title": "Idoneidad validada",
            "description": "Revisamos antecedentes e idoneidad de cada persona con oficio",
        },
        {
            "icon": "GraduationCap",
            "title": "Capacitaciones",
            "description": "Llegan como tareas al proveedor; financiadas por la intermediación",
        },
        {
            "icon": "CalendarDays",
            "title": "Reservas claras",
            "description": "Cada contratación es una orden de venta con ficha para coordinar",
        },
        {
            "icon": "Users",
            "title": "Personas, no empresas",
            "description": "Pocos oficios: Hogar, Electricidad, Pintura y Exterior",
        },
    ]
    config["features"] = features

    out = Path(__file__).resolve().parent / "ecommerce-config.body.json"
    out.write_text(json.dumps(config, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out}")

    status, payload = api(
        "PUT",
        f"/api/accounts/{ACCOUNT_ID}/ecommerce-config",
        token=token,
        body=config,
    )
    if status >= 400:
        raise SystemExit(f"put config {status}: {json.dumps(payload, ensure_ascii=False)[:800]}")
    print("OK pages applied:", ", ".join(sorted(pages.keys())))
    return 0


if __name__ == "__main__":
    # Allow running from exports/oficioshub
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    raise SystemExit(main())
