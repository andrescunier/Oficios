#!/usr/bin/env python3
from __future__ import annotations

import urllib.error
import urllib.request
from pathlib import Path

DIR = Path("/mnt/c/simpleOficioshub/public/branding/oficioshub/photos")
DIR.mkdir(parents=True, exist_ok=True)

# Fotos de PERSONAS (proveedores) + héroes/categorías con gente en contexto de oficio.
# No usar stills de herramientas/productos como ficha de supplier.
PHOTOS: dict[str, list[str]] = {
    "hero-home.jpg": [
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80",
    ],
    "hero-person.jpg": [
        "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1600&q=80",
    ],
    # Categorías: persona trabajando
    "cat-hogar.jpg": [
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
    ],
    "cat-electricidad.jpg": [
        "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80",
    ],
    "cat-pintura.jpg": [
        "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=900&q=80",
    ],
    "cat-exterior.jpg": [
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80",
    ],
    # Personas (una por supplier demo)
    "person-martin.jpg": [
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
    ],
    "person-diego.jpg": [
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80",
    ],
    "person-lucia.jpg": [
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=80",
    ],
    "person-nico.jpg": [
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    ],
    "person-ana.jpg": [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=900&q=80",
    ],
    "person-camila.jpg": [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
    ],
    # Compat: mismos archivos viejos apuntan a personas
    "svc-plomeria.jpg": [
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80",
    ],
    "svc-arreglos.jpg": [
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=900&q=80",
    ],
    "svc-electricidad.jpg": [
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80",
    ],
    "svc-aires.jpg": [
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
    ],
    "svc-pintura.jpg": [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
    ],
    "svc-jardin.jpg": [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
    ],
}

UA = "Mozilla/5.0 (compatible; OficiosHub/1.0)"


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def main() -> None:
    for name, urls in PHOTOS.items():
        data = None
        last_err: Exception | None = None
        for url in urls:
            try:
                data = fetch(url)
                if len(data) > 5000:
                    break
            except Exception as exc:  # noqa: BLE001
                last_err = exc
                data = None
        if not data:
            raise SystemExit(f"No se pudo bajar {name}: {last_err}")
        (DIR / name).write_bytes(data)
        print(f"OK {name} ({len(data)} bytes)")


if __name__ == "__main__":
    main()
