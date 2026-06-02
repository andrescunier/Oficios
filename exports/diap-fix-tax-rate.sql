-- ============================================================================
-- DIAP: Corregir defaultTaxRate a 0 (precios ya incluyen IVA en Argentina)
-- Afecta: simple_ecommerce_configs
-- Cuentas: 15ef15b2-1a3b-4a56-be99-f618ebdb8a4a (Warpla / DIAP activo)
--          bed2df35-717f-4900-a4b1-7c3a7fb59b7c (diapstore)
-- Ejecutar:
--   PGPASSWORD=simplepass psql -h 100.105.218.66 -U simpleuser -d simpledb \
--     -f exports/diap-fix-tax-rate.sql
-- Después de aplicar: limpiar caché del browser (localStorage key ecommerce-config:*)
-- ============================================================================

UPDATE simple_ecommerce_configs
SET config = jsonb_set(
    config,
    '{business,defaultTaxRate}',
    '0'::jsonb
)
WHERE account_id IN (
    '15ef15b2-1a3b-4a56-be99-f618ebdb8a4a',
    'bed2df35-717f-4900-a4b1-7c3a7fb59b7c'
);

-- Verificar resultado
SELECT account_id, config->'business'->>'defaultTaxRate' AS tax_rate_result
FROM simple_ecommerce_configs
WHERE account_id IN (
    '15ef15b2-1a3b-4a56-be99-f618ebdb8a4a',
    'bed2df35-717f-4900-a4b1-7c3a7fb59b7c'
);
