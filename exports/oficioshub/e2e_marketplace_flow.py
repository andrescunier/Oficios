#!/usr/bin/env python3
"""E2E marketplace: proveedor + N clientes contratan + rankean. Corre dentro de fastapi-prod."""
from __future__ import annotations

import json
import time
import traceback
import urllib.error
import urllib.request
import uuid
from dataclasses import dataclass, field

API = "http://127.0.0.1:8000"
ACCOUNT = "cccedb72-8267-4513-9b9f-48c2d1fae78d"
SLUG = "oficioshub"
PASSWORD = "Hola4751.."
SUFFIX = uuid.uuid4().hex[:6]


@dataclass
class StepResult:
    name: str
    ok: bool
    detail: str = ""


@dataclass
class Report:
    steps: list[StepResult] = field(default_factory=list)

    def add(self, name: str, ok: bool, detail: str = "") -> None:
        self.steps.append(StepResult(name, ok, detail))
        mark = "OK" if ok else "FAIL"
        print(f"[{mark}] {name}: {detail}")

    def summary(self) -> int:
        fails = [s for s in self.steps if not s.ok]
        print("\n=== SUMMARY ===")
        print(f"total={len(self.steps)} ok={len(self.steps)-len(fails)} fail={len(fails)}")
        for s in fails:
            print(f" - {s.name}: {s.detail}")
        return 1 if fails else 0


def api(method: str, path: str, token: str | None = None, body: dict | None = None, query: str = ""):
    data = None if body is None else json.dumps(body, ensure_ascii=False).encode("utf-8")
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Account-ID": ACCOUNT,
        "X-Account-Slug": SLUG,
        "User-Agent": "OficiosHubE2E/1.0",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    url = f"{API}{path}{query}"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
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


def login(email: str) -> tuple[str | None, str | None, dict]:
    status, payload = api("POST", "/api/auth/login", body={"email": email, "password": PASSWORD})
    if status >= 400:
        return None, None, payload
    data = payload.get("data") or {}
    token = data.get("access_token")
    bp = data.get("business_partner_id")
    if not bp:
        bp = ((data.get("customer") or {}).get("business_partner_id"))
    if not bp and token:
        st, me = api("GET", "/api/auth/me", token=token)
        mdata = me.get("data") or {}
        bp = mdata.get("business_partner_id") or ((mdata.get("billing") or {}).get("business_partner_id"))
        # also try customer
        if not bp:
            bp = ((mdata.get("customer") or {}).get("business_partner_id"))
    return token, bp, payload


def main() -> int:
    report = Report()
    prov_email = f"prov.e2e.{SUFFIX}@cumar.com.ar"

    # 1) Register supplier
    st, reg = api(
        "POST",
        "/api/simple/register-supplier",
        body={
            "first_name": "Carlos",
            "last_name": "Proveedor",
            "email": prov_email,
            "password": PASSWORD,
            "company_name": f"Oficios Carlos {SUFFIX}",
            "phone": "1155551001",
            "currency": "ARS",
            "industry": "Plomería",
        },
    )
    report.add("register-supplier", st < 400, f"HTTP {st} email={prov_email} msg={reg.get('message')}")
    if st >= 400:
        return report.summary()

    # 2) Login supplier + check partner_type
    token, bp, _ = login(prov_email)
    report.add("login-supplier", bool(token and bp), f"token={bool(token)} bp={bp}")
    if not token or not bp:
        return report.summary()

    st, partner = api("GET", f"/api/accounts/{ACCOUNT}/business-partners/{bp}", token=token)
    ptype = (partner.get("data") or partner).get("partner_type") if isinstance(partner, dict) else None
    # partner may be bare or envelope
    if "partner_type" in partner:
        ptype = partner.get("partner_type")
    elif isinstance(partner.get("data"), dict):
        ptype = partner["data"].get("partner_type")
    report.add("supplier-partner-type", ptype in ("supplier", "both"), f"partner_type={ptype} HTTP {st}")

    # 3) Create services like the frontend does (payload shape)
    services = []
    front_payloads = [
        {
            "sku": f"OH-destape-{SUFFIX}",
            "name": "Destape urgente E2E",
            "description": "Destape de cañerías a domicilio",
            "unit_price": 42000,
            "currency": "ARS",
            "tax_rate": 0,
            "category": "Plomería",
            "is_active": True,
            "status": "active",
            "channels": ["ecommerce"],
            "metadata": {"provider": {"business_partner_id": bp}},
        },
        {
            "sku": f"OH-griferia-{SUFFIX}",
            "name": "Cambio de grifería E2E",
            "description": "Instalación de grifería",
            "unit_price": 35000,
            "currency": "ARS",
            "tax_rate": 0.21,
            "category": "Plomería",
            "status": "active",
            "product_type": "service",
            "stock_quantity": 20,
            "metadata": {"provider": {"business_partner_id": bp}},
        },
    ]
    for i, body in enumerate(front_payloads):
        st, prod = api("POST", f"/api/accounts/{ACCOUNT}/products", token=token, body=body)
        ok = st in (200, 201)
        pid = (prod.get("data") or {}).get("id")
        report.add(f"create-service-{i+1}", ok, f"HTTP {st} id={pid} body_keys={list(body.keys())} err={prod if not ok else ''}"[:300])
        if ok and pid:
            services.append({"id": pid, "sku": body["sku"], "price": body["unit_price"], "name": body["name"]})

    # retry create with clean backend-compatible payload if first failed
    if len(services) < 2:
        for i in range(2 - len(services)):
            body = {
                "sku": f"OH-svc{i}-{SUFFIX}",
                "name": f"Servicio E2E {i+1} {SUFFIX}",
                "description": "Servicio marketplace e2e",
                "unit_price": 28000 + i * 1000,
                "currency": "ARS",
                "tax_rate": 0.21,
                "product_type": "service",
                "stock_quantity": 25,
                "category": "Plomería",
                "status": "active",
            }
            st, prod = api("POST", f"/api/accounts/{ACCOUNT}/products", token=token, body=body)
            ok = st in (200, 201)
            pid = (prod.get("data") or {}).get("id")
            report.add(f"create-service-fallback-{i+1}", ok, f"HTTP {st} id={pid} err={prod if not ok else ''}"[:300])
            if ok and pid:
                services.append({"id": pid, "sku": body["sku"], "price": body["unit_price"], "name": body["name"]})

    # 4) list mine
    st, mine = api("GET", f"/api/accounts/{ACCOUNT}/products?mine=true&page=1&per_page=50", token=token)
    mine_data = mine.get("data") or []
    report.add("list-mine", st == 200 and len(mine_data) >= 1, f"HTTP {st} count={len(mine_data)}")

    # 5) public catalog includes services
    st, pub = api("GET", f"/api/accounts/{ACCOUNT}/products/public?page=1&page_size=100&search=E2E")
    pub_data = pub.get("data") or []
    report.add("public-catalog-search", st == 200, f"HTTP {st} count={len(pub_data)}")

    if not services:
        return report.summary()

    # 6) Several customers hire + review
    for idx in range(1, 4):
        email = f"cli.e2e.{SUFFIX}.{idx}@cumar.com.ar"
        st, _ = api(
            "POST",
            "/api/simple/register-customer",
            body={
                "first_name": f"Cliente{idx}",
                "last_name": "E2E",
                "email": email,
                "password": PASSWORD,
                "company_name": f"Hogar Cliente {idx}",
                "phone": f"115555200{idx}",
                "currency": "ARS",
            },
        )
        report.add(f"register-customer-{idx}", st < 400, f"HTTP {st} {email}")

        ctoken, cbp, login_payload = login(email)
        report.add(f"login-customer-{idx}", bool(ctoken and cbp), f"bp={cbp}")
        if not ctoken or not cbp:
            # dump login keys to debug missing bp
            report.add(f"login-customer-{idx}-debug", False, str(list((login_payload.get('data') or {}).keys())))
            continue

        svc = services[(idx - 1) % len(services)]

        # create sales order
        order_body = {
            "customer_id": cbp,
            "currency": "ARS",
            "notes": f"Contratación E2E {svc['name']}",
            "items": [
                {
                    "product_id": svc["id"],
                    "quantity": 1,
                    "unit_price": svc["price"],
                }
            ],
        }
        st, order = api("POST", f"/api/accounts/{ACCOUNT}/sales-orders", token=ctoken, body=order_body)
        oid = (order.get("data") or {}).get("id")
        report.add(f"create-order-{idx}", st in (200, 201) and bool(oid), f"HTTP {st} order={oid} err={order if st>=400 else ''}"[:350])
        if not oid:
            continue

        # submit order
        st, submitted = api("POST", f"/api/accounts/{ACCOUNT}/sales-orders/{oid}/submit", token=ctoken, body={})
        report.add(
            f"submit-order-{idx}",
            st < 400,
            f"HTTP {st} status={(submitted.get('data') or {}).get('status')} err={submitted if st>=400 else ''}"[:350],
        )

        # list customer orders
        st, orders = api("GET", f"/api/accounts/{ACCOUNT}/sales-orders?page=1&per_page=20", token=ctoken)
        odata = orders.get("data") or []
        report.add(f"list-orders-{idx}", st == 200 and any(str(o.get("id")) == str(oid) for o in odata if isinstance(o, dict)), f"HTTP {st} count={len(odata)}")

        # review
        st, review = api(
            "POST",
            f"/api/accounts/{ACCOUNT}/products/{svc['id']}/reviews",
            token=ctoken,
            body={
                "overall_rating": 3 + idx * 0.5,
                "dimensions": {
                    "service": 4,
                    "cleanliness": 3 + (idx % 2),
                    "punctuality": 5,
                    "quality": 4.5,
                },
                "comment": f"Reseña cliente {idx}",
                "sales_order_id": oid,
            },
            query=f"?business_partner_id={cbp}",
        )
        report.add(
            f"review-{idx}",
            st in (200, 201),
            f"HTTP {st} rating={(review.get('data') or {}).get('overall_rating')} err={review if st>=400 else ''}"[:350],
        )

        st, summary = api("GET", f"/api/accounts/{ACCOUNT}/products/{svc['id']}/reviews/summary")
        sdata = summary.get("data") or {}
        report.add(
            f"review-summary-{idx}",
            st == 200 and (sdata.get("review_count") or 0) >= 1,
            f"HTTP {st} {sdata}",
        )

    # 7) Frontend-shaped review summary fields expected by UI
    st, summary = api("GET", f"/api/accounts/{ACCOUNT}/products/{services[0]['id']}/reviews/summary")
    sdata = summary.get("data") or {}
    has_ui_fields = ("rating" in sdata or "overall_rating_avg" in sdata) and (
        "dimensions" in sdata or "dimensions_avg" in sdata or "rating_dimensions" in sdata
    )
    report.add("summary-ui-contract", has_ui_fields, f"keys={list(sdata.keys())} data={sdata}")

    # 8) Live front routes
    for path in ["/", "/registro-proveedor", "/proveedor", "/productos", "/login"]:
        try:
            req = urllib.request.Request(
                f"https://oficioshub.cumar.com.ar{path}",
                headers={"User-Agent": "Mozilla/5.0 E2E"},
                method="GET",
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                body = resp.read(200).decode("utf-8", errors="replace")
                ok = resp.status == 200 and ("<!doctype html>" in body.lower() or "<html" in body.lower())
                report.add(f"front{path}", ok, f"HTTP {resp.status}")
        except Exception as e:
            report.add(f"front{path}", False, str(e)[:200])

    return report.summary()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception:
        traceback.print_exc()
        raise SystemExit(2)
