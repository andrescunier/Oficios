# Copilot — Instrucciones del repositorio

Este repo es el storefront `simpleEcommerce` (React + Vite, contra `simpleFastApi`).

## Lectura obligatoria al empezar

- [`docs/BACKEND_CONTRACT.md`](../docs/BACKEND_CONTRACT.md) — única fuente de verdad de endpoints aprobados. Si no está acá, no existe para este storefront.
- [`documentacion.md`](../documentacion.md) — referencia técnica del backend `simpleFastApi`.

## Convenciones del proyecto

- **Configuración del tenant**: todo lo visual/operativo viene del endpoint `GET /api/accounts/{account_id}/ecommerce-config`. NO hardcodear textos, íconos, colores, métodos de pago, ni medios de envío. Agregar al schema (`src/config/runtimeSchema.ts`), default (`src/config/runtime.ts`) y consumir desde el componente.
- **Multi-tenant**: toda URL de API debe scope-arse por `account_id`. Headers automáticos vía `httpClient` (`X-Account-ID`, `Authorization`).
- **Estado por usuario sincronizado con backend**: usar la skill [`.github/instructions/user-data-sync-feature/SKILL.md`](instructions/user-data-sync-feature/SKILL.md). Patrón: tabla dedicada por cliente + service en `src/services/` + update optimista con revert en `useStore`.
- **Identificadores**:
  - `user_id` → identidad de login.
  - `business_partner_id` → identidad de cliente comercial. **Es el que se usa para órdenes y para entidades por-cliente** (favoritos, direcciones, etc.). Recuperar vía `getBusinessPartnerId()` de `@/features/auth/session`.
- **No introducir nuevas claves de localStorage** sin un caso justificado (offline cache, draft, redirect). Estado durable va al backend.
- **Cambios de base de datos = manual del usuario**: NUNCA correr `alembic upgrade`, `alembic downgrade`, `psql`, `CREATE TABLE`, `ALTER TABLE`, ni ningún DDL/DML contra la base. Generar la migración (archivo en `alembic/versions/`) y/o el script SQL en `exports/`, dejar la sentencia lista, y avisar al usuario para que la corra manualmente. Aplica también al backend `/home/andis/simpleFastApi`.

## Stack

- React 18 + TypeScript/JSX, Vite 6.
- Zustand para estado global ([`src/store/useStore.ts`](../src/store/useStore.ts)).
- React Query para fetching cacheado.
- Tailwind v4 + shadcn/ui.
- Tests: Vitest + Playwright (e2e en `e2e/`).

## Comandos

- `pnpm dev` — dev server.
- `pnpm test` — Vitest.
- `pnpm tsc --noEmit` — type check.
- `pnpm lint` — eslint.

## Skills disponibles

- [`user-data-sync-feature`](instructions/user-data-sync-feature/SKILL.md) — agregar feature por-cliente sincronizada con backend (favoritos, wishlist, direcciones guardadas, etc.).
