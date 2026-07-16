# Persistencia OficiosHub (2026-07-16)

## Git

- `simpleOficioshub` @ `3430dc6` — storefront marketplace (supplier UI, reviews, seed/branding).
- `simpleFastApi` @ `dae3099` — rol `supplier`, `provider_partner_id`, reviews API + SQL.

No se pusheó a remote ni se tocó `:latest` de GHCR.

## Docker (local, sin afectar otros tenants en caliente)

- Imagen API: `sigp-fastapi:oficioshub-marketplace` (+ tag fechado `...-20260716`) = `docker commit` de `fastapi-prod` con el hot-patch.
- `docker-compose.yml` (`fastapi-prod`) apunta a esa imagen local para que un recreate no vuelva a `:latest` sin marketplace.
- Storefront: `oficioshub-storefront:local` rebuild desde el commit del front.
- No se recreó `fastapi-prod` al persistir (evita downtime compartido). Sigue corriendo el contenedor ya parchado.

## SQL ya aplicado en prod DB

- `sql/2026-07-16_product_reviews.sql`
- `sql/2026-07-16_provider_partner_and_supplier_role.sql`

## Ops files en `/mnt/c/simple` (disco, repo dirty)

- `deploy_oficioshub.sh`, `setup_cf_oficioshub.py`
- bloque `oficioshub` + nginx `oficioshub.cumar.com.ar`
