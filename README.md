# Oficios (OficiosHub)

Storefront del marketplace **OficiosHub**: personas con oficio (no ecommerce de stock).  
Repo: https://github.com/andrescunier/Oficios · Live: https://oficioshub.cumar.com.ar

Stack React + Vite multi-tenant; branding y reglas de negocio vienen del `ecommerce-config` del account.

## Stack

- React 19
- Vite 6
- Tailwind CSS 4
- Zustand
- React Router 7
- Axios

## Desarrollo

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Build local:

```bash
pnpm build
pnpm preview
```

## Configuración

La app necesita solamente estas dos variables de entorno:

```env
VITE_API_BASE_URL=https://api.cumar.com.ar
VITE_ACCOUNT_ID=bed2df35-717f-4900-a4b1-7c3a7fb59b7c
```

Todo lo demás se obtiene en el arranque desde:

```http
GET /api/accounts/{accountId}/ecommerce-config
```

Referencia de contrato:

- [docs/BACKEND_ALIGNMENT.md](/home/andis/simpleEcommerce/docs/BACKEND_ALIGNMENT.md)
- [docs/API_ECOMMERCE_CONFIG.md](/home/andis/simpleEcommerce/docs/API_ECOMMERCE_CONFIG.md)
- [docs/BACKEND_CONTRACT.md](/home/andis/simpleEcommerce/docs/BACKEND_CONTRACT.md)
- [/home/andis/simpleFastApi/docs/FRONTEND_STOREFRONT_CONTRACT.md](/home/andis/simpleFastApi/docs/FRONTEND_STOREFRONT_CONTRACT.md)

Ejemplos de configuración runtime:

- [exports/runtime-config.example.json](/home/andis/simpleEcommerce/exports/runtime-config.example.json)

## Scripts útiles

```bash
pnpm dev
pnpm build
pnpm build:check
pnpm lint
pnpm test
pnpm test:run
pnpm test:e2e
pnpm test:e2e:headed
```

## Calidad

- `pnpm build` valida el bundle final.
- `pnpm build:check` valida el build y aplica presupuesto de bundle sobre `index` y `react-vendor`.
- `pnpm lint` valida el código del frontend.
- `pnpm test:run` ejecuta tests unitarios, store, runtime schema y observabilidad.
- `pnpm test:e2e` ejecuta Playwright con mocks deterministas para bootstrap, catálogo, login y checkout.
- `.github/workflows/quality.yml` reinstala un quality gate con `lint + typecheck + unit + build:check + e2e`.
- `window.__APP_MONITOR__` expone `getEvents()`, `getPending()`, `getSessionId()` y `flush()` en desarrollo.

## Integración backend

- Auth storefront aprobado:
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
  - `POST /api/simple/register-customer`
- El catálogo anónimo consume `GET /api/accounts/{accountId}/products/public`.
- El catálogo autenticado consume `GET /api/accounts/{accountId}/products`.
- El checkout storefront crea y envía órdenes, pero no crea ni confirma pagos.
- El frontend informa el método de pago en metadata y el backend valida el pago después.
- Favoritos y carrito remoto se sincronizan por `business_partner_id` autenticado.
- Para agentes/IA, la entrada operativa es [AGENTS.md](/home/andis/simpleEcommerce/AGENTS.md).

## Observabilidad remota opcional

Si backend expone un collector, el frontend puede enviar batches de eventos configurando en `ecommerce-config`:

```json
{
  "observability": {
    "enabled": true,
    "endpoint": "https://api.ejemplo.com/api/accounts/{accountId}/frontend-events",
    "flushIntervalMs": 15000,
    "maxQueueSize": 50,
    "useBeacon": true
  }
}
```

Cada evento incluye `sessionId`, `accountId`, `channel`, `pathname` y detalles del dominio como `checkoutId`, `orderNumber` o códigos de soporte.
