-- =============================================================================
-- UPDATE ecommerce-config faltante para DIAP Store
-- Completa datos que el frontend actual espera desde GET /ecommerce-config.
-- Tabla: simple_ecommerce_configs
-- Account ID: bed2df35-717f-4900-a4b1-7c3a7fb59b7c
-- DB: simpledb | Host: 100.105.218.66:5432
-- =============================================================================
-- Ejecutar manualmente:
--   psql -h 100.105.218.66 -U simpleuser -d simpledb -f exports/diap-update-missing-api-config.sql
-- =============================================================================

UPDATE simple_ecommerce_configs
SET
  config = config
    || jsonb_build_object(
      'features', COALESCE(config->'features', '{}'::jsonb) || jsonb_build_object(
        'notifications', COALESCE(config->'features'->'notifications', 'false'::jsonb),
        'analytics', COALESCE(config->'features'->'analytics', 'false'::jsonb),
        'realPayments', COALESCE(config->'features'->'realPayments', 'false'::jsonb),
        'benefits', jsonb_build_array(
          jsonb_build_object(
            'icon', 'Truck',
            'title', 'Envio Gratis',
            'description', 'En compras seleccionadas'
          ),
          jsonb_build_object(
            'icon', 'RotateCcw',
            'title', 'Devolucion Facil',
            'description', 'Cambios y devoluciones simples'
          ),
          jsonb_build_object(
            'icon', 'Shield',
            'title', 'Compra Segura',
            'description', 'Protegemos tus datos'
          ),
          jsonb_build_object(
            'icon', 'CreditCard',
            'title', 'Multiples Pagos',
            'description', 'Transferencia y medios seleccionados'
          )
        )
      ),

      'ui', COALESCE(config->'ui', '{}'::jsonb) || jsonb_build_object(
        'headerPromoMessages', jsonb_build_array(
          'Tecnología Profesional para Empresas',
          '¡Envío gratis en todas tus compras!',
          'Hasta 12 cuotas sin interés',
          'Envíos a todo el país'
        ),
        'headerAllProductsLabel', 'Todos los Productos',
        'headerLoginLabel', 'Ingresar',
        'headerRegisterLabel', 'Registrarse',
        'homeFeaturedTitle', 'Productos Destacados',
        'homeFeaturedSubtitle', 'Los productos más populares de nuestra tienda',
        'homeViewAllLabel', 'Ver Todos',
        'showHomeBenefits', true
      ),

      'header', COALESCE(config->'header', '{}'::jsonb) || jsonb_build_object(
        'showSearch', true,
        'showCategoriesMenu', true,
        'showFavorites', true,
        'showOrders', true,
        'showAccount', true,
        'showCart', true,
        'topBarMessage', 'Tecnología Profesional para Empresas - ¡Envío gratis en compras superiores a $50.000!',
        'topBarHref', '/envios',
        'promoBarEnabled', true,
        'promoBarText', 'Tecnología Profesional para Empresas - ¡Envío gratis en compras superiores a $50.000!'
      ),

      'pages', jsonb_build_object(
        'about', jsonb_build_object('enabled', false),
        'contact', jsonb_build_object('enabled', false),
        'cookies', jsonb_build_object('enabled', false),
        'terms', jsonb_build_object('enabled', false),
        'privacy', jsonb_build_object('enabled', false),
        'returns', jsonb_build_object('enabled', false),
        'warranty', jsonb_build_object('enabled', false),
        'legalNotice', jsonb_build_object('enabled', false)
      )
    ),
  updated_at = NOW()
WHERE account_id = 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c';

-- Verificar resultado
SELECT
  account_id,
  jsonb_array_length(config->'features'->'benefits') AS benefits_count,
  config->'ui'->'headerPromoMessages' AS header_promo_messages,
  jsonb_typeof(config->'pages'->'about') AS pages_about_type,
  config->'ui'->>'homeFeaturedSubtitle' AS home_featured_subtitle,
  updated_at
FROM simple_ecommerce_configs
WHERE account_id = 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c';