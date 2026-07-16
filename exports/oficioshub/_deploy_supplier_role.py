#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import time
from pathlib import Path

ROOT = Path("/mnt/c/simpleFastApi")
SQL = ROOT / "sql" / "2026-07-16_provider_partner_and_supplier_role.sql"
FILES = [
    "app/rbac.py",
    "app/rbac_permissions.py",
    "app/models.py",
    "app/schemas.py",
    "app/main.py",
    "app/api/simple_registration.py",
    "app/api/products.py",
    "app/api/product_reviews.py",
    "app/api/business_partners.py",
    "app/services/api_permission_service.py",
]


def run(cmd: list[str]) -> None:
    print("$", " ".join(cmd))
    subprocess.check_call(cmd)


def main() -> int:
    run(["docker", "cp", str(SQL), "postgres-prod:/tmp/provider_partner.sql"])
    run(
        [
            "docker",
            "exec",
            "-i",
            "postgres-prod",
            "psql",
            "-U",
            "simpleuser",
            "-d",
            "simpledb",
            "-v",
            "ON_ERROR_STOP=1",
            "-f",
            "/tmp/provider_partner.sql",
        ]
    )
    for rel in FILES:
        run(["docker", "cp", str(ROOT / rel), f"fastapi-prod:/app/{rel}"])
    run(["docker", "restart", "fastapi-prod"])
    for _ in range(30):
        time.sleep(2)
        try:
            out = subprocess.check_output(
                [
                    "docker",
                    "exec",
                    "fastapi-prod",
                    "python",
                    "-c",
                    "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:8000/health').status)",
                ],
                text=True,
            ).strip()
            if out == "200":
                print("OK healthy")
                return 0
        except subprocess.CalledProcessError:
            pass
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
