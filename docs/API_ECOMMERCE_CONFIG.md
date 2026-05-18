# API: Configuración de E-commerce por Tenant

> Contrato operativo vigente para este frontend: [BACKEND_CONTRACT.md](/home/andis/simpleEcommerce/docs/BACKEND_CONTRACT.md)
>
> Si este archivo contradice ese contrato, prevalece `BACKEND_CONTRACT.md`.

Estado actual del frontend:

- El bootstrap depende sólo de `VITE_API_BASE_URL` y `VITE_ACCOUNT_ID`.
- El resto de la configuración visual y de negocio se carga desde API.
- `runtimeSchema` es la única puerta de entrada aceptada para ese payload.
- Si la API no responde, el frontend usa defaults internos razonables para no romper el render.
- Si la respuesta es inválida, el frontend degrada con defaults y registra eventos de observabilidad.

## Comportamiento operacional del frontend

- Cachea la respuesta válida en `localStorage` bajo `ecommerce-config`.
- Si la cache está fresca, la usa y revalida en background.
- Si la cache está vencida pero usable, la usa como `stale cache` y revalida en background.
- Si no hay cache y la API falla, cae a defaults internos.
- Eventos registrados:
  - `tenant_config_loaded`
  - `tenant_config_invalid`
  - `tenant_config_fallback`

## Observabilidad opcional

El frontend también admite una sección `observability` para enviar eventos a un collector remoto sin agregar nuevas variables de entorno.

```jsonc
{
  "observability": {
    "enabled": true,
    "endpoint": "https://api.ejemplo.com/api/accounts/{account_id}/frontend-events",
    "flushIntervalMs": 15000,
    "maxQueueSize": 50,
    "useBeacon": true
  }
}
```

Comportamiento:

- Los eventos se siguen guardando localmente en `sessionStorage`.
- Si `enabled=false` o no hay `endpoint`, la observabilidad remota queda en no-op.
- Si está habilitada, el frontend hace flush por intervalo y también en `pagehide` / `visibilitychange`.
- Cada evento incluye `sessionId` para correlación y detalles de negocio como `checkoutId`, `orderNumber` y `supportCode` cuando corresponde.

## Bootstrap mínimo

```env
VITE_API_BASE_URL=https://api.cumar.com.ar
VITE_ACCOUNT_ID=bed2df35-717f-4900-a4b1-7c3a7fb59b7c
```

## Endpoint

```http
GET /api/accounts/{account_id}/ecommerce-config
```

| Campo | Valor |
|-------|-------|
| Método | `GET` |
| Auth | Público |
| Path param | `account_id` UUID del tenant |
| Respuesta | `application/json` |

## Notas sobre Shipping y Newsletter

- El contrato backend canónico garantiza `shipping` y `newsletter` como secciones top-level del payload.
- Para `shipping`, el backend garantiza `enabled`, `mode`, textos principales, `chargeAmount`, `chargeProductId`, `chargeProductSku` y `taxRate`.
- El runtime del frontend todavía normaliza además `pendingLabel` y `chargeProductDescription` con defaults internos por compatibilidad visual; esos dos campos no son obligatorios en la respuesta del backend.
- Cuando `shipping.mode="flat_rate"` y `chargeAmount>0`, el checkout del frontend modela el cargo como línea trazable separada usando `chargeProductId`.
- `newsletter.endpoint` puede venir vacío o `null`; la UI debe manejarlo sin romper render ni bootstrap.

## Estructura esperada

```jsonc
{
  "success": true,
  "data": {
    "api": {
      "accountId": "15ef15b2-1a3b-4a56-be99-f618ebdb8a4a",
      "accountSlug": "warplaskateshop",
      "channel": "ecommerce",
      "extraHeaders": {
        "X-Channel": "warpla"
      }
    },
    "app": {
      "name": "DIAP",
      "companyName": "DIAP",
      "slogan": "Tecnología profesional para empresas",
      "description": "Distribuidora de productos tecnológicos",
      "url": "https://diapstore.com",
      "hidePricesForGuests": true,
      "requireAuthForCart": true,
      "loginMessage": "Inicia sesión para ver precios",
      "loginCta": "Iniciar sesión"
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
      "address": "Dirección legal",
      "jurisdiction": "Buenos Aires, Argentina"
    },
    "business": {
      "defaultTaxRate": 0.21,
      "maxQuantityPerProduct": 5,
      "defaultCurrency": "ARS",
      "defaultCountry": "Argentina",
      "businessHours": "Lunes a Viernes: 9:00 - 18:00hs",
      "returnPolicyDays": "10 días corridos",
      "refundProcessingTime": "5 a 10 días hábiles",
      "productsPerPage": 50,
      "featuredProductsCount": 8,
      "heroSliderInterval": 5000,
      "invoiceNote": "Se emite factura tipo A o B según corresponda",
      "freeShippingThreshold": 50000,
      "locale": "es-AR"
    },
    "branding": {
      "logo": "https://cdn.ejemplo.com/logo.png",
      "headerLogo": "https://cdn.ejemplo.com/header-logo.png",
      "footerLogo": "https://cdn.ejemplo.com/footer-logo.png",
      "logoDark": "",
      "favicon": "https://cdn.ejemplo.com/favicon.ico",
      "banner": "",
      "ogImage": "https://cdn.ejemplo.com/og.png"
    },
    "theme": {
      "colorPrimary": "#2563eb",
      "colorPrimaryHover": "#1d4ed8",
      "colorPrimaryForeground": "#ffffff",
      "colorSecondary": "#f1f5f9",
      "colorSecondaryForeground": "#0f172a",
      "colorBackground": "#ffffff",
      "colorForeground": "#0f172a",
      "colorSurface": "#ffffff",
      "colorSurfaceForeground": "#0f172a",
      "colorMuted": "#f1f5f9",
      "colorMutedForeground": "#64748b",
      "colorBorder": "#e2e8f0",
      "colorInput": "#e2e8f0",
      "colorRing": "#2563eb",
      "colorSuccess": "#22c55e",
      "colorWarning": "#f59e0b",
      "colorError": "#ef4444",
      "colorAccent": "#f1f5f9",
      "colorAccentForeground": "#0f172a",
      "fontFamily": "",
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
          "icon": "Truck",
          "title": "Envío Gratis",
          "description": "En compras superiores a $50.000"
        }
      ]
    },
    "shipping": {
      "enabled": true,
      "mode": "flat_rate",
      "bannerText": "Envio a cargo del cliente",
      "label": "Envio",
      "freeLabel": "Gratis",
      "drawerMessage": "Envio gratis en todas tus compras",
      "chargedMessage": "El costo de envio se suma al finalizar la compra",
      "productBadgeTitle": "Envio a todo el pais",
      "productBadgeDescription": "El cargo se informa dentro del checkout",
      "chargeAmount": 3500,
      "chargeProductId": "shipping-product-id",
      "chargeProductSku": "SHIP-001",
      "taxRate": 0.21
    },
    "newsletter": {
      "enabled": true,
      "endpoint": "https://hooks.ejemplo.com/newsletter",
      "headers": {
        "X-Tenant": "diap"
      },
      "title": "No te pierdas nuestras ofertas",
      "description": "Suscribite a nuestro newsletter y recibi descuentos exclusivos",
      "placeholder": "Tu email",
      "buttonLabel": "Suscribirse",
      "successMessage": "Gracias por suscribirte.",
      "errorMessage": "No pudimos registrar tu suscripcion. Intenta nuevamente."
    },
    "filters": {
      "enabled": false,
      "capacidad": false,
      "velocidad": false,
      "capacidadOptions": [],
      "velocidadOptions": []
    },
    "paymentMethods": {
      "transferencia": true,
      "efectivo": true,
      "mercadopago": false,
      "tarjeta": false,
      "prestamo": false
    },
    "payment": {
      "bankName": "",
      "accountHolder": "",
      "cbu": "",
      "alias": "",
      "whatsappVerification": ""
    },
    "loan": {
      "enabled": false,
      "providerName": "Prestameya",
      "title": "Pagá con préstamo",
      "subtitle": "Revisá las cuotas estimadas antes de finalizar.",
      "badgeLabel": "Disponible con préstamo",
      "termsTitle": "Pagos estimados del préstamo",
      "amountLabel": "Cuota estimada",
      "totalLabel": "Total financiado",
      "legalText": "Cuotas sujetas a evaluación crediticia.",
      "minAmount": 1000,
      "maxAmount": 5000000,
      "defaultTermMonths": 6,
      "monthlyRate": 0.035,
      "originationFeeRate": 0.02,
      "terms": [
        { "months": 3, "label": "3 pagos", "monthlyRate": 0.03 },
        { "months": 6, "label": "6 pagos", "monthlyRate": 0.035 }
      ]
    },
    "images": {
      "heroSlides": [
        {
          "image": "https://cdn.ejemplo.com/heroes/slide-1.jpg",
          "mobileImage": "https://cdn.ejemplo.com/heroes/slide-1-mobile.jpg",
          "title": "Hero principal",
          "subtitle": "Texto del hero",
          "cta": "Ver productos",
          "link": "/productos"
        }
      ],
      "categories": [
        {
          "name": "Tablas",
          "image": "https://cdn.ejemplo.com/categories/tablas.jpg",
          "link": "/productos?category=tablas",
          "description": "Decks y tablas completas",
          "slug": "tablas",
          "group": "Skateboarding",
          "searchTerms": ["tablas", "deck", "skate"],
          "productCategories": ["tablas"]
        }
      ],
      "placeholders": {
        "product": "https://cdn.ejemplo.com/placeholder-product.svg",
        "category": "https://cdn.ejemplo.com/placeholder-category.svg",
        "user": "https://cdn.ejemplo.com/placeholder-user.svg"
      },
      "backgrounds": {
        "hero": "",
        "features": "",
        "testimonials": ""
      },
      "banners": {
        "main": "",
        "secondary": "",
        "seasonal": "",
        "sale": ""
      },
      "productFallbacks": {}
    }
  }
}
```

## Campos nuevos útiles para migraciones tipo Warpla

- `api.extraHeaders`: headers por tenant para integraciones puntuales.
- `branding.headerLogo` y `branding.footerLogo`: permiten separar logos sin volver a env vars.
- `features.benefits[]`: cards configurables para home/footer.
- `shipping`: centraliza textos visibles de envío y permite modelar envío con cargo como un item trazable en checkout usando `chargeProductId`.
- `newsletter`: define la URL y los textos del POST de suscripción del home.
- `images.heroSlides[].mobileImage`: hero responsive por tenant.
- `images.categories[].group`: agrupación de categorías para navegación.
- `images.categories[].productCategories`: taxonomía estructurada para matchear productos sin depender solo de texto libre.

## Export listo para Warpla

Se dejó un export utilizable en:

- [exports/warpla-platform-upload/ecommerce-config.body.json](/home/andis/simpleEcommerce/exports/warpla-platform-upload/ecommerce-config.body.json)
- [exports/warpla-platform-upload/assets](/home/andis/simpleEcommerce/exports/warpla-platform-upload/assets)
