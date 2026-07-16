#!/usr/bin/env python3
"""Seed capacitaciones (tareas) + copy de plataforma para suppliers OficiosHub."""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from datetime import UTC, datetime, timedelta

ACCOUNT_ID = "cccedb72-8267-4513-9b9f-48c2d1fae78d"
ACCOUNT_SLUG = "oficioshub"
API = os.environ.get("OFICIOSHUB_API", "https://api.cumar.com.ar")
EMAIL = "oficioshub@cumar.com.ar"
PASSWORD = "Hola4751.."


def api(method: str, path: str, token: str | None = None, body: dict | None = None):
    data = None if body is None else json.dumps(body, ensure_ascii=True).encode("ascii")
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "OficiosHubSeed/1.0",
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
        raise SystemExit(f"login fail {status}: {payload}")
    data = payload.get("data") or payload
    token = data.get("access_token")
    if not token:
        raise SystemExit(f"no token: {payload}")
    return token


CAPACITACIONES = [
    {
        "title": "Bienvenida OficiosHub: personas, no empresas",
        "description": (
            "Conocé cómo funciona la plataforma: validamos tu idoneidad y antecedentes, "
            "y te ayudamos a mejorar con capacitaciones financiadas por la intermediación. "
            "Tus contrataciones llegan como órdenes de venta; las capacitaciones como tareas."
        ),
        "priority": "high",
        "days": 7,
    },
    {
        "title": "Calidad de servicio y trato con el cliente",
        "description": (
            "Buenas prácticas de puntualidad, limpieza, comunicación y cierre del trabajo. "
            "Completá esta capacitación para subir tu nivel y tus reseñas."
        ),
        "priority": "normal",
        "days": 14,
    },
    {
        "title": "Seguridad básica en el domicilio",
        "description": (
            "Checklist de seguridad al trabajar en casas y departamentos: herramientas, "
            "protección y cuidado del espacio del cliente."
        ),
        "priority": "normal",
        "days": 21,
    },
]


def _as_list(payload: object) -> list:
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        data = payload.get("data")
        if isinstance(data, list):
            return data
    return []


def list_supplier_user_ids(token: str) -> list[str]:
    """Lista users del account con rol supplier (paginado)."""
    user_ids: list[str] = []
    page = 1
    while page <= 20:
        status, payload = api(
            "GET",
            f"/api/accounts/{ACCOUNT_ID}/users?page={page}&per_page=100",
            token=token,
        )
        if status >= 400:
            print(f"users list HTTP {status}, trying partners…")
            break
        batch = _as_list(payload)
        if not batch:
            break
        for user in batch:
            if not isinstance(user, dict):
                continue
            role = str(user.get("role") or "").lower()
            if role == "supplier" and user.get("id"):
                user_ids.append(str(user["id"]))
        pag = payload.get("pagination") if isinstance(payload, dict) else {}
        pag = pag or {}
        total_pages = int(pag.get("total_pages") or pag.get("pages") or 1)
        if page >= total_pages:
            break
        page += 1

    if user_ids:
        return sorted(set(user_ids))

    status, payload = api(
        "GET",
        f"/api/accounts/{ACCOUNT_ID}/business-partners?partner_type=supplier&page=1&per_page=100",
        token=token,
    )
    partners = _as_list(payload) if status < 400 else []
    for partner in partners:
        if not isinstance(partner, dict):
            continue
        pid = partner.get("id")
        if not pid:
            continue
        st, pu = api(
            "GET",
            f"/api/accounts/{ACCOUNT_ID}/business-partners/{pid}/users",
            token=token,
        )
        links = _as_list(pu) if st < 400 else []
        for link in links:
            if not isinstance(link, dict):
                continue
            uid = link.get("user_id") or (link.get("user") or {}).get("id")
            if uid:
                user_ids.append(str(uid))
    return sorted(set(user_ids))


def existing_capacitacion_titles(token: str, user_id: str) -> set[str]:
    status, payload = api(
        "GET",
        f"/api/accounts/{ACCOUNT_ID}/tasks?assigned_to_user_id={user_id}&project=capacitacion&per_page=100",
        token=token,
    )
    if status >= 400:
        return set()
    titles = set()
    for task in payload.get("data") or []:
        if task.get("title"):
            titles.add(str(task["title"]))
    return titles


def seed_tasks(token: str, user_ids: list[str]) -> None:
    created = 0
    skipped = 0
    for user_id in user_ids:
        have = existing_capacitacion_titles(token, user_id)
        for item in CAPACITACIONES:
            if item["title"] in have:
                skipped += 1
                continue
            due = datetime.now(UTC) + timedelta(days=item["days"])
            body = {
                "title": item["title"],
                "description": item["description"],
                "assigned_to_user_id": user_id,
                "status": "open",
                "priority": item["priority"],
                "due_at": due.isoformat().replace("+00:00", "Z"),
                "metadata": {
                    "project": "capacitacion",
                    "kind": "capacitacion",
                    "marketplace": "oficioshub",
                },
            }
            status, payload = api(
                "POST",
                f"/api/accounts/{ACCOUNT_ID}/tasks",
                token=token,
                body=body,
            )
            if status in (200, 201):
                created += 1
                print(f"  + task → {user_id[:8]}… · {item['title']}")
            else:
                print(f"  ! FAIL task {status}: {json.dumps(payload, ensure_ascii=False)[:300]}")
    print(f"OK capacitaciones created={created} skipped={skipped} suppliers={len(user_ids)}")


def patch_platform_copy(token: str) -> None:
    status, payload = api("GET", f"/api/accounts/{ACCOUNT_ID}/ecommerce-config", token=token)
    if status >= 400:
        raise SystemExit(f"get config {status}")
    config = payload.get("data") or payload
    pages = config.get("pages") if isinstance(config.get("pages"), dict) else {}
    pages["about"] = {
        "enabled": True,
        "title": "Personas con oficio, con respaldo de plataforma",
        "subtitle": "Validamos idoneidad y antecedentes; reinvertimos la intermediación en tu capacitación",
        "blocks": [
            {
                "type": "text",
                "title": "No sos una empresa de rubro",
                "body": (
                    "OficiosHub conecta personas particulares que ofrecen un oficio con vecinos "
                    "que los necesitan. Cada perfil es alguien concreto, no un directorio corporativo."
                ),
            },
            {
                "type": "text",
                "title": "Idoneidad y antecedentes",
                "body": (
                    "La plataforma se encarga de validar la idoneidad de quienes ofrecen servicios "
                    "y revisar antecedentes relevantes antes de que atiendan clientes."
                ),
            },
            {
                "type": "text",
                "title": "Capacitación continua",
                "body": (
                    "Con lo recaudado por la intermediación, OficiosHub ayuda a capacitarse para "
                    "mejorar calidad de trabajo y nivel de vida. Las capacitaciones llegan al "
                    "proveedor como tareas en su panel."
                ),
            },
            {
                "type": "text",
                "title": "Reservas y cobros",
                "body": (
                    "Cuando te contratan, la reserva llega como orden de venta. En tu panel ves "
                    "la ficha de reserva, el seguimiento de cobros por servicios prestados y tus capacitaciones."
                ),
            },
        ],
        "ctaPrimaryLabel": "Ofrecer mi oficio",
        "ctaPrimaryHref": "/registro-proveedor",
        "ctaSecondaryLabel": "Ver servicios",
        "ctaSecondaryHref": "/productos",
    }
    config["pages"] = pages
    app = config.get("app") if isinstance(config.get("app"), dict) else {}
    app["description"] = (
        "Marketplace de personas particulares. Validamos idoneidad y antecedentes, "
        "y reinvertimos la intermediación en capacitaciones para mejorar calidad y nivel de vida."
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
            "title": "Capacitaciones reales",
            "description": "Te llegan como tareas; financiadas con la intermediación",
        },
        {
            "icon": "CalendarDays",
            "title": "Reservas claras",
            "description": "Cada contratación es una orden de venta con ficha para coordinar",
        },
        {
            "icon": "Wallet",
            "title": "Cobros visibles",
            "description": "Seguís lo asociado a los servicios que prestaste",
        },
    ]
    config["features"] = features

    status, payload = api(
        "PUT",
        f"/api/accounts/{ACCOUNT_ID}/ecommerce-config",
        token=token,
        body=config,
    )
    if status >= 400:
        raise SystemExit(f"put config {status}: {json.dumps(payload, ensure_ascii=False)[:500]}")
    print("OK ecommerce-config pages.about + benefits actualizados")


def main() -> int:
    token = login()
    print("OK login")
    patch_platform_copy(token)
    user_ids = list_supplier_user_ids(token)
    print(f"OK suppliers found={len(user_ids)}")
    if not user_ids:
        print("WARN: no supplier users; capacitaciones no asignadas")
        return 0
    seed_tasks(token, user_ids)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
