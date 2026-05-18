-- =============================================================================
-- UPSERT ecommerce-config Prestameya
-- Account ID: a622765f-8fc9-4a40-9d4a-2f175eb82aa0
-- Tabla: simple_ecommerce_configs
-- =============================================================================
-- Ejecutar manualmente en la base:
--   psql -h <host> -U <user> -d <db> -f exports/prestameya-update-config.sql
--
-- Antes de ejecutar, subir assets de:
--   exports/prestameya/
-- a:
--   https://www.cumar.com.ar/CDN/prestameya/
-- =============================================================================

INSERT INTO simple_ecommerce_configs (account_id, config, created_at, updated_at)
VALUES (
  'a622765f-8fc9-4a40-9d4a-2f175eb82aa0',
  $$
  {
    "api": {
      "assetsBaseUrl": "https://www.cumar.com.ar/CDN/prestameya",
      "supportBaseUrl": null,
      "storefrontBaseUrl": "https://prestameya.com",
      "extraHeaders": {}
    },
    "app": {
      "name": "Prestameya",
      "companyName": "Prestameya",
      "slogan": "Productos pagables con préstamo",
      "description": "Storefront para comprar productos con préstamo como único medio de pago.",
      "url": "https://prestameya.com",
      "hidePricesForGuests": true,
      "requireAuthForCart": true,
      "loginMessage": "Iniciá sesión para ver precios y simular tu préstamo",
      "loginCta": "Ingresar"
    },
    "contact": {
      "email": "hola@prestameya.com",
      "salesEmail": "ventas@prestameya.com",
      "phone": "+54 11 0000-0000",
      "whatsapp": "5491100000000",
      "address": "Buenos Aires, Argentina"
    },
    "legal": {
      "companyName": "Prestameya",
      "cuit": "",
      "address": "Buenos Aires, Argentina",
      "jurisdiction": "Buenos Aires, Argentina"
    },
    "business": {
      "defaultTaxRate": 0.21,
      "maxQuantityPerProduct": 5,
      "defaultCurrency": "ARS",
      "defaultCountry": "AR",
      "businessHours": "Lunes a Viernes: 9:00 a 18:00 hs",
      "returnPolicyDays": 10,
      "refundProcessingTime": "5 a 10 días hábiles",
      "productsPerPage": 48,
      "featuredProductsCount": 8,
      "heroSliderInterval": 5500,
      "invoiceNote": "La compra queda pendiente hasta que se apruebe el préstamo informado.",
      "freeShippingThreshold": 0,
      "locale": "es-AR"
    },
    "branding": {
      "logo": "https://www.cumar.com.ar/CDN/prestameya/logo.svg",
      "headerLogo": "https://www.cumar.com.ar/CDN/prestameya/logo.svg",
      "footerLogo": "https://www.cumar.com.ar/CDN/prestameya/logo.svg",
      "logoDark": "https://www.cumar.com.ar/CDN/prestameya/logo.svg",
      "favicon": "https://www.cumar.com.ar/CDN/prestameya/favicon.svg",
      "banner": "https://www.cumar.com.ar/CDN/prestameya/heroes/hero-prestamo.svg",
      "ogImage": "https://www.cumar.com.ar/CDN/prestameya/og-image.svg"
    },
    "theme": {
      "colorPrimary": "#0f766e",
      "colorPrimaryHover": "#115e59",
      "colorPrimaryForeground": "#ffffff",
      "colorSecondary": "#fff7ed",
      "colorSecondaryForeground": "#0f172a",
      "colorBackground": "#f8fafc",
      "colorForeground": "#0f172a",
      "colorSurface": "#ffffff",
      "colorSurfaceForeground": "#0f172a",
      "colorMuted": "#e2e8f0",
      "colorMutedForeground": "#475569",
      "colorBorder": "#cbd5e1",
      "colorInput": "#cbd5e1",
      "colorRing": "#0f766e",
      "colorSuccess": "#22c55e",
      "colorWarning": "#f97316",
      "colorError": "#ef4444",
      "colorAccent": "#fed7aa",
      "colorAccentForeground": "#0f172a",
      "fontFamily": "Inter, ui-sans-serif, system-ui, sans-serif",
      "fontUrl": ""
    },
    "social": {
      "facebook": "",
      "instagram": "",
      "twitter": "",
      "linkedin": ""
    },
    "features": {
      "notifications": false,
      "analytics": false,
      "realPayments": false,
      "benefits": [
        {
          "icon": "Landmark",
          "title": "Pago con préstamo",
          "description": "El préstamo es el único medio de pago disponible"
        },
        {
          "icon": "Calculator",
          "title": "Cuotas visibles",
          "description": "Simulación de pagos antes de confirmar la compra"
        },
        {
          "icon": "ShieldCheck",
          "title": "Compra protegida",
          "description": "Tu pedido queda pendiente hasta validar el préstamo"
        },
        {
          "icon": "Clock3",
          "title": "Proceso simple",
          "description": "Elegí producto, revisá cuotas y enviá el pedido"
        }
      ]
    },
    "shipping": {
      "enabled": true,
      "mode": "free",
      "bannerText": "Envío coordinado luego de aprobar el préstamo",
      "label": "Envío",
      "freeLabel": "A coordinar",
      "drawerMessage": "Coordinamos el envío cuando se aprueba el préstamo",
      "chargedMessage": "El envío se informa al validar la operación",
      "productBadgeTitle": "Entrega coordinada",
      "productBadgeDescription": "Después de aprobar el préstamo",
      "chargeAmount": 0,
      "chargeProductId": "",
      "chargeProductSku": "",
      "chargeProductDescription": "Cargo de envío",
      "taxRate": 0
    },
    "newsletter": {
      "enabled": false,
      "endpoint": "",
      "headers": {},
      "title": "Recibí novedades de financiación",
      "description": "Te avisamos cuando haya nuevas opciones de préstamo.",
      "placeholder": "Tu email",
      "buttonLabel": "Suscribirme",
      "successMessage": "Gracias por suscribirte.",
      "errorMessage": "No pudimos registrar tu suscripción. Intentá nuevamente."
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
      "efectivo": false,
      "mercadopago": false,
      "tarjeta": false
    },
    "payment": {
      "bankName": "",
      "accountHolder": "",
      "cbu": "",
      "alias": "",
      "whatsappVerification": "5491100000000"
    },
    "checkout": {
      "loan": {
        "enabled": true,
        "providerName": "Prestameya",
        "title": "Pagá con préstamo Prestameya",
        "subtitle": "Todos los productos se pueden pagar con préstamo. Revisá las cuotas estimadas antes de finalizar.",
        "badgeLabel": "Disponible con préstamo",
        "termsTitle": "Pagos estimados del préstamo",
        "amountLabel": "Cuota estimada",
        "totalLabel": "Total financiado",
        "legalText": "Cuotas estimadas. La aprobación, monto final y condiciones quedan sujetas a evaluación crediticia.",
        "minAmount": 1000,
        "maxAmount": 5000000,
        "defaultTermMonths": 6,
        "monthlyRate": 0.035,
        "originationFeeRate": 0.02,
        "terms": [
          { "months": 3, "label": "3 pagos", "monthlyRate": 0.03 },
          { "months": 6, "label": "6 pagos", "monthlyRate": 0.035 },
          { "months": 9, "label": "9 pagos", "monthlyRate": 0.04 },
          { "months": 12, "label": "12 pagos", "monthlyRate": 0.045 }
        ]
      }
    },
    "images": {
      "heroSlides": [
        {
          "image": "https://www.cumar.com.ar/CDN/prestameya/heroes/hero-prestamo.svg",
          "mobileImage": "https://www.cumar.com.ar/CDN/prestameya/heroes/hero-prestamo.svg",
          "title": "Prestameya",
          "subtitle": "Elegí productos y pagalos con préstamo como único medio de pago",
          "cta": "Ver productos",
          "link": "/productos"
        },
        {
          "image": "https://www.cumar.com.ar/CDN/prestameya/heroes/hero-cuotas.svg",
          "mobileImage": "https://www.cumar.com.ar/CDN/prestameya/heroes/hero-cuotas.svg",
          "title": "Cuotas visibles antes de comprar",
          "subtitle": "El frente muestra los pagos estimados del préstamo cuando la opción está activa",
          "cta": "Simular en productos",
          "link": "/productos"
        }
      ],
      "categories": [
        {
          "name": "Todos los productos",
          "image": "https://www.cumar.com.ar/CDN/prestameya/categories/productos.svg",
          "link": "/productos",
          "slug": "productos",
          "group": "Prestameya",
          "description": "Productos disponibles para pagar con préstamo",
          "searchTerms": ["productos", "prestamo", "financiacion"],
          "productCategories": [],
          "subcategories": []
        },
        {
          "name": "Tecnología",
          "image": "https://www.cumar.com.ar/CDN/prestameya/categories/tecnologia.svg",
          "link": "/categoria/tecnologia",
          "slug": "tecnologia",
          "group": "Categorías",
          "description": "Tecnología pagable con préstamo",
          "searchTerms": ["tecnologia", "notebook", "celular", "pc"],
          "productCategories": ["tecnologia"],
          "subcategories": []
        },
        {
          "name": "Hogar",
          "image": "https://www.cumar.com.ar/CDN/prestameya/categories/hogar.svg",
          "link": "/categoria/hogar",
          "slug": "hogar",
          "group": "Categorías",
          "description": "Productos para el hogar con préstamo",
          "searchTerms": ["hogar", "casa", "electro"],
          "productCategories": ["hogar"],
          "subcategories": []
        },
        {
          "name": "Emprender",
          "image": "https://www.cumar.com.ar/CDN/prestameya/categories/emprender.svg",
          "link": "/categoria/emprender",
          "slug": "emprender",
          "group": "Categorías",
          "description": "Productos para trabajar o emprender",
          "searchTerms": ["emprender", "trabajo", "herramientas"],
          "productCategories": ["emprender"],
          "subcategories": []
        }
      ],
      "placeholders": {
        "product": "https://www.cumar.com.ar/CDN/prestameya/categories/productos.svg",
        "category": "https://www.cumar.com.ar/CDN/prestameya/categories/productos.svg",
        "user": "https://www.cumar.com.ar/CDN/prestameya/favicon.svg"
      },
      "backgrounds": {
        "hero": "https://www.cumar.com.ar/CDN/prestameya/heroes/hero-prestamo.svg",
        "features": "",
        "testimonials": ""
      },
      "banners": {
        "main": "https://www.cumar.com.ar/CDN/prestameya/heroes/hero-prestamo.svg",
        "secondary": "https://www.cumar.com.ar/CDN/prestameya/heroes/hero-cuotas.svg",
        "seasonal": "",
        "sale": ""
      },
      "productFallbacks": {}
    },
    "header": {
      "navItems": [],
      "showCart": true,
      "showOrders": true,
      "showSearch": true,
      "showAccount": true,
      "showFavorites": true,
      "showCategoriesMenu": true,
      "topBarHref": "/productos",
      "topBarMessage": "Prestameya: todos los productos se pagan con préstamo",
      "promoBarText": "Prestameya: todos los productos se pagan con préstamo",
      "promoBarEnabled": true
    },
    "footer": {
      "sections": [],
      "showWhatsappCapture": true,
      "whatsappOptInMessage": "Hola, quiero recibir información sobre préstamos Prestameya.",
      "whatsappOptInSuccessMessage": "Te abrimos WhatsApp para continuar la consulta.",
      "withdrawalWhatsappMessage": "Quiero consultar sobre una compra Prestameya.",
      "paymentMethods": ["Préstamo Prestameya"],
      "showSocial": false,
      "showPaymentBadges": true
    },
    "registration": {
      "title": "Crear cuenta Prestameya",
      "subtitle": "Registrate para ver precios y comprar con préstamo",
      "submitLabel": "Crear cuenta",
      "successMessage": "Cuenta creada. Ya podés ver productos pagables con préstamo.",
      "acceptTermsLabel": "Acepto los términos y condiciones de Prestameya",
      "alreadyHaveAccountText": "¿Ya tenés cuenta?",
      "alreadyHaveAccountLinkText": "Ingresá acá",
      "fields": [
        { "name": "email", "label": "Email", "placeholder": "tu@email.com", "required": true, "visible": true, "type": "email" },
        { "name": "password", "label": "Contraseña", "placeholder": "Tu contraseña", "required": true, "visible": true, "type": "password" },
        { "name": "confirmPassword", "label": "Confirmar contraseña", "placeholder": "Confirmá tu contraseña", "required": false, "visible": true, "type": "password" }
      ]
    },
    "ui": {
      "searchPlaceholder": "Buscar productos pagables con préstamo...",
      "homeCategoriesTitle": "Comprá con préstamo",
      "homeCategoriesSubtitle": "Explorá productos que podés pagar con financiación Prestameya",
      "showHomeBenefits": true,
      "homeFeaturedTitle": "Productos para financiar",
      "homeFeaturedSubtitle": "Elegí productos y revisá los pagos estimados del préstamo",
      "homeNewTitle": "Nuevos productos con préstamo",
      "homeNewSubtitle": "Incorporaciones disponibles para financiar",
      "homeSaleTitle": "Oportunidades para financiar",
      "homeSaleSubtitle": "Productos destacados para comprar con préstamo",
      "homeViewAllLabel": "Ver productos",
      "headerAllProductsLabel": "Productos",
      "headerLoginLabel": "Ingresar",
      "headerRegisterLabel": "Crear cuenta",
      "headerCategoriesLabel": "Categorías",
      "headerFavoritesLabel": "Favoritos",
      "headerMyProfileLabel": "Mi perfil",
      "headerMyOrdersLabel": "Mis pedidos",
      "headerLogoutLabel": "Cerrar sesión",
      "footerPaymentMethodsLabel": "Medio de pago",
      "cartTitle": "Tu selección",
      "cartEmptyTitle": "Todavía no elegiste productos",
      "cartEmptyBody": "Explorá productos y simulá pagos con préstamo.",
      "cartEmptyExploreLabel": "Ver productos",
      "cartProceedAuthLabel": "Continuar al préstamo",
      "cartProceedGuestLabel": "Ingresar para continuar",
      "cartClearLabel": "Vaciar selección",
      "cartPageTitle": "Productos seleccionados",
      "cartPageContinueShopping": "Seguir eligiendo",
      "cartPageItemsLabel": "Productos para financiar",
      "cartPageClearCartLabel": "Vaciar selección",
      "cartPageSubtotalLabel": "Subtotal de productos",
      "cartPageShippingLabel": "Envío",
      "cartPageTotalLabel": "Total a financiar",
      "cartPageCheckoutLabel": "Solicitar préstamo",
      "cartPageSSLBadge": "Solicitud segura",
      "cartPageSSLDesc": "Tus datos viajan protegidos",
      "cartPageShippingBadge": "Entrega coordinada",
      "cartPageShippingDesc": "Después de aprobar el préstamo",
      "checkoutTitle": "Solicitar compra con préstamo",
      "checkoutBackLabel": "Volver a la selección",
      "checkoutStepShipping": "Datos",
      "checkoutStepPayment": "Préstamo",
      "checkoutStepReview": "Revisar",
      "checkoutShippingTitle": "Datos de contacto y entrega",
      "checkoutPaymentTitle": "Pago con préstamo",
      "checkoutReviewTitle": "Revisar solicitud",
      "checkoutAddressTitle": "Dirección de entrega",
      "checkoutAccountDataTitle": "Datos de tu cuenta",
      "checkoutContinueToPayment": "Ver pagos del préstamo",
      "checkoutPaymentMethodLabel": "Medio de pago",
      "checkoutFinalizeLabel": "Enviar solicitud",
      "checkoutFinalizingLabel": "Enviando solicitud...",
      "checkoutOrderTitle": "Resumen a financiar",
      "checkoutSubtotalLabel": "Subtotal",
      "checkoutShippingLabel": "Envío",
      "checkoutTotalLabel": "Total a financiar",
      "productBuySecureTitle": "Solicitud segura",
      "productBuySecureDesc": "Tus datos se protegen durante el proceso",
      "productMultiplePaymentsTitle": "Pagá con préstamo",
      "productMultiplePaymentsDesc": "Todos los productos tienen financiación Prestameya",
      "productMultiplePaymentsIcon": "Landmark",
      "headerPromoMessages": [
        "Prestameya: productos pagables con préstamo",
        "El préstamo es el único medio de pago",
        "Simulá cuotas antes de confirmar",
        "Compra protegida y revisión backend"
      ],
      "orderSuccessTitle": "Solicitud recibida",
      "orderSuccessSubtitle": "Tu pedido quedó pendiente de validación del préstamo.",
      "orderSuccessPaymentMethodLabel": "Medio de pago informado",
      "orderSuccessPaymentPendingLabel": "Estado: préstamo pendiente de validación",
      "orderSuccessNextTitle": "Próximos pasos",
      "orderSuccessNextBullet1": "Recibirás el detalle de la solicitud por email",
      "orderSuccessNextBullet2": "El préstamo será evaluado antes de confirmar la compra",
      "orderSuccessNextBullet3": "Podrás seguir el estado desde Mis Pedidos",
      "orderSuccessViewOrdersLabel": "Ver mis pedidos",
      "orderSuccessContinueLabel": "Ver más productos",
      "paymentMethodLoan": "Préstamo Prestameya",
      "paymentMethodTransfer": "Transferencia deshabilitada",
      "paymentMethodCash": "Efectivo deshabilitado",
      "paymentMethodOther": "Préstamo"
    },
    "pages": {
      "about": { "enabled": false },
      "terms": { "enabled": false },
      "contact": { "enabled": false },
      "cookies": { "enabled": false },
      "privacy": { "enabled": false },
      "returns": { "enabled": false },
      "shipping": { "enabled": false },
      "warranty": { "enabled": false },
      "legalNotice": { "enabled": false }
    },
    "observability": {
      "enabled": false,
      "endpoint": "",
      "flushIntervalMs": 15000,
      "maxQueueSize": 50,
      "useBeacon": true
    }
  }
  $$::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (account_id)
DO UPDATE SET
  config = (simple_ecommerce_configs.config - 'loan') || EXCLUDED.config,
  updated_at = NOW();

-- Verificacion
SELECT
  account_id,
  config->'app'->>'name' AS app_name,
  config->'paymentMethods'->>'transferencia' AS transferencia_enabled,
  config ? 'loan' AS top_level_loan_present,
  config->'checkout'->'loan'->>'enabled' AS loan_enabled,
  jsonb_array_length(config->'checkout'->'loan'->'terms') AS loan_terms,
  jsonb_array_length(config->'images'->'heroSlides') AS hero_slides,
  updated_at
FROM simple_ecommerce_configs
WHERE account_id = 'a622765f-8fc9-4a40-9d4a-2f175eb82aa0';