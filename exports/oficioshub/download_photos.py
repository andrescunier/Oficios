#!/usr/bin/env python3
from __future__ import annotations

import urllib.error
import urllib.request
from pathlib import Path

DIR = Path("/mnt/c/simpleOficioshub/public/branding/oficioshub/photos")
DIR.mkdir(parents=True, exist_ok=True)

for junk in Path("/mnt/c/simpleFastApi").glob("*.jpg"):
    junk.unlink(missing_ok=True)

# Curated Unsplash stills of people / home work (not corporate stock).
# Each entry may list fallbacks if an ID 404s.
PHOTOS: dict[str, list[str]] = {
    "hero-home.jpg": [
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1556911220-bff31c812d84?auto=format&fit=crop&w=1600&q=80",
    ],
    "hero-person.jpg": [
        "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80",
    ],
    "cat-hogar.jpg": [
        "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80",
    ],
    "cat-electricidad.jpg": [
        "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80",
    ],
    "cat-pintura.jpg": [
        "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=900&q=80",
    ],
    "cat-exterior.jpg": [
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80",
    ],
    "svc-plomeria.jpg": [
        "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1200&q=80",
    ],
    "svc-electricidad.jpg": [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80",
    ],
    "svc-pintura.jpg": [
        "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80",
    ],
    "svc-aires.jpg": [
        "https://images.unsplash.com/photo-1631545806609-adc37e645aa4?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
    ],
    "svc-jardin.jpg": [
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&w=1200&q=80",
    ],
    "svc-arreglos.jpg": [
        "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80",
    ],
}

UA = "Mozilla/5.0 (compatible; OficiosHub/1.0)"


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def main() -> None:
    for old in DIR.glob("*.jpg"):
        old.unlink()
    for name, urls in PHOTOS.items():
        data = None
        last_err: Exception | None = None
        for url in urls:
            try:
                data = fetch(url)
                if data[:3] == b"\xff\xd8\xff":
                    break
                last_err = RuntimeError(f"not jpeg: {data[:30]!r}")
                data = None
            except Exception as exc:  # noqa: BLE001
                last_err = exc
                data = None
        if data is None:
            raise SystemExit(f"FAIL {name}: {last_err}")
        (DIR / name).write_bytes(data)
        print(f"OK {name} ({len(data)} bytes)")
    print("DONE", DIR)


if __name__ == "__main__":
    main()
