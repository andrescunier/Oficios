-- =============================================================================
-- UPDATE directo ecommerce-config DIAP con imagenes CDN y config visual faltante
-- Account ID: bed2df35-717f-4900-a4b1-7c3a7fb59b7c
-- Tabla: simple_ecommerce_configs
-- =============================================================================
-- Ejecutar manualmente en la base:
--   psql -h 100.105.218.66 -U simpleuser -d simpledb -f exports/diap-update-cdn-config.sql
-- =============================================================================

UPDATE simple_ecommerce_configs
SET
  config = config
    || jsonb_build_object(
      'api', COALESCE(config->'api', '{}'::jsonb) || jsonb_build_object(
        'assetsBaseUrl', 'https://www.cumar.com.ar/CDN/diapstore',
        'supportBaseUrl', NULL,
        'storefrontBaseUrl', 'https://diapstore.com',
        'extraHeaders', '{}'::jsonb
      ),

      'features', COALESCE(config->'features', '{}'::jsonb) || jsonb_build_object(
        'notifications', false,
        'analytics', false,
        'realPayments', false,
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

      'header', COALESCE(config->'header', '{}'::jsonb) || jsonb_build_object(
        'navItems', '[]'::jsonb,
        'showCart', true,
        'showOrders', true,
        'showSearch', true,
        'topBarHref', '/envios',
        'showAccount', true,
        'promoBarText', 'Tecnología Profesional para Empresas - ¡Envío gratis en compras superiores a $50.000!',
        'showFavorites', true,
        'topBarMessage', 'Tecnología Profesional para Empresas - ¡Envío gratis en compras superiores a $50.000!',
        'promoBarEnabled', true,
        'showCategoriesMenu', true
      ),

      'ui', COALESCE(config->'ui', '{}'::jsonb) || jsonb_build_object(
        'headerPromoMessages', jsonb_build_array(
          'Tecnología Profesional para Empresas',
          '¡Envío gratis en todas tus compras!',
          'Hasta 12 cuotas sin interés',
          'Envíos a todo el país'
        ),
        'showHomeBenefits', true,
        'homeFeaturedTitle', 'Productos Destacados',
        'homeFeaturedSubtitle', 'Los productos más populares de nuestra tienda',
        'homeViewAllLabel', 'Ver Todos',
        'headerAllProductsLabel', 'Todos los Productos',
        'headerLoginLabel', 'Ingresar',
        'headerRegisterLabel', 'Registrarse',
        'headerCategoriesLabel', 'Categorías',
        'headerFavoritesLabel', 'Favoritos',
        'headerMyProfileLabel', 'Mi Perfil',
        'headerMyOrdersLabel', 'Mis Pedidos',
        'headerLogoutLabel', 'Cerrar Sesión'
      ),

      'images', COALESCE(config->'images', '{}'::jsonb) || jsonb_build_object(
        'heroSlides', jsonb_build_array(
          jsonb_build_object(
            'image', 'https://www.cumar.com.ar/CDN/diapstore/heroes/slide-1.jpg',
            'mobileImage', 'https://www.cumar.com.ar/CDN/diapstore/heroes/slide-1.jpg',
            'title', 'Tecnología Profesional para Empresas',
            'subtitle', 'Soluciones B2B en componentes, almacenamiento y memorias para tu negocio',
            'cta', 'Ver Catálogo',
            'link', '/productos'
          ),
          jsonb_build_object(
            'image', 'https://www.cumar.com.ar/CDN/diapstore/heroes/slide-2.jpg',
            'mobileImage', 'https://www.cumar.com.ar/CDN/diapstore/heroes/slide-2.jpg',
            'title', 'SSDs de Alto Rendimiento',
            'subtitle', 'Almacenamiento confiable para equipos profesionales',
            'cta', 'Explorar SSDs',
            'link', '/productos?buscar=ssd'
          ),
          jsonb_build_object(
            'image', 'https://www.cumar.com.ar/CDN/diapstore/heroes/slide-3.jpg',
            'mobileImage', 'https://www.cumar.com.ar/CDN/diapstore/heroes/slide-3.jpg',
            'title', 'Memorias RAM DDR4 y DDR5',
            'subtitle', 'Rendimiento estable para notebooks, PCs y estaciones de trabajo',
            'cta', 'Ver Memorias',
            'link', '/productos?buscar=memoria'
          )
        ),
        'categories', jsonb_build_array(
          jsonb_build_object(
            'name', 'Componentes',
            'image', 'https://www.cumar.com.ar/CDN/diapstore/categories/componentes.jpg',
            'link', '/productos?categoria=componentes',
            'slug', 'componentes',
            'group', 'Componentes',
            'description', 'Componentes para equipos profesionales',
            'searchTerms', jsonb_build_array('componentes', 'hardware'),
            'productCategories', jsonb_build_array('Componentes'),
            'subcategories', '[]'::jsonb
          ),
          jsonb_build_object(
            'name', 'DDR4',
            'image', 'https://www.cumar.com.ar/CDN/diapstore/categories/ddr4.jpg',
            'link', '/productos?buscar=ddr4',
            'slug', 'ddr4',
            'group', 'Memorias RAM',
            'description', 'Memorias DDR4 para notebooks y PCs',
            'searchTerms', jsonb_build_array('ddr4', 'memoria', 'ram'),
            'productCategories', jsonb_build_array('Memorias RAM'),
            'subcategories', '[]'::jsonb
          ),
          jsonb_build_object(
            'name', 'DDR5',
            'image', 'https://www.cumar.com.ar/CDN/diapstore/categories/ddr5.jpg',
            'link', '/productos?buscar=ddr5',
            'slug', 'ddr5',
            'group', 'Memorias RAM',
            'description', 'Memorias DDR5 de alto rendimiento',
            'searchTerms', jsonb_build_array('ddr5', 'memoria', 'ram'),
            'productCategories', jsonb_build_array('Memorias RAM'),
            'subcategories', '[]'::jsonb
          ),
          jsonb_build_object(
            'name', 'Gaming',
            'image', 'https://www.cumar.com.ar/CDN/diapstore/categories/gaming.jpg',
            'link', '/productos?buscar=gaming',
            'slug', 'gaming',
            'group', 'Equipos',
            'description', 'Productos orientados a gaming y alto rendimiento',
            'searchTerms', jsonb_build_array('gaming', 'alto rendimiento'),
            'productCategories', '[]'::jsonb,
            'subcategories', '[]'::jsonb
          ),
          jsonb_build_object(
            'name', 'SSD M.2',
            'image', 'https://www.cumar.com.ar/CDN/diapstore/categories/ssd-m2.jpg',
            'link', '/productos?buscar=ssd%20m.2',
            'slug', 'ssd-m2',
            'group', 'Almacenamiento',
            'description', 'Discos SSD M.2 para máxima velocidad',
            'searchTerms', jsonb_build_array('ssd', 'm.2', 'nvme', 'almacenamiento'),
            'productCategories', jsonb_build_array('SSD'),
            'subcategories', '[]'::jsonb
          ),
          jsonb_build_object(
            'name', 'SSD SATA',
            'image', 'https://www.cumar.com.ar/CDN/diapstore/categories/ssd-sata.jpg',
            'link', '/productos?buscar=ssd%20sata',
            'slug', 'ssd-sata',
            'group', 'Almacenamiento',
            'description', 'Discos SSD SATA para upgrades confiables',
            'searchTerms', jsonb_build_array('ssd', 'sata', 'almacenamiento'),
            'productCategories', jsonb_build_array('SSD'),
            'subcategories', '[]'::jsonb
          )
        ),
        'placeholders', jsonb_build_object(
          'product', '',
          'category', '',
          'user', ''
        ),
        'backgrounds', jsonb_build_object(
          'hero', '',
          'features', '',
          'testimonials', ''
        ),
        'banners', jsonb_build_object(
          'main', '',
          'secondary', '',
          'seasonal', '',
          'sale', ''
        ),
        'productFallbacks', '{}'::jsonb
      ),

      'pages', jsonb_build_object(
        'about', jsonb_build_object('enabled', false),
        'terms', jsonb_build_object('enabled', false),
        'contact', jsonb_build_object('enabled', false),
        'cookies', jsonb_build_object('enabled', false),
        'privacy', jsonb_build_object('enabled', false),
        'returns', jsonb_build_object('enabled', false),
        'shipping', jsonb_build_object('enabled', false),
        'warranty', jsonb_build_object('enabled', false),
        'legalNotice', jsonb_build_object('enabled', false)
      )
    ),
  updated_at = NOW()
WHERE account_id = 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c';

-- Verificacion
SELECT
  account_id,
  jsonb_array_length(config->'images'->'heroSlides') AS hero_slides,
  jsonb_array_length(config->'images'->'categories') AS categories,
  jsonb_array_length(config->'features'->'benefits') AS benefits,
  config->'header'->>'promoBarEnabled' AS promo_bar_enabled,
  config->'ui'->>'homeFeaturedSubtitle' AS home_featured_subtitle,
  updated_at
FROM simple_ecommerce_configs
WHERE account_id = 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c';