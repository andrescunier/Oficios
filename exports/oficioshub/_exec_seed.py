#!/usr/bin/env python3
from __future__ import annotations

import subprocess
from pathlib import Path

ROOT = Path("/mnt/c/simpleOficioshub/exports/oficioshub")
SEED = ROOT / "seed_oficioshub.py"
WRAPPER = ROOT / "_run_inside_container.py"


def main() -> int:
    subprocess.check_call(["docker", "cp", str(SEED), "fastapi-prod:/tmp/seed_oficioshub.py"])
    subprocess.check_call(
        ["docker", "cp", str(WRAPPER), "fastapi-prod:/tmp/run_oficioshub_seed.py"]
    )
    return subprocess.call(
        ["docker", "exec", "-w", "/app", "fastapi-prod", "python3", "/tmp/run_oficioshub_seed.py"]
    )


if __name__ == "__main__":
    raise SystemExit(main())
