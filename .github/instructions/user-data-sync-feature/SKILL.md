---
description: Agregar una feature de usuario sincronizada con el backend (estado por usuario que persiste entre dispositivos). Aplica cuando se quiere reemplazar `localStorage`-only por una entidad propia en `simpleFastApi`. Ejemplos típicos: favoritos, wishlist, direcciones guardadas, listas de comparación, productos vistos, alertas de stock.
---

# Skill: feature de usuario sincronizada con backend

Esta skill describe el patrón canónico para agregar una feature que:

1. Tiene estado **por usuario autenticado** (no por dispositivo).
2. Necesita persistir entre logins / dispositivos.
3. Tolera errores de red (offline-friendly, optimista).

## Cuándo aplica

- El feature es estado del **cliente** (business partner), no de la cuenta tenant.
- Hoy está guardado solo en `localStorage` y se quiere migrar.
- Hoy está hardcodeado y se quiere persistir.
- Hay riesgo de "lo perdí al cambiar de navegador".

NO aplica para: configuración del tenant (va en `ecommerce-config`), datos de orden (van en `sales-orders`), eventos analíticos (van en `frontend-events`).

## Decisión de shape: tabla dedicada vs `person_metadata`

Elegí **tabla dedicada** cuando:
- la cardinalidad puede crecer (>50 ítems típicos).
- querés indexar/ordenar por algún campo (fecha, prioridad).
- el ítem tiene metadatos propios (created_at, notas, etc.).
- esperás cruzarlo en queries (ej. "productos favoritos más comprados").

Elegí **`person_metadata.<key>`** cuando:
- es un escalar o array chico y estable (preferencia de tema, idioma, opt-in WhatsApp).
- no necesitás histórico ni timestamps.
- el backend ya expone `PATCH /persons/:id/metadata` con merge.

## Pasos canónicos

### 1. Backend (`simpleFastApi`)

#### 1.1 Modelo y migración

Crear tabla con PK compuesta `(account_id, business_partner_id, <entidad_id>)` para garantizar:
- aislamiento por tenant
- aislamiento por cliente
- idempotencia natural en `POST` (UPSERT vía `ON CONFLICT DO NOTHING`)

Ejemplo: [`exports/backend-create-customer-favorites.sql`](../../exports/backend-create-customer-favorites.sql).

#### 1.2 Endpoints

Patrón REST:

```http
GET    /api/accounts/{account_id}/customers/{business_partner_id}/<recurso>
POST   /api/accounts/{account_id}/customers/{business_partner_id}/<recurso>
DELETE /api/accounts/{account_id}/customers/{business_partner_id}/<recurso>/{item_id}
```

Reglas obligatorias:
- requieren `Authorization: Bearer <token>` y `X-Account-ID`.
- el backend DEBE validar que `business_partner_id` corresponde al usuario autenticado del token. Si no, responder `403 E3002`.
- `POST` y `DELETE` deben ser **idempotentes**.
- `GET` ordena por `created_at DESC` por defecto.

#### 1.3 Documentar contrato

Agregar sección dedicada en `docs/BACKEND_CONTRACT.md` con: endpoints, reglas operativas, storage, shape de request/response, errores esperados.

> Si el endpoint no está en `BACKEND_CONTRACT.md`, no existe para este storefront.

### 2. Frontend

#### 2.1 Endpoints

Agregar en `src/config/api.ts` dentro de `API_ENDPOINTS`:

```ts
RECURSO: (accountId: string, businessPartnerId: string) =>
  `/api/accounts/${accountId}/customers/${businessPartnerId}/<recurso>`,
RECURSO_ITEM: (accountId: string, businessPartnerId: string, itemId: string) =>
  `/api/accounts/${accountId}/customers/${businessPartnerId}/<recurso>/${itemId}`,
```

#### 2.2 Servicio

Crear `src/services/<recurso>Service.ts` exponiendo `list / add / remove`. Patrón:

- usar `httpClient` (envía token + `X-Account-ID` automáticamente).
- normalizar la respuesta (el backend puede devolver `data: []` o `data: { items: [] }`).
- nunca lanzar: devolver `[]` / `false` y loguear con `log.store.error`. La UI ya hizo update optimista.
- usar `getActiveAccountId()` y `getBusinessPartnerId()` (de `@/features/auth/session`); si falta alguno, devolver early.

Referencia: [`src/services/favoritesService.ts`](../../src/services/favoritesService.ts).

#### 2.3 Store (Zustand)

En `src/store/useStore.ts`:

1. Mantener un **caché local** por usuario en `localStorage` (`<feature>-<userId>`) para hidratación inmediata sin esperar la red.
2. En `login`: setear inmediatamente el caché local y disparar `void hydrate<Recurso>FromBackend(...)` no bloqueante.
3. En `logout`: limpiar el estado en memoria (NO el caché en localStorage; sirve para próximo login).
4. En cada mutación (`add`/`remove`):
   - **update optimista** primero (set + cacheo local + notificación de éxito).
   - llamar al servicio `void` (no awaitear).
   - si falla, **revertir** el estado y mostrar notificación de error.
5. La fuente de verdad sigue siendo el backend; la próxima hidratación corrige cualquier deriva.

Referencia: bloque `addToFavorites / removeFromFavorites / hydrateFavoritesFromBackend` en `src/store/useStore.ts`.

### 3. Tests

- Mockear `httpClient` y validar que `add` envía `{ <campo>_id }` y que `remove` usa la ruta con id.
- Validar que la normalización tolera ambas shapes (`data: []` y `data.items: []`).
- En el store: verificar que un fallo de red revierte el estado.

### 4. Documentación

Actualizar:
- `docs/BACKEND_CONTRACT.md` — sección del recurso.
- `documentacion.md` — mencionar el feature y dónde vive su estado (backend + caché local).
- Si hay SQL de migración, dejarlo en `exports/backend-create-<recurso>.sql`.

## Anti-patrones

- ❌ Guardar el estado solo en `localStorage` y llamarlo "feature de usuario".
- ❌ Awaitear el `POST/DELETE` en el handler del click (sensación lenta + bloquea UI).
- ❌ Pisar el estado optimista con la respuesta del servidor (causa flicker).
- ❌ Usar el `user.id` (auth user) como customer_id; siempre usar `business_partner_id`.
- ❌ Endpoints sin `account_id` en la URL (rompe multi-tenant).
- ❌ Crear endpoints `/api/<recurso>` planos sin scoping por cliente.
- ❌ Meter en `person_metadata` cosas con histórico o cardinalidad alta.

## Checklist final

- [ ] Migración SQL en `exports/`.
- [ ] Endpoints documentados en `docs/BACKEND_CONTRACT.md`.
- [ ] `API_ENDPOINTS` actualizado en `src/config/api.ts`.
- [ ] Service en `src/services/`.
- [ ] Store con update optimista + revert en error + caché local.
- [ ] Hidratación desde backend en `login`.
- [ ] Notificación de éxito en optimista, de error en revert.
- [ ] `documentacion.md` actualizado.
- [ ] `pnpm tsc --noEmit` y `pnpm lint` limpios.
