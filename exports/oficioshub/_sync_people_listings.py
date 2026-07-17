#!/usr/bin/env python3
"""Sincroniza productos demo (foto persona, rango, pricing_mode) vía API local."""
from __future__ import annotations

import importlib.util
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SEED = ROOT / "seed_oficioshub.py"


def main() -> int:
    os.environ.setdefault("OFICIOSHUB_API", "http://127.0.0.1:8000")
    spec = importlib.util.spec_from_file_location("seed_oficioshub", SEED)
    if spec is None or spec.loader is None:
        raise SystemExit("no seed module")
    mod = importlib.util.module_from_spec(spec)
    sys.modules["seed_oficioshub"] = mod
    # oficioshub_pages import path
    sys.path.insert(0, str(ROOT))
    spec.loader.exec_module(mod)
    token = mod.login()
    mod.sync_products(token)
    print("OK people listings synced")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
