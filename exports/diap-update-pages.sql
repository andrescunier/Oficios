-- =============================================================================
-- UPDATE ecommerce-config para DIAP Store
-- Agrega bloque "pages" con contenido configurable de:
--   /contacto, /seguimiento, /devoluciones, /garantias,
--   /terminos, /privacidad, /cookies, /aviso-legal
--
-- Cada página es opcional. Si no aparece en pages.*, la app usa el fallback
-- hardcodeado actual. Si aparece, se renderiza con CmsPage usando los blocks.
--
-- Tipos de block: paragraph | heading | section | cards | list | html
-- Tabla: simple_ecommerce_configs
-- Account ID: bed2df35-717f-4900-a4b1-7c3a7fb59b7c
-- DB: simpledb | Host: 100.105.218.66:5432
-- =============================================================================

UPDATE simple_ecommerce_configs
SET
  config = config
    || jsonb_build_object(
        'pages', '{
          "contact": {
            "enabled": true,
            "title": "Contacto",
            "subtitle": "Estamos para ayudarte",
            "heroVariant": "plain",
            "blocks": [
              { "type": "paragraph", "body": "Escribinos por WhatsApp o email y te respondemos a la brevedad." },
              { "type": "section", "title": "Horarios de atención",
                "body": "Lunes a Viernes de 9:00 a 18:00 hs." }
            ],
            "ctaTitle": "¿Dudas sobre un producto?",
            "ctaPrimaryLabel": "Escribir por WhatsApp",
            "ctaPrimaryHref": "https://wa.me/5491100000000"
          },

          "tracking": {
            "enabled": true,
            "title": "Seguimiento de Pedido",
            "subtitle": "Consultá el estado de tu compra",
            "heroVariant": "plain",
            "blocks": [
              { "type": "paragraph", "body": "Para hacer un seguimiento, escribinos por WhatsApp con tu número de orden y te respondemos al instante." },
              { "type": "list", "title": "Tiempos estimados de entrega",
                "items": [
                  "CABA y GBA: 24 a 72 hs hábiles",
                  "Interior del país: 3 a 7 días hábiles",
                  "Retiro en sucursal: coordinamos por WhatsApp"
                ]
              }
            ],
            "ctaTitle": "¿Necesitás ayuda?",
            "ctaPrimaryLabel": "Consultar por WhatsApp",
            "ctaPrimaryHref": "https://wa.me/5491100000000"
          },

          "returns": {
            "enabled": true,
            "title": "Devoluciones",
            "subtitle": "Cambios y devoluciones simples",
            "heroVariant": "plain",
            "blocks": [
              { "type": "paragraph", "body": "Tenés 10 días corridos desde la recepción del producto para solicitar un cambio o devolución." },
              { "type": "section", "title": "Condiciones",
                "body": "El producto debe estar en perfecto estado, sin uso, con su embalaje y accesorios originales." },
              { "type": "list", "title": "Pasos",
                "items": [
                  "Escribinos por WhatsApp con tu número de orden",
                  "Coordinamos retiro o entrega del producto",
                  "Verificamos el estado y procesamos el reintegro o cambio"
                ]
              }
            ]
          },

          "warranty": {
            "enabled": true,
            "title": "Garantías",
            "subtitle": "Compra con tranquilidad",
            "heroVariant": "plain",
            "blocks": [
              { "type": "paragraph", "body": "Todos nuestros productos cuentan con la garantía oficial del fabricante." },
              { "type": "cards", "items": [
                { "icon": "ShieldCheck", "iconColor": "blue",  "title": "6 meses",  "description": "Garantía mínima legal sobre defectos de fabricación." },
                { "icon": "Award",       "iconColor": "green", "title": "12 meses", "description": "Garantía extendida en productos seleccionados." }
              ]},
              { "type": "section", "title": "¿Qué cubre la garantía?",
                "body": "Cubre fallas de fabricación. No cubre daños por mal uso, golpes, líquidos ni manipulación por terceros." }
            ]
          },

          "terms": {
            "enabled": true,
            "title": "Términos y Condiciones",
            "subtitle": "Reglas de uso del sitio",
            "heroVariant": "plain",
            "lastUpdated": "2026-01-01",
            "blocks": [
              { "type": "paragraph", "body": "Al utilizar este sitio aceptás los presentes términos y condiciones." },
              { "type": "heading",   "title": "1. Alcance" },
              { "type": "paragraph", "body": "Las compras realizadas a través del sitio se rigen por la Ley de Defensa del Consumidor (Ley 24.240) de la República Argentina." },
              { "type": "heading",   "title": "2. Precios y stock" },
              { "type": "paragraph", "body": "Los precios y el stock pueden variar sin previo aviso. La operación queda confirmada al validar el pago." }
            ]
          },

          "privacy": {
            "enabled": true,
            "title": "Política de Privacidad",
            "subtitle": "Cómo tratamos tus datos",
            "heroVariant": "plain",
            "lastUpdated": "2026-01-01",
            "blocks": [
              { "type": "paragraph", "body": "Tus datos personales son tratados con confidencialidad y solo se utilizan para gestionar tu cuenta y tus compras." },
              { "type": "heading",   "title": "Datos que recopilamos" },
              { "type": "list", "items": [
                "Nombre, email, teléfono",
                "Dirección de envío y facturación",
                "Historial de compras"
              ]},
              { "type": "heading",   "title": "Tus derechos" },
              { "type": "paragraph", "body": "Podés solicitar acceso, rectificación o eliminación de tus datos escribiéndonos por los canales de contacto." }
            ]
          },

          "cookies": {
            "enabled": true,
            "title": "Política de Cookies",
            "subtitle": "Uso de cookies en el sitio",
            "heroVariant": "plain",
            "lastUpdated": "2026-01-01",
            "blocks": [
              { "type": "paragraph", "body": "Utilizamos cookies propias y de terceros para mejorar tu experiencia, recordar tu sesión y medir el uso del sitio." },
              { "type": "heading",   "title": "Tipos de cookies que usamos" },
              { "type": "list", "items": [
                "Esenciales: necesarias para el funcionamiento del sitio (carrito, sesión).",
                "Analíticas: para entender cómo se usa el sitio.",
                "Marketing: para mostrarte ofertas relevantes."
              ]},
              { "type": "paragraph", "body": "Podés configurar tu navegador para bloquear cookies, aunque algunas funcionalidades podrían dejar de operar correctamente." }
            ]
          },

          "legalNotice": {
            "enabled": true,
            "title": "Aviso Legal",
            "subtitle": "Información legal de la empresa",
            "heroVariant": "plain",
            "blocks": [
              { "type": "paragraph", "body": "El contenido de este sitio (textos, imágenes, marcas, descripciones) es propiedad de DIAP Store o de sus respectivos titulares. Está prohibida su reproducción total o parcial sin autorización." },
              { "type": "heading",   "title": "Responsabilidad" },
              { "type": "paragraph", "body": "DIAP Store no se responsabiliza por interrupciones del servicio, errores tipográficos o desactualizaciones temporales en precios o stock." }
            ]
          }
        }'::jsonb
    ),
  updated_at = NOW()
WHERE account_id = 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c';

-- Verificación
SELECT
  account_id,
  config -> 'pages' ? 'contact'     AS contacto,
  config -> 'pages' ? 'tracking'    AS seguimiento,
  config -> 'pages' ? 'returns'     AS devoluciones,
  config -> 'pages' ? 'warranty'    AS garantias,
  config -> 'pages' ? 'terms'       AS terminos,
  config -> 'pages' ? 'privacy'     AS privacidad,
  config -> 'pages' ? 'cookies'     AS cookies,
  config -> 'pages' ? 'legalNotice' AS aviso_legal,
  updated_at
FROM simple_ecommerce_configs
WHERE account_id = 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c';
