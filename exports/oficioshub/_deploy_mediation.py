#!/usr/bin/env python3
"""Hot-patch API endpoints de mediación/aceptación/OK de calidad en fastapi-prod."""
from __future__ import annotations

import subprocess
import time
from pathlib import Path

ROOT = Path("/mnt/c/simpleFastApi")
FILES = [
    "app/schemas.py",
    "app/api/sales_orders.py",
    "app/services/api_permission_service.py",
]


def run(cmd: list[str]) -> None:
    print("$", " ".join(cmd))
    subprocess.check_call(cmd)


def main() -> int:
    for rel in FILES:
        src = ROOT / rel
        if not src.exists():
            raise SystemExit(f"missing {src}")
        run(["docker", "cp", str(src), f"fastapi-prod:/app/{rel}"])
    run(["docker", "restart", "fastapi-prod"])
    for _ in range(40):
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
