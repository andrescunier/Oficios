-- =============================================================================
-- Migración backend: tabla user_active_sessions
-- Soporta la política "una sesión activa por usuario" (single-active-session).
-- Contrato: simpleEcommerce/docs/BACKEND_CONTRACT.md › "Sesión activa única por usuario"
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_active_sessions (
    user_id     UUID        NOT NULL PRIMARY KEY,
    session_id  TEXT        NOT NULL,   -- jti del JWT vigente o uuid generado al login
    issued_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_agent  TEXT,                   -- opcional, para diagnóstico
    ip          INET                    -- opcional, para diagnóstico
);

CREATE INDEX IF NOT EXISTS idx_user_active_sessions_session
    ON user_active_sessions (session_id);

COMMENT ON TABLE user_active_sessions IS
    'Registro de la única sesión vigente por user_id. Login posterior reemplaza al anterior. Logout y revocación borran la fila.';
