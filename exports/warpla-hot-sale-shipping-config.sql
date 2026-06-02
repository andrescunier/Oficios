-- =============================================================================
-- UPDATE ecommerce-config para Warpla Skate Shop
-- Configura mensajes Hot Sale y confirma envío fijo a todo el país por $5.000
-- Tabla: simple_ecommerce_configs
-- Account ID: 15ef15b2-1a3b-4a56-be99-f618ebdb8a4a
-- =============================================================================
-- Ejecutar manualmente en la base del backend, por ejemplo:
--   psql -h <host> -U <user> -d <db> -f exports/warpla-hot-sale-shipping-config.sql
-- Luego refrescar la app o limpiar localStorage si el navegador conserva cache de ecommerce-config.
-- =============================================================================

UPDATE simple_ecommerce_configs
SET
  config = config
    || jsonb_build_object(
      'business', COALESCE(config->'business', '{}'::jsonb) || jsonb_build_object(
        'freeShippingThreshold', 0
      ),
      'shipping', COALESCE(config->'shipping', '{}'::jsonb) || jsonb_build_object(
        'enabled', true,
        'mode', 'flat_rate',
        'bannerText', 'Envío a todo el país por $5.000',
        'label', 'Envío',
        'freeLabel', 'Gratis',
        'pendingLabel', 'A calcular',
        'drawerMessage', 'Envío a todo el país por $5.000',
        'chargedMessage', 'El costo de envío es $5.000',
        'productBadgeTitle', 'Envío a todo el país',
        'productBadgeDescription', 'Costo fijo de $5.000',
        'chargeAmount', 5000,
        'chargeProductId', '85138f76-1005-4e8b-9cc1-c16c451e2af5',
        'chargeProductSku', 'ENVIO',
        'chargeProductDescription', 'Cargo de envío',
        'taxRate', 0
      ),
      'header', COALESCE(config->'header', '{}'::jsonb) || jsonb_build_object(
        'promoBarEnabled', true,
        'promoBarText', 'HOT SALE: promos por tiempo limitado - Envío fijo a todo el país $5.000',
        'topBarMessage', 'HOT SALE: promos por tiempo limitado - Envío fijo a todo el país $5.000'
      ),
      'ui', COALESCE(config->'ui', '{}'::jsonb) || jsonb_build_object(
        'headerPromoMessages', jsonb_build_array(
          'HOT SALE: promos por tiempo limitado',
          'Envío a todo el país: $5.000 fijo',
          'Skate, ruedas y trucks con ofertas Hot Sale',
          'Compra online y recibilo en todo el país'
        ),
        'cartPageShippingBadge', 'Envío fijo',
        'cartPageShippingDesc', 'A todo el país por $5.000',
        'checkoutShippingLabel', 'Envío'
      )
    ),
  updated_at = NOW()
WHERE account_id = '15ef15b2-1a3b-4a56-be99-f618ebdb8a4a';

-- Verificar resultado
SELECT
  account_id,
  config->'shipping' AS shipping,
  config->'business'->>'freeShippingThreshold' AS free_shipping_threshold,
  config->'ui'->'headerPromoMessages' AS header_promo_messages,
  config->'header'->>'promoBarText' AS promo_bar_text,
  updated_at
FROM simple_ecommerce_configs
WHERE account_id = '15ef15b2-1a3b-4a56-be99-f618ebdb8a4a';