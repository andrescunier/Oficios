-- =============================================================================
-- UPDATE taxonomia productos + categorias storefront para Warpla Skate Shop
-- Tabla productos: simple_products (metadata JSONB)
-- Tabla config: simple_ecommerce_configs (images.categories)
-- Account ID: 15ef15b2-1a3b-4a56-be99-f618ebdb8a4a
-- =============================================================================
-- Ejecutar manualmente en la base del backend, por ejemplo:
--   psql -h <host> -U <user> -d <db> -f exports/warpla-product-taxonomy-config.sql
-- Luego refrescar la app o limpiar localStorage si el navegador conserva cache de ecommerce-config.
-- =============================================================================

BEGIN;

-- Calzado / Ojotas
UPDATE simple_products
SET
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'family', 'calzado',
    'category', 'calzado-ojotas',
    'subcategory', 'ojotas'
  ),
  updated_at = NOW()
WHERE account_id = '15ef15b2-1a3b-4a56-be99-f618ebdb8a4a'
  AND (
    sku LIKE 'OAA-%'
    OR sku LIKE 'AO-%'
    OR sku LIKE 'CO-%'
  );

-- Calzado / Zapatillas infantiles
UPDATE simple_products
SET
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'family', 'calzado',
    'category', 'calzado-zapatillas-infantil',
    'subcategory', 'zapatillas-infantiles'
  ),
  updated_at = NOW()
WHERE account_id = '15ef15b2-1a3b-4a56-be99-f618ebdb8a4a'
  AND (
    sku LIKE 'VKI-%'
    OR sku LIKE 'VCL-%'
    OR sku LIKE 'ADV-%'
    OR sku LIKE 'ZEU-%'
    OR sku = 'AC-NB-34'
  );

-- Calzado / Zapatillas adultas
UPDATE simple_products
SET
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'family', 'calzado',
    'category', 'calzado-zapatillas-adulto',
    'subcategory', 'zapatillas-adultas'
  ),
  updated_at = NOW()
WHERE account_id = '15ef15b2-1a3b-4a56-be99-f618ebdb8a4a'
  AND (
    sku LIKE 'AF%'
    OR sku LIKE 'NDP-%'
    OR sku LIKE 'VKA-%'
    OR sku LIKE 'VKAL-%'
    OR sku IN ('AC-NB-36', 'AC-NB-37', 'AC-NB-38', 'AC-NB-39', 'AC-NB-40', 'AC-NB-41', 'AC-NB-42', 'AC-NB-43')
  );

-- Skateboarding / Skates armados
UPDATE simple_products
SET
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'family', 'skateboarding',
    'category', 'skateboarding-armados',
    'subcategory', 'skates-armados'
  ),
  updated_at = NOW()
WHERE account_id = '15ef15b2-1a3b-4a56-be99-f618ebdb8a4a'
  AND sku IN ('TSP-MAP-80', 'TSW8-GUA-80');

-- Skateboarding / Tablas
UPDATE simple_products
SET
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'family', 'skateboarding',
    'category', 'skateboarding-tablas',
    'subcategory', 'tablas'
  ),
  updated_at = NOW()
WHERE account_id = '15ef15b2-1a3b-4a56-be99-f618ebdb8a4a'
  AND sku LIKE 'TS%'
  AND sku NOT IN ('TSP-MAP-80', 'TSW8-GUA-80');

-- Skateboarding / Ruedas
UPDATE simple_products
SET
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'family', 'skateboarding',
    'category', 'skateboarding-ruedas',
    'subcategory', 'ruedas'
  ),
  updated_at = NOW()
WHERE account_id = '15ef15b2-1a3b-4a56-be99-f618ebdb8a4a'
  AND sku LIKE 'RS%';

-- Skateboarding / Rulemanes
UPDATE simple_products
SET
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'family', 'skateboarding',
    'category', 'skateboarding-rulemanes',
    'subcategory', 'rulemanes'
  ),
  updated_at = NOW()
WHERE account_id = '15ef15b2-1a3b-4a56-be99-f618ebdb8a4a'
  AND sku LIKE 'RLW-%';

-- Skateboarding / Hardware
UPDATE simple_products
SET
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'family', 'skateboarding',
    'category', 'skateboarding-hardware',
    'subcategory', 'hardware'
  ),
  updated_at = NOW()
WHERE account_id = '15ef15b2-1a3b-4a56-be99-f618ebdb8a4a'
  AND sku LIKE 'TR%';

-- Producto tecnico de checkout: mantener activo, pero fuera del canal ecommerce.
UPDATE simple_products
SET
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'family', 'checkout',
    'category', 'checkout-shipping',
    'subcategory', 'shipping-charge',
    'channels', jsonb_build_array('checkout')
  ),
  updated_at = NOW()
WHERE account_id = '15ef15b2-1a3b-4a56-be99-f618ebdb8a4a'
  AND sku = 'ENVIO';

-- Categorias visibles del storefront. Se dejan solo secciones con productos actuales.
UPDATE simple_ecommerce_configs
SET
  config = config || jsonb_build_object(
    'images', COALESCE(config->'images', '{}'::jsonb) || jsonb_build_object(
      'categories', jsonb_build_array(
        jsonb_build_object(
          'name', 'Calzado',
          'image', 'https://www.cumar.com.ar/CDN/warpla/categories/zapatilla-urbana-hombre.jpg',
          'link', '/categoria/calzado',
          'description', 'Zapatillas y ojotas para todos los días.',
          'slug', 'calzado',
          'group', 'Calzado',
          'searchTerms', jsonb_build_array('calzado', 'zapatillas', 'ojotas', 'vans', 'nike', 'adidas'),
          'productCategories', jsonb_build_array('calzado'),
          'subcategories', jsonb_build_array(
            jsonb_build_object(
              'name', 'Zapatillas adultas',
              'image', 'https://www.cumar.com.ar/CDN/warpla/categories/zapatilla-urbana-hombre.jpg',
              'link', '/categoria/calzado/zapatillas-adultas',
              'description', 'Modelos urbanos y skate para adultos.',
              'slug', 'zapatillas-adultas',
              'group', 'Calzado',
              'searchTerms', jsonb_build_array('zapatillas adultas', 'nike', 'vans', 'adidas', 'air force', 'campus'),
              'productCategories', jsonb_build_array('calzado-zapatillas-adulto'),
              'subcategories', jsonb_build_array()
            ),
            jsonb_build_object(
              'name', 'Zapatillas infantiles',
              'image', 'https://www.cumar.com.ar/CDN/warpla/categories/zapatilla-urbana-nino.jpg',
              'link', '/categoria/calzado/zapatillas-infantiles',
              'description', 'Zapatillas para chicos y talles pequeños.',
              'slug', 'zapatillas-infantiles',
              'group', 'Calzado',
              'searchTerms', jsonb_build_array('zapatillas infantiles', 'niños', 'ninos', 'kids', 'infantil'),
              'productCategories', jsonb_build_array('calzado-zapatillas-infantil'),
              'subcategories', jsonb_build_array()
            ),
            jsonb_build_object(
              'name', 'Ojotas',
              'image', 'https://www.cumar.com.ar/CDN/warpla/categories/ojotas-sandalias.jpg',
              'link', '/categoria/calzado/ojotas',
              'description', 'Ojotas y sandalias.',
              'slug', 'ojotas',
              'group', 'Calzado',
              'searchTerms', jsonb_build_array('ojotas', 'sandalias', 'adidas', 'clasica'),
              'productCategories', jsonb_build_array('calzado-ojotas'),
              'subcategories', jsonb_build_array()
            )
          )
        ),
        jsonb_build_object(
          'name', 'Skateboarding',
          'image', 'https://www.cumar.com.ar/CDN/warpla/categories/tablas.jpg',
          'link', '/categoria/skateboarding',
          'description', 'Tablas, skates armados, ruedas, rulemanes y hardware.',
          'slug', 'skateboarding',
          'group', 'Skateboarding',
          'searchTerms', jsonb_build_array('skate', 'skateboarding', 'tablas', 'skates armados', 'ruedas', 'rulemanes', 'hardware'),
          'productCategories', jsonb_build_array('skateboarding'),
          'subcategories', jsonb_build_array(
            jsonb_build_object(
              'name', 'Tablas',
              'image', 'https://www.cumar.com.ar/CDN/warpla/categories/tablas.jpg',
              'link', '/categoria/skateboarding/tablas',
              'description', 'Tablas de skate.',
              'slug', 'tablas',
              'group', 'Skateboarding',
              'searchTerms', jsonb_build_array('tabla', 'tablas', 'deck', 'skate'),
              'productCategories', jsonb_build_array('skateboarding-tablas'),
              'subcategories', jsonb_build_array()
            ),
            jsonb_build_object(
              'name', 'Skates armados',
              'image', 'https://www.cumar.com.ar/CDN/warpla/categories/tablas.jpg',
              'link', '/categoria/skateboarding/skates-armados',
              'description', 'Skates completos listos para andar.',
              'slug', 'skates-armados',
              'group', 'Skateboarding',
              'searchTerms', jsonb_build_array('skate armado', 'skates armados', 'completo', 'primitive', 'whiro'),
              'productCategories', jsonb_build_array('skateboarding-armados'),
              'subcategories', jsonb_build_array()
            ),
            jsonb_build_object(
              'name', 'Ruedas',
              'image', 'https://www.cumar.com.ar/CDN/warpla/categories/ruedas.jpg',
              'link', '/categoria/skateboarding/ruedas',
              'description', 'Ruedas para skate.',
              'slug', 'ruedas',
              'group', 'Skateboarding',
              'searchTerms', jsonb_build_array('rueda', 'ruedas', 'wheels'),
              'productCategories', jsonb_build_array('skateboarding-ruedas'),
              'subcategories', jsonb_build_array()
            ),
            jsonb_build_object(
              'name', 'Rulemanes',
              'image', 'https://www.cumar.com.ar/CDN/warpla/categories/hardware.jpg',
              'link', '/categoria/skateboarding/rulemanes',
              'description', 'Rulemanes para skate.',
              'slug', 'rulemanes',
              'group', 'Skateboarding',
              'searchTerms', jsonb_build_array('rulemanes', 'ruleman', 'bearings', 'abec'),
              'productCategories', jsonb_build_array('skateboarding-rulemanes'),
              'subcategories', jsonb_build_array()
            ),
            jsonb_build_object(
              'name', 'Hardware',
              'image', 'https://www.cumar.com.ar/CDN/warpla/categories/hardware.jpg',
              'link', '/categoria/skateboarding/hardware',
              'description', 'Tornillos, accesorios y repuestos.',
              'slug', 'hardware',
              'group', 'Skateboarding',
              'searchTerms', jsonb_build_array('hardware', 'tornillos', 'accesorios', 'repuestos'),
              'productCategories', jsonb_build_array('skateboarding-hardware'),
              'subcategories', jsonb_build_array()
            )
          )
        )
      )
    )
  ),
  updated_at = NOW()
WHERE account_id = '15ef15b2-1a3b-4a56-be99-f618ebdb8a4a';

COMMIT;

-- Verificar conteos por categoria metadata
SELECT
  metadata->>'family' AS family,
  metadata->>'category' AS category,
  metadata->>'subcategory' AS subcategory,
  COUNT(*) AS products
FROM simple_products
WHERE account_id = '15ef15b2-1a3b-4a56-be99-f618ebdb8a4a'
GROUP BY 1, 2, 3
ORDER BY 1, 2, 3;

-- Verificar categorias visibles del storefront
SELECT
  config->'images'->'categories' AS storefront_categories
FROM simple_ecommerce_configs
WHERE account_id = '15ef15b2-1a3b-4a56-be99-f618ebdb8a4a';