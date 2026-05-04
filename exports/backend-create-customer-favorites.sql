-- =============================================================================
-- Migración backend: tabla customer_favorites
-- Soporta el feature "Favoritos sincronizados con cliente" del storefront.
-- Contrato: docs/BACKEND_CONTRACT.md › sección "Favoritos del cliente"
-- =============================================================================

CREATE TABLE IF NOT EXISTS customer_favorites (
    account_id           UUID        NOT NULL,
    business_partner_id  UUID        NOT NULL,
    product_id           UUID        NOT NULL,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (account_id, business_partner_id, product_id)
);

-- Índice para el listado ordenado por fecha desc
CREATE INDEX IF NOT EXISTS idx_customer_favorites_listing
    ON customer_favorites (account_id, business_partner_id, created_at DESC);

-- (Opcional) FK al catálogo si querés borrado en cascada al eliminar producto:
-- ALTER TABLE customer_favorites
--   ADD CONSTRAINT fk_customer_favorites_product
--   FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

COMMENT ON TABLE customer_favorites IS
    'Favoritos por cliente (business partner). Owner: storefront. Idempotente vía PK.';
