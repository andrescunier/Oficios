-- =============================================================================
-- Seed de productos de prueba Prestameya
-- Account ID: a622765f-8fc9-4a40-9d4a-2f175eb82aa0
-- Tablas: simple_product_families, simple_product_categories, simple_products,
--         simple_product_variant_options, simple_product_variants
-- =============================================================================
-- Ejecutar manualmente en la base:
--   psql -h <host> -U <user> -d <db> -f exports/prestameya-seed-test-products.sql
--
-- Script idempotente: usa ON CONFLICT por codigo/SKU y actualiza datos.
-- No borra productos existentes.
-- =============================================================================

BEGIN;

-- Familias base
INSERT INTO simple_product_families (id, account_id, code, name, status, metadata, created_at, updated_at)
VALUES
  ('7e1304d4-0fd4-4f5e-8e8a-49d5bb0e0001', 'a622765f-8fc9-4a40-9d4a-2f175eb82aa0', 'prestameya', 'Prestameya', 'active', '{"seed":"prestameya-test-products"}'::jsonb, NOW(), NOW()),
  ('7e1304d4-0fd4-4f5e-8e8a-49d5bb0e0002', 'a622765f-8fc9-4a40-9d4a-2f175eb82aa0', 'tecnologia', 'Tecnologia', 'active', '{"seed":"prestameya-test-products"}'::jsonb, NOW(), NOW()),
  ('7e1304d4-0fd4-4f5e-8e8a-49d5bb0e0003', 'a622765f-8fc9-4a40-9d4a-2f175eb82aa0', 'hogar', 'Hogar', 'active', '{"seed":"prestameya-test-products"}'::jsonb, NOW(), NOW()),
  ('7e1304d4-0fd4-4f5e-8e8a-49d5bb0e0004', 'a622765f-8fc9-4a40-9d4a-2f175eb82aa0', 'emprender', 'Emprender', 'active', '{"seed":"prestameya-test-products"}'::jsonb, NOW(), NOW())
ON CONFLICT (account_id, code)
DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  metadata = simple_product_families.metadata || EXCLUDED.metadata,
  updated_at = NOW();

-- Categorias storefront
WITH families AS (
  SELECT code, id
  FROM simple_product_families
  WHERE account_id = 'a622765f-8fc9-4a40-9d4a-2f175eb82aa0'
)
INSERT INTO simple_product_categories (id, account_id, family_id, code, name, status, metadata, created_at, updated_at)
VALUES
  ('8e1304d4-0fd4-4f5e-8e8a-49d5bb0e0001', 'a622765f-8fc9-4a40-9d4a-2f175eb82aa0', (SELECT id FROM families WHERE code = 'prestameya'), 'productos', 'Todos los productos', 'active', '{"seed":"prestameya-test-products","image":"https://www.cumar.com.ar/CDN/prestameya/categories/productos.svg"}'::jsonb, NOW(), NOW()),
  ('8e1304d4-0fd4-4f5e-8e8a-49d5bb0e0002', 'a622765f-8fc9-4a40-9d4a-2f175eb82aa0', (SELECT id FROM families WHERE code = 'tecnologia'), 'tecnologia', 'Tecnologia', 'active', '{"seed":"prestameya-test-products","image":"https://www.cumar.com.ar/CDN/prestameya/categories/tecnologia.svg"}'::jsonb, NOW(), NOW()),
  ('8e1304d4-0fd4-4f5e-8e8a-49d5bb0e0003', 'a622765f-8fc9-4a40-9d4a-2f175eb82aa0', (SELECT id FROM families WHERE code = 'hogar'), 'hogar', 'Hogar', 'active', '{"seed":"prestameya-test-products","image":"https://www.cumar.com.ar/CDN/prestameya/categories/hogar.svg"}'::jsonb, NOW(), NOW()),
  ('8e1304d4-0fd4-4f5e-8e8a-49d5bb0e0004', 'a622765f-8fc9-4a40-9d4a-2f175eb82aa0', (SELECT id FROM families WHERE code = 'emprender'), 'emprender', 'Emprender', 'active', '{"seed":"prestameya-test-products","image":"https://www.cumar.com.ar/CDN/prestameya/categories/emprender.svg"}'::jsonb, NOW(), NOW())
ON CONFLICT (account_id, family_id, code)
DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  metadata = simple_product_categories.metadata || EXCLUDED.metadata,
  updated_at = NOW();

-- Productos de prueba
WITH taxonomy AS (
  SELECT
    f.code AS family_code,
    f.id AS family_id,
    c.code AS category_code,
    c.id AS category_id
  FROM simple_product_families f
  JOIN simple_product_categories c ON c.family_id = f.id AND c.account_id = f.account_id
  WHERE f.account_id = 'a622765f-8fc9-4a40-9d4a-2f175eb82aa0'
), seed_products AS (
  SELECT * FROM (VALUES
    ('9e1304d4-0fd4-4f5e-8e8a-49d5bb0e0001'::uuid, 'PRE-TECH-001', 'Celular Nova X 128GB', 'Smartphone 5G con pantalla AMOLED, 128GB y camara triple. Ideal para probar cuotas Prestameya.', 489999.00, 18.000, 'tecnologia', 'tecnologia', 'https://www.cumar.com.ar/CDN/prestameya/categories/tecnologia.svg', true, 559999.00, ARRAY['celular','smartphone','tecnologia']),
    ('9e1304d4-0fd4-4f5e-8e8a-49d5bb0e0002'::uuid, 'PRE-TECH-002', 'Notebook Lite 14 i5 512GB', 'Notebook liviana para estudio, trabajo remoto y uso diario.', 1249999.00, 9.000, 'tecnologia', 'tecnologia', 'https://www.cumar.com.ar/CDN/prestameya/categories/tecnologia.svg', true, 1399999.00, ARRAY['notebook','laptop','trabajo']),
    ('9e1304d4-0fd4-4f5e-8e8a-49d5bb0e0003'::uuid, 'PRE-TECH-003', 'Smart TV 50 4K Ultra', 'Televisor 4K con HDR, apps integradas y control por voz.', 799999.00, 12.000, 'tecnologia', 'tecnologia', 'https://www.cumar.com.ar/CDN/prestameya/categories/tecnologia.svg', true, 899999.00, ARRAY['tv','smart tv','4k']),
    ('9e1304d4-0fd4-4f5e-8e8a-49d5bb0e0004'::uuid, 'PRE-TECH-004', 'Auriculares Pro ANC', 'Auriculares Bluetooth con cancelacion activa de ruido y estuche de carga.', 129999.00, 35.000, 'tecnologia', 'tecnologia', 'https://www.cumar.com.ar/CDN/prestameya/categories/tecnologia.svg', false, NULL::numeric, ARRAY['auriculares','audio','bluetooth']),
    ('9e1304d4-0fd4-4f5e-8e8a-49d5bb0e0005'::uuid, 'PRE-TECH-005', 'Tablet Edu 10 64GB', 'Tablet de 10 pulgadas para clases, lectura y entretenimiento.', 269999.00, 22.000, 'tecnologia', 'tecnologia', 'https://www.cumar.com.ar/CDN/prestameya/categories/tecnologia.svg', false, 299999.00, ARRAY['tablet','educacion','tecnologia']),

    ('9e1304d4-0fd4-4f5e-8e8a-49d5bb0e0101'::uuid, 'PRE-HOG-001', 'Heladera No Frost 320L', 'Heladera familiar no frost con freezer superior y eficiencia energetica.', 1099999.00, 7.000, 'hogar', 'hogar', 'https://www.cumar.com.ar/CDN/prestameya/categories/hogar.svg', true, 1249999.00, ARRAY['heladera','hogar','electrodomestico']),
    ('9e1304d4-0fd4-4f5e-8e8a-49d5bb0e0102'::uuid, 'PRE-HOG-002', 'Lavarropas Automatico 8kg', 'Lavarropas automatico con programas rapidos y bajo consumo.', 689999.00, 10.000, 'hogar', 'hogar', 'https://www.cumar.com.ar/CDN/prestameya/categories/hogar.svg', true, 759999.00, ARRAY['lavarropas','hogar','electrodomestico']),
    ('9e1304d4-0fd4-4f5e-8e8a-49d5bb0e0103'::uuid, 'PRE-HOG-003', 'Aire Acondicionado Split 3000F', 'Split frio/calor para ambientes medianos, con funcion sleep.', 749999.00, 8.000, 'hogar', 'hogar', 'https://www.cumar.com.ar/CDN/prestameya/categories/hogar.svg', false, NULL::numeric, ARRAY['aire acondicionado','climatizacion','hogar']),
    ('9e1304d4-0fd4-4f5e-8e8a-49d5bb0e0104'::uuid, 'PRE-HOG-004', 'Cafetera Espresso Compacta', 'Cafetera espresso compacta con vaporizador para leche.', 219999.00, 16.000, 'hogar', 'hogar', 'https://www.cumar.com.ar/CDN/prestameya/categories/hogar.svg', false, 249999.00, ARRAY['cafetera','cocina','hogar']),
    ('9e1304d4-0fd4-4f5e-8e8a-49d5bb0e0105'::uuid, 'PRE-HOG-005', 'Sillon Modular 3 Cuerpos', 'Sillon modular tapizado, configurable para living o monoambiente.', 529999.00, 6.000, 'hogar', 'hogar', 'https://www.cumar.com.ar/CDN/prestameya/categories/hogar.svg', false, NULL::numeric, ARRAY['sillon','mueble','hogar']),

    ('9e1304d4-0fd4-4f5e-8e8a-49d5bb0e0201'::uuid, 'PRE-EMP-001', 'Notebook Pro 15 Ryzen 7', 'Equipo potente para profesionales, edicion, gestion y multitarea.', 1899999.00, 5.000, 'emprender', 'emprender', 'https://www.cumar.com.ar/CDN/prestameya/categories/emprender.svg', true, 2099999.00, ARRAY['notebook pro','emprender','trabajo']),
    ('9e1304d4-0fd4-4f5e-8e8a-49d5bb0e0202'::uuid, 'PRE-EMP-002', 'Impresora Multifuncion WiFi', 'Impresora multifuncion para comercios, home office y administracion.', 319999.00, 14.000, 'emprender', 'emprender', 'https://www.cumar.com.ar/CDN/prestameya/categories/emprender.svg', true, 359999.00, ARRAY['impresora','oficina','emprender']),
    ('9e1304d4-0fd4-4f5e-8e8a-49d5bb0e0203'::uuid, 'PRE-EMP-003', 'Kit Herramientas 120 Piezas', 'Set de herramientas para mantenimiento, instalacion y trabajos generales.', 179999.00, 20.000, 'emprender', 'emprender', 'https://www.cumar.com.ar/CDN/prestameya/categories/emprender.svg', false, NULL::numeric, ARRAY['herramientas','kit','emprender']),
    ('9e1304d4-0fd4-4f5e-8e8a-49d5bb0e0204'::uuid, 'PRE-EMP-004', 'Terminal POS Tactil', 'Terminal tactil para punto de venta con lector y conectividad.', 429999.00, 11.000, 'emprender', 'emprender', 'https://www.cumar.com.ar/CDN/prestameya/categories/emprender.svg', false, 489999.00, ARRAY['pos','comercio','emprender']),
    ('9e1304d4-0fd4-4f5e-8e8a-49d5bb0e0205'::uuid, 'PRE-EMP-005', 'Exhibidora Vertical 280L', 'Exhibidora refrigerada para bebidas y productos de mostrador.', 899999.00, 4.000, 'emprender', 'emprender', 'https://www.cumar.com.ar/CDN/prestameya/categories/emprender.svg', false, NULL::numeric, ARRAY['exhibidora','comercio','emprender'])
  ) AS p(id, sku, name, description, unit_price, stock_quantity, family_code, category_code, image_url, is_featured, original_price, tags)
)
INSERT INTO simple_products (
  id,
  account_id,
  sku,
  supplier_sku,
  name,
  description,
  unit_price,
  currency,
  tax_rate,
  status,
  family_id,
  category_id,
  subcategory_id,
  stock_quantity,
  stock_unit,
  stock_min,
  stock_max,
  track_inventory,
  allow_backorders,
  image_url,
  thumbnail_url,
  gallery_urls,
  metadata,
  product_type,
  version,
  created_at,
  updated_at
)
SELECT
  p.id,
  'a622765f-8fc9-4a40-9d4a-2f175eb82aa0',
  p.sku,
  p.sku,
  p.name,
  p.description,
  p.unit_price,
  'ARS',
  21.00,
  'active',
  t.family_id,
  t.category_id,
  NULL,
  p.stock_quantity,
  'unit',
  1.000,
  NULL,
  true,
  false,
  p.image_url,
  p.image_url,
  jsonb_build_array(p.image_url),
  jsonb_build_object(
    'seed', 'prestameya-test-products',
    'family', p.family_code,
    'category', p.category_code,
    'is_featured', p.is_featured,
    'loan_enabled', true,
    'loan_provider', 'Prestameya',
    'public_show_price', true,
    'public_show_stock', true,
    'channels', jsonb_build_array('ecommerce'),
    'public', jsonb_build_object(
      'show_price', true,
      'show_stock', true,
      'channels', jsonb_build_array('ecommerce')
    ),
    'tags', to_jsonb(p.tags),
    'original_price', p.original_price
  ) - CASE WHEN p.original_price IS NULL THEN 'original_price' ELSE '' END,
  'physical',
  1,
  NOW(),
  NOW()
FROM seed_products p
JOIN taxonomy t ON t.family_code = p.family_code AND t.category_code = p.category_code
ON CONFLICT (account_id, sku)
DO UPDATE SET
  supplier_sku = EXCLUDED.supplier_sku,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  unit_price = EXCLUDED.unit_price,
  currency = EXCLUDED.currency,
  tax_rate = EXCLUDED.tax_rate,
  status = EXCLUDED.status,
  family_id = EXCLUDED.family_id,
  category_id = EXCLUDED.category_id,
  stock_quantity = EXCLUDED.stock_quantity,
  stock_unit = EXCLUDED.stock_unit,
  stock_min = EXCLUDED.stock_min,
  track_inventory = EXCLUDED.track_inventory,
  allow_backorders = EXCLUDED.allow_backorders,
  image_url = EXCLUDED.image_url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  gallery_urls = EXCLUDED.gallery_urls,
  metadata = simple_products.metadata || EXCLUDED.metadata,
  product_type = EXCLUDED.product_type,
  updated_at = NOW();

-- Opciones/variantes para probar detalle de producto con selector.
WITH product_ref AS (
  SELECT id, sku
  FROM simple_products
  WHERE account_id = 'a622765f-8fc9-4a40-9d4a-2f175eb82aa0'
    AND sku IN ('PRE-TECH-001', 'PRE-EMP-001')
)
INSERT INTO simple_product_variant_options (id, account_id, product_id, name, position, values, metadata, created_at, updated_at)
VALUES
  ('ae1304d4-0fd4-4f5e-8e8a-49d5bb0e0001', 'a622765f-8fc9-4a40-9d4a-2f175eb82aa0', (SELECT id FROM product_ref WHERE sku = 'PRE-TECH-001'), 'Color', 1, '[{"value":"negro","label":"Negro","position":1},{"value":"verde","label":"Verde","position":2}]'::jsonb, '{"seed":"prestameya-test-products"}'::jsonb, NOW(), NOW()),
  ('ae1304d4-0fd4-4f5e-8e8a-49d5bb0e0002', 'a622765f-8fc9-4a40-9d4a-2f175eb82aa0', (SELECT id FROM product_ref WHERE sku = 'PRE-EMP-001'), 'Memoria', 1, '[{"value":"16gb","label":"16GB RAM","position":1},{"value":"32gb","label":"32GB RAM","position":2}]'::jsonb, '{"seed":"prestameya-test-products"}'::jsonb, NOW(), NOW())
ON CONFLICT (account_id, product_id, name)
DO UPDATE SET
  position = EXCLUDED.position,
  values = EXCLUDED.values,
  metadata = simple_product_variant_options.metadata || EXCLUDED.metadata,
  updated_at = NOW();

WITH product_ref AS (
  SELECT id, sku
  FROM simple_products
  WHERE account_id = 'a622765f-8fc9-4a40-9d4a-2f175eb82aa0'
    AND sku IN ('PRE-TECH-001', 'PRE-EMP-001')
), seed_variants AS (
  SELECT * FROM (VALUES
    ('be1304d4-0fd4-4f5e-8e8a-49d5bb0e0001'::uuid, 'PRE-TECH-001-NEGRO', 'Celular Nova X 128GB - Negro', 'PRE-TECH-001', '{"Color":"negro"}'::jsonb, 489999.00, 8.000, 1),
    ('be1304d4-0fd4-4f5e-8e8a-49d5bb0e0002'::uuid, 'PRE-TECH-001-VERDE', 'Celular Nova X 128GB - Verde', 'PRE-TECH-001', '{"Color":"verde"}'::jsonb, 499999.00, 10.000, 2),
    ('be1304d4-0fd4-4f5e-8e8a-49d5bb0e0003'::uuid, 'PRE-EMP-001-16GB', 'Notebook Pro 15 Ryzen 7 - 16GB', 'PRE-EMP-001', '{"Memoria":"16gb"}'::jsonb, 1899999.00, 3.000, 1),
    ('be1304d4-0fd4-4f5e-8e8a-49d5bb0e0004'::uuid, 'PRE-EMP-001-32GB', 'Notebook Pro 15 Ryzen 7 - 32GB', 'PRE-EMP-001', '{"Memoria":"32gb"}'::jsonb, 2199999.00, 2.000, 2)
  ) AS v(id, sku, name, product_sku, option_values, unit_price, stock_quantity, position)
)
INSERT INTO simple_product_variants (
  id,
  account_id,
  product_id,
  sku,
  name,
  option_values,
  barcode,
  unit_price,
  cost_price,
  stock_quantity,
  stock_min,
  stock_max,
  track_inventory,
  allow_backorders,
  weight,
  image_url,
  status,
  position,
  metadata,
  version,
  created_at,
  updated_at
)
SELECT
  v.id,
  'a622765f-8fc9-4a40-9d4a-2f175eb82aa0',
  p.id,
  v.sku,
  v.name,
  v.option_values,
  NULL,
  v.unit_price,
  NULL,
  v.stock_quantity,
  1.000,
  NULL,
  true,
  false,
  NULL,
  CASE WHEN v.product_sku = 'PRE-TECH-001'
    THEN 'https://www.cumar.com.ar/CDN/prestameya/categories/tecnologia.svg'
    ELSE 'https://www.cumar.com.ar/CDN/prestameya/categories/emprender.svg'
  END,
  'active',
  v.position,
  '{"seed":"prestameya-test-products","loan_enabled":true}'::jsonb,
  1,
  NOW(),
  NOW()
FROM seed_variants v
JOIN product_ref p ON p.sku = v.product_sku
ON CONFLICT (account_id, sku)
DO UPDATE SET
  name = EXCLUDED.name,
  option_values = EXCLUDED.option_values,
  unit_price = EXCLUDED.unit_price,
  stock_quantity = EXCLUDED.stock_quantity,
  stock_min = EXCLUDED.stock_min,
  track_inventory = EXCLUDED.track_inventory,
  allow_backorders = EXCLUDED.allow_backorders,
  image_url = EXCLUDED.image_url,
  status = EXCLUDED.status,
  position = EXCLUDED.position,
  metadata = simple_product_variants.metadata || EXCLUDED.metadata,
  updated_at = NOW();

COMMIT;

-- Verificacion
SELECT
  COUNT(*) FILTER (WHERE metadata->>'seed' = 'prestameya-test-products') AS seeded_products,
  COUNT(*) FILTER (WHERE metadata->>'seed' = 'prestameya-test-products' AND metadata->>'is_featured' = 'true') AS featured_products,
  COUNT(*) FILTER (WHERE status = 'active' AND stock_quantity > 0 AND metadata->>'seed' = 'prestameya-test-products') AS active_with_stock
FROM simple_products
WHERE account_id = 'a622765f-8fc9-4a40-9d4a-2f175eb82aa0';

SELECT
  p.sku,
  p.name,
  p.unit_price,
  p.stock_quantity,
  p.metadata->>'category' AS category,
  p.metadata->>'is_featured' AS is_featured,
  COUNT(v.id) AS variants
FROM simple_products p
LEFT JOIN simple_product_variants v ON v.product_id = p.id AND v.account_id = p.account_id
WHERE p.account_id = 'a622765f-8fc9-4a40-9d4a-2f175eb82aa0'
  AND p.metadata->>'seed' = 'prestameya-test-products'
GROUP BY p.id, p.sku, p.name, p.unit_price, p.stock_quantity, p.metadata
ORDER BY p.sku;