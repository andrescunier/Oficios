# Agent Guide

Guia rapida para agentes que tengan que entender, modificar o verificar este storefront.

## Lectura inicial

1. `README.md`: setup, comandos y variables minimas.
2. `docs/BACKEND_ALIGNMENT.md`: matriz de endpoints y reglas de integracion con `simpleFastApi`.
3. `docs/BACKEND_CONTRACT.md`: contrato operativo local del storefront.
4. Backend canonico: `/home/andis/simpleFastApi/docs/FRONTEND_STOREFRONT_CONTRACT.md`.

## Estado del proyecto

- Aplicacion: storefront OficiosHub (marketplace de personas con oficio). Repo: `andrescunier/Oficios`.
- Stack: React 19, Vite 6, TypeScript, Zustand, React Query, Axios, Tailwind CSS 4, Vitest y Playwright.
- Backend esperado: `/home/andis/simpleFastApi`.
- Bootstrap permitido: solo `VITE_API_BASE_URL` y `VITE_ACCOUNT_ID`.
- Todo branding, textos, features, pagos, shipping, newsletter, analytics y UI deben venir de `GET /api/accounts/{account_id}/ecommerce-config`.

## Estructura util

- `src/config/runtimeSchema.ts`: puerta de entrada y validacion del payload de tenant.
- `src/services/tenantConfigService.ts`: fetch/cache/fallback del bootstrap.
- `src/config/api.ts`: endpoints permitidos para storefront.
- `src/services/httpClient.ts`: baseURL dinamico, headers de tenant y bearer token.
- `src/services/authService.ts`: login, logout, me y registro simple.
- `src/services/productService.ts`: catalogo publico/autenticado.
- `src/services/orderService.ts`: checkout y ordenes storefront.
- `src/services/favoritesService.ts`: favoritos remotos por BusinessPartner.
- `src/services/cartSyncService.ts`: snapshot remoto del carrito por BusinessPartner.
- `src/store/useStore.ts`: estado local y sincronizacion de carrito/favoritos.
- `e2e/support/mockApi.ts`: mocks deterministas de Playwright.

## Reglas de integracion backend

- No agregar variables de entorno nuevas para configuracion de negocio o UI.
- No consumir endpoints fuera de `docs/BACKEND_ALIGNMENT.md` sin actualizar contrato, tests y docs.
- Para rutas account-scoped usar `account_id` del runtime y dejar que `httpClient` agregue `X-Account-ID`.
- Auth usa `Authorization: Bearer <token>`; `business_partner_id` canonico sale de `data.business_partner_id`.
- Catalogo anonimo usa `/products/public`; catalogo autenticado usa `/products`.
- El storefront no confirma pagos ni ejecuta fulfillment/backoffice.
- Si backend y docs locales discrepan, validar contra codigo/tests/OpenAPI de `simpleFastApi` antes de cambiar helpers frontend.

## Comandos frecuentes

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm test:run
pnpm build:check
pnpm test:e2e
```

## Checklist antes de cerrar

- Confirmar que `API_ENDPOINTS` coincide con la matriz de `docs/BACKEND_ALIGNMENT.md`.
- Ejecutar tests relevantes; si el cambio toca contrato, correr `pnpm typecheck`, `pnpm test:run` y `pnpm build:check`.
- Actualizar mocks E2E cuando cambien payloads backend.
- No revertir cambios locales ajenos; este repo suele tener trabajo en progreso.
