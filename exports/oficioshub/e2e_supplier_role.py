#!/usr/bin/env python3
"""E2E: rol supplier + FK provider_partner_id + contratos de clientes."""
from __future__ import annotations

import json
import urllib.error
import urllib.request
import uuid

API = "http://127.0.0.1:8000"
ACCOUNT = "cccedb72-8267-4513-9b9f-48c2d1fae78d"
PASSWORD = "Hola4751.."
SFX = uuid.uuid4().hex[:6]


def api(method, path, token=None, body=None, query=""):
    data = None if body is None else json.dumps(body).encode()
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Account-ID": ACCOUNT,
        "X-Account-Slug": "oficioshub",
        "User-Agent": "OficiosHubE2E/2.0",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"{API}{path}{query}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode()
            return resp.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = {"raw": raw[:500]}
        return e.code, payload


def login(email):
    st, payload = api("POST", "/api/auth/login", body={"email": email, "password": PASSWORD})
    data = payload.get("data") or {}
    token = data.get("access_token")
    bp = data.get("business_partner_id") or ((data.get("customer") or {}).get("business_partner_id"))
    role = (data.get("user") or {}).get("role")
    if token and (not bp or not role):
        _, me = api("GET", "/api/auth/me", token=token)
        m = me.get("data") or {}
        bp = bp or m.get("business_partner_id") or ((m.get("billing") or {}).get("business_partner_id"))
        role = role or (m.get("user") or {}).get("role")
    return token, bp, role, payload


def main():
    fails = []
    def check(name, ok, detail=""):
        print(("OK" if ok else "FAIL"), name, detail)
        if not ok:
            fails.append(f"{name}: {detail}")

    email = f"prov.role.{SFX}@cumar.com.ar"
    st, reg = api(
        "POST",
        "/api/simple/register-supplier",
        body={
            "first_name": "Ana",
            "last_name": "Proveedora",
            "email": email,
            "password": PASSWORD,
            "company_name": f"Servicios Ana {SFX}",
            "phone": "1155553001",
            "currency": "ARS",
            "role": "supplier",
            "industry": "Electricidad",
        },
    )
    check("register-supplier", st < 400, f"HTTP {st} {reg.get('message') or reg}")
    token, bp, role, _ = login(email)
    check("login-role-supplier", role == "supplier" and bool(token and bp), f"role={role} bp={bp}")

    st, partner = api("GET", f"/api/accounts/{ACCOUNT}/business-partners/{bp}", token=token)
    pdata = partner.get("data") or partner
    check("partner-type-supplier", pdata.get("partner_type") == "supplier", str(pdata.get("partner_type")))

    # payload like fixed frontend
    st, prod = api(
        "POST",
        f"/api/accounts/{ACCOUNT}/products",
        token=token,
        body={
            "sku": f"OH-elec-{SFX}",
            "name": f"Instalacion electrica {SFX}",
            "description": "Servicio E2E con FK",
            "unit_price": 65000,
            "currency": "ARS",
            "tax_rate": 0.21,
            "product_type": "service",
            "stock_quantity": 50,
            "stock_unit": "servicio",
            "status": "active",
            "category": "Electricidad",
            "provider_partner_id": bp,
            "metadata": {
                "channels": ["ecommerce"],
                "showecommerce": True,
                "provider": {"business_partner_id": bp, "type": "person"},
            },
        },
    )
    pdata = prod.get("data") or {}
    check(
        "create-with-provider-fk",
        st in (200, 201) and str(pdata.get("provider_partner_id")) == str(bp),
        f"HTTP {st} provider_partner_id={pdata.get('provider_partner_id')} err={prod if st>=400 else ''}"[:280],
    )
    pid = pdata.get("id")

    st, mine = api("GET", f"/api/accounts/{ACCOUNT}/products?mine=true", token=token)
    mine_data = mine.get("data") or []
    check("list-mine", st == 200 and any(str(p.get("id")) == str(pid) for p in mine_data), f"count={len(mine_data)}")

    # 2 customers hire + review
    for i in range(1, 3):
        cemail = f"cli.role.{SFX}.{i}@cumar.com.ar"
        st, _ = api(
            "POST",
            "/api/simple/register-customer",
            body={
                "first_name": f"Cliente{i}",
                "last_name": "Role",
                "email": cemail,
                "password": PASSWORD,
                "company_name": f"Casa {i}",
                "phone": f"11555540{i}0",
                "currency": "ARS",
            },
        )
        check(f"register-customer-{i}", st < 400, f"HTTP {st}")
        ctoken, cbp, crole, _ = login(cemail)
        check(f"login-customer-{i}", crole == "customer" and bool(ctoken and cbp), f"role={crole} bp={cbp}")
        st, order = api(
            "POST",
            f"/api/accounts/{ACCOUNT}/sales-orders",
            token=ctoken,
            body={
                "customer_id": cbp,
                "currency": "ARS",
                "order_number": f"OH-E2E-{SFX}-{i}",
                "items": [
                    {
                        "product_id": pid,
                        "description": "Contratacion servicio E2E",
                        "quantity": 1,
                        "unit_price": 65000,
                        "tax_rate": 0.21,
                    }
                ],
            },
        )
        oid = (order.get("data") or {}).get("id")
        check(f"order-{i}", st in (200, 201) and bool(oid), f"HTTP {st}")
        if oid:
            st, sub = api("POST", f"/api/accounts/{ACCOUNT}/sales-orders/{oid}/submit", token=ctoken, body={})
            check(f"submit-{i}", st < 400, f"HTTP {st}")
            st, rev = api(
                "POST",
                f"/api/accounts/{ACCOUNT}/products/{pid}/reviews",
                token=ctoken,
                body={
                    "overall_rating": 4 + i * 0.2,
                    "dimensions": {"service": 5, "cleanliness": 4, "punctuality": 4, "quality": 5},
                    "comment": f"ok {i}",
                    "sales_order_id": oid,
                },
                query=f"?business_partner_id={cbp}",
            )
            check(f"review-{i}", st in (200, 201), f"HTTP {st} {rev.get('message')}")

    st, summary = api("GET", f"/api/accounts/{ACCOUNT}/products/{pid}/reviews/summary")
    s = summary.get("data") or {}
    check("summary", st == 200 and s.get("review_count", 0) >= 2, str(s))

    print("\nFAILS", len(fails))
    for f in fails:
        print(" -", f)
    return 1 if fails else 0


if __name__ == "__main__":
    raise SystemExit(main())
