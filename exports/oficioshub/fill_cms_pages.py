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
from ui_patch import UI_PATCH

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
                {"label": "Hogar", "href": "/categoria/hogar"},
                {"label": "Electricidad", "href": "/categoria/electricidad"},
                {"label": "Pintura", "href": "/categoria/pintura"},
                {"label": "Exterior", "href": "/categoria/exterior"},
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
                {"label": "Visitas y coordinación", "href": "/visitas"},
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
    features["skuGrouping"] = False
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
            "title": "Reservas con aceptación",
            "description": "Pedís fecha y zona; el proveedor acepta; cobro tras tu OK de calidad",
        },
        {
            "icon": "Users",
            "title": "Personas, no empresas",
            "description": "Pocos oficios: Hogar, Electricidad, Pintura y Exterior",
        },
    ]
    config["features"] = features

    ui = config.get("ui") if isinstance(config.get("ui"), dict) else {}
    ui.update(UI_PATCH)
    stock_semaforo = ui.get("stockSemaforo") if isinstance(ui.get("stockSemaforo"), dict) else {}
    stock_semaforo["enabled"] = False
    ui["stockSemaforo"] = stock_semaforo
    config["ui"] = ui

    barrio_options = [
        {"value": zone, "label": zone}
        for zone in (
            "Palermo",
            "Belgrano",
            "Caballito",
            "Flores",
            "Recoleta",
            "Villa Crespo",
            "Almagro",
            "San Telmo",
            "Ramos Mejía",
            "Morón",
            "Quilmes",
            "Avellaneda",
            "San Isidro",
            "Vicente López",
            "Lanús",
            "Lomas de Zamora",
        )
    ]
    config["filters"] = {
        "enabled": True,
        "capacidad": False,
        "velocidad": False,
        "stock": False,
        "barrio": True,
        "capacidadOptions": [],
        "velocidadOptions": [],
        "barrioOptions": barrio_options,
    }

    shipping = config.get("shipping") if isinstance(config.get("shipping"), dict) else {}
    shipping.update(
        {
            "bannerText": "Indicás fecha, hora y zona; el proveedor acepta por OficiosHub",
            "pendingLabel": "A coordinar por OficiosHub",
            "chargedMessage": "Sin contacto directo: todo se coordina por OficiosHub",
            "drawerMessage": "El proveedor acepta la reserva; cobro tras tu OK de calidad",
            "productBadgeDescription": "Intermediado por OficiosHub",
        }
    )
    config["shipping"] = shipping

    images = config.get("images") if isinstance(config.get("images"), dict) else {}
    categories = images.get("categories") if isinstance(images.get("categories"), list) else []
    for category in categories:
        if not isinstance(category, dict):
            continue
        slug = str(category.get("slug") or "").strip()
        if slug:
            category["link"] = f"/categoria/{slug}"
    hero_slides = images.get("heroSlides") if isinstance(images.get("heroSlides"), list) else []
    if len(hero_slides) > 1 and isinstance(hero_slides[1], dict):
        hero_slides[1]["subtitle"] = (
            "Pocas categorías. Pedís, el proveedor acepta y todo pasa por OficiosHub"
        )
    images["categories"] = categories
    images["heroSlides"] = hero_slides
    config["images"] = images

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
