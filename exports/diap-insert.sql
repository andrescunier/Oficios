-- =============================================================================
-- INSERT ecommerce-config para DIAP Store
-- Tabla: simple_ecommerce_configs
-- Account ID: bed2df35-717f-4900-a4b1-7c3a7fb59b7c
-- CDN: https://www.cumar.com.ar/CDN/diapstore/
-- =============================================================================
-- UPSERT: inserta si no existe, actualiza si ya hay un registro para la cuenta.
-- =============================================================================

INSERT INTO simple_ecommerce_configs (account_id, config, created_at, updated_at)
VALUES (
  'bed2df35-717f-4900-a4b1-7c3a7fb59b7c',
  '{
    "version": "1.0.0",
    "api": {
      "storefrontBaseUrl": "https://diapstore.com",
      "assetsBaseUrl": "https://www.cumar.com.ar/CDN/diapstore"
    },
    "app": {
      "name": "DIAP",
      "companyName": "DIAP",
      "slogan": "Tecnología Profesional para Empresas",
      "description": "Distribuidora de productos tecnológicos de primera calidad",
      "url": "https://diapstore.com",
      "hidePricesForGuests": true,
      "requireAuthForCart": true,
      "loginMessage": "Inicia sesión para ver precios",
      "loginCta": "Iniciar Sesión"
    },
    "contact": {
      "email": "info@diap.com",
      "salesEmail": "ventas@diap.com",
      "phone": "+54 11 2631-0884",
      "whatsapp": "5491126310884",
      "address": "Buenos Aires, Argentina"
    },
    "legal": {
      "companyName": "DIAP INGENIERÍA S.A.",
      "cuit": "30-71036886-0",
      "address": "Buenos Aires, Argentina",
      "jurisdiction": "Buenos Aires, Argentina"
    },
    "business": {
      "defaultTaxRate": 0.21,
      "maxQuantityPerProduct": 5,
      "defaultCurrency": "ARS",
      "defaultCountry": "AR",
      "businessHours": "Lunes a Viernes: 9:00 - 18:00hs",
      "returnPolicyDays": 10,
      "refundProcessingTime": "5 a 10 días hábiles",
      "productsPerPage": 50,
      "featuredProductsCount": 8,
      "heroSliderInterval": 5000,
      "invoiceNote": "Se emite factura tipo A o B según la condición fiscal del comprador.",
      "freeShippingThreshold": 50000,
      "locale": "es-AR"
    },
    "branding": {
      "logo": "https://www.cumar.com.ar/CDN/diapstore/diap-logo.png",
      "favicon": "https://www.cumar.com.ar/CDN/diapstore/favicon.ico",
      "ogImage": "https://www.cumar.com.ar/CDN/diapstore/diap-logo.png"
    },
    "theme": {
      "colorPrimary": "#2563EB",
      "colorPrimaryHover": "#1D4ED8",
      "colorPrimaryForeground": "#FFFFFF",
      "colorSecondary": "#F1F5F9",
      "colorSecondaryForeground": "#0F172A",
      "colorBackground": "#FFFFFF",
      "colorForeground": "#0F172A",
      "colorSurface": "#FFFFFF",
      "colorSurfaceForeground": "#0F172A",
      "colorMuted": "#F1F5F9",
      "colorMutedForeground": "#64748B",
      "colorBorder": "#E2E8F0",
      "colorInput": "#E2E8F0",
      "colorRing": "#2563EB",
      "colorSuccess": "#22C55E",
      "colorWarning": "#F59E0B",
      "colorError": "#EF4444",
      "colorAccent": "#F1F5F9",
      "colorAccentForeground": "#0F172A"
    },
    "social": {},
    "features": {
      "notifications": false,
      "analytics": false,
      "realPayments": false
    },
    "filters": {
      "enabled": false,
      "capacidad": false,
      "velocidad": false,
      "capacidadOptions": [],
      "velocidadOptions": []
    },
    "paymentMethods": {
      "transferencia": false,
      "efectivo": true,
      "mercadopago": false,
      "tarjeta": false
    },
    "payment": {},
    "images": {
      "heroSlides": [
        "https://www.cumar.com.ar/CDN/diapstore/slide-1.jpg",
        "https://www.cumar.com.ar/CDN/diapstore/slide-2.jpg",
        "https://www.cumar.com.ar/CDN/diapstore/slide-3.jpg"
      ],
      "categories": [
        "https://www.cumar.com.ar/CDN/diapstore/ssd-sata.jpg",
        "https://www.cumar.com.ar/CDN/diapstore/ddr4.jpg"
      ],
      "placeholders": [],
      "backgrounds": [],
      "banners": [],
      "productFallbacks": []
    },
    "observability": {
      "enabled": false,
      "flushIntervalMs": 15000,
      "maxQueueSize": 50,
      "useBeacon": true
    }
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (account_id)
DO UPDATE SET
  config = EXCLUDED.config,
  updated_at = NOW();

-- =============================================================================
-- NOTAS:
-- =============================================================================
-- 1. paymentMethods.transferencia está en FALSE porque faltan los datos bancarios.
--    Para habilitarlo, actualizar con:
--
--    UPDATE simple_ecommerce_configs
--    SET config = jsonb_set(
--      jsonb_set(
--        jsonb_set(
--          jsonb_set(config, '{paymentMethods,transferencia}', 'true'),
--          '{payment,accountHolder}', '"DIAP INGENIERÍA S.A."'
--        ),
--        '{payment,cbu}', '"XXXXXXXXXXXXXXXXXXXX"'
--      ),
--      '{payment,alias}', '"diap.ing"'
--    ),
--    updated_at = NOW()
--    WHERE account_id = 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c';
--
-- 2. images.categories son URLs planas (backend contract).
--    El frontend las descarta si son solo strings (adaptTenantConfigPayload).
--    Las categorías con metadatos (name, slug, description) se renderizan
--    desde los datos de producto, no desde ecommerce-config.
--
-- 3. images.heroSlides son URLs planas.
--    El frontend las acepta como string[] (sin title/subtitle/cta).
--    Los slides se muestran como imágenes sin overlay de texto.
--
-- 4. Imágenes a subir al CDN (https://www.cumar.com.ar/CDN/diapstore/):
--    - slide-1.jpg   (576 KB)
--    - slide-2.jpg   (544 KB)
--    - slide-3.jpg   (811 KB)
--    - ssd-sata.jpg  (354 KB)
--    - ddr4.jpg      (634 KB)
--    - diap-logo.png  (23 KB)
--    - favicon.ico     (8 KB)
-- =============================================================================
