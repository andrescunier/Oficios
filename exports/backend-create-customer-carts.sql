-- =============================================================================
-- Migración backend: tabla customer_carts
-- Soporta el feature "Carrito sincronizado con cliente" del storefront.
-- Contrato: docs/BACKEND_CONTRACT.md › sección "Carrito del cliente"
-- =============================================================================

CREATE TABLE IF NOT EXISTS customer_carts (
    account_id           UUID        NOT NULL,
    business_partner_id  UUID        NOT NULL,
    cart                 JSONB       NOT NULL DEFAULT '{}'::jsonb,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (account_id, business_partner_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_carts_updated
    ON customer_carts (account_id, updated_at DESC);

COMMENT ON TABLE customer_carts IS
    'Snapshot del carrito por cliente (business partner). Owner: storefront. PUT reemplaza, DELETE limpia.';
COMMENT ON COLUMN customer_carts.cart IS
    'JSON shape acordado con el storefront: { items: [{ line_id, product_id, variant_id?, quantity, unit_price, selected_options?, snapshot:{ name, image_url?, sku?, currency } }], currency }. El backend NO interpreta este JSON.';
