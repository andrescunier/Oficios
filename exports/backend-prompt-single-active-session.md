# Prompt para el agente del backend (`simpleFastApi`)

> Copiar y pegar tal cual al agente que trabaja en `simpleFastApi`. Incluye contrato, migración SQL y reglas de aceptación.

---

## Tarea

Implementar la política **"una sola sesión activa por `user_id`"** (single-active-session). Cuando el mismo usuario inicia sesión en otro lugar, la sesión anterior queda invalidada inmediatamente y la próxima request de esa sesión vieja recibe `401` con un código específico para que el storefront muestre el cartel correcto.

## Contrato (acordado con el storefront)

Documentado en `simpleEcommerce/docs/BACKEND_CONTRACT.md` › sección **"Sesión activa única por usuario (single-active-session)"**. Resumen:

- al `POST /api/auth/login` exitoso, registrar el `jti` / `session_id` del nuevo token como **el** vigente para ese `user_id` (UPSERT) y descartar cualquier vigencia anterior.
- en el middleware de auth (todas las rutas que requieren JWT), validar que el `jti` / `session_id` del token coincide con el vigente.
- si NO coincide ⇒ responder `401` con `code = "E1010"` y `message` legible. El storefront mapea ese código a la pantalla `/login?session=superseded` ("iniciaste sesión en otro dispositivo").
- si el token simplemente expiró por TTL ⇒ seguir respondiendo `401` como hoy (sin `E1010`); el front lo trata como `expired`.
- `POST /api/auth/logout` debe borrar la fila correspondiente (idempotente).
- `GET /api/auth/me` aplica la misma validación.

Scope del registro: **por `user_id` global**, NO por `(account_id, user_id)`. Un humano debe estar en un solo lugar a la vez aún cuando opere varios tenants.

## Migración SQL

Ya definida en `simpleEcommerce/exports/backend-create-user-active-sessions.sql`:

```sql
CREATE TABLE IF NOT EXISTS user_active_sessions (
    user_id     UUID        NOT NULL PRIMARY KEY,
    session_id  TEXT        NOT NULL,
    issued_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_agent  TEXT,
    ip          INET
);
CREATE INDEX IF NOT EXISTS idx_user_active_sessions_session
    ON user_active_sessions (session_id);
```

PK por `user_id` ⇒ el `INSERT ... ON CONFLICT (user_id) DO UPDATE SET session_id = EXCLUDED.session_id, issued_at = NOW()` da idempotencia natural y reemplazo atómico.

## Cambios esperados en `simpleFastApi`

1. **Generación de tokens (`auth/login`)**:
   - asegurarse de incluir un `jti` único en el JWT (o emitir un `session_id` separado y persistirlo en el access_token).
   - tras emitir el token, hacer el UPSERT en `user_active_sessions`.

2. **Middleware de auth** (el que hoy decodifica el JWT y resuelve `current_user`):
   - además de validar firma y expiración, leer `jti` del payload y comparar con `session_id` vigente en `user_active_sessions WHERE user_id = ?`.
   - si no hay fila o no coincide ⇒ `HTTPException(status_code=401, detail={"code": "E1010", "message": "Sesión cerrada por un nuevo inicio de sesión"})`.
   - performance: cachear con TTL corto (Redis o LRU en proceso) para no consultar DB por request. Invalidación: borrar la entrada de cache al login/logout.

3. **`auth/logout`**: ejecutar `DELETE FROM user_active_sessions WHERE user_id = $1`. No fallar si no hay fila.

4. **Tests**:
   - login → request OK.
   - segundo login del mismo user (otro device) → primer token responde `401 E1010` en la siguiente request; segundo token sigue funcionando.
   - logout limpia la fila y deja el token revocado para usos posteriores.
   - dos users distintos pueden tener sus propias sesiones simultáneas (cada uno en su fila).

5. **Documentación**: actualizar `documentacion.md` del backend con la nueva tabla, la sección de seguridad y el código `E1010`.

## Cosas a NO hacer

- NO scopear por `(account_id, user_id)`: un humano debería estar en un solo lugar.
- NO usar 403 ni 419: el storefront detecta `401 + code=E1010`.
- NO romper la respuesta actual de `auth/login`: agregar campos opcionales si querés (ej. `session_id`), pero mantener `access_token`, `user`, `account`, `business_partner_id`, etc.
- NO inventar endpoints nuevos públicos para "kick session": no hace falta, el upsert al login alcanza.

## Frontend ya listo

El storefront (este repo, `simpleEcommerce`) ya:
- detecta `401 + code = E1010` (o `SESSION_REVOKED` / `SESSION_SUPERSEDED`) y redirige a `/login?session=superseded`.
- muestra cartel: "Tu sesión fue cerrada porque iniciaste sesión en otro dispositivo. Volvé a ingresar para continuar acá."
- mantiene además un fallback intra-browser via `BroadcastChannel` para UX inmediata en tabs del mismo navegador.

Ver: `simpleEcommerce/src/services/httpClient.ts` (`handleUnauthorized`), `simpleEcommerce/src/pages/Login.tsx`, `simpleEcommerce/src/features/auth/activeSession.ts`.

## Definition of Done

- [ ] Tabla `user_active_sessions` creada en QA.
- [ ] `auth/login` UPSERT-ea la fila.
- [ ] Middleware valida y devuelve `401 + code=E1010` si no coincide.
- [ ] `auth/logout` borra la fila.
- [ ] Tests automatizados cubren los 4 escenarios listados.
- [ ] Doc backend actualizada.
- [ ] Validado manualmente: login en pestaña A, login en pestaña B, refresco de A redirige a `/login?session=superseded`.
