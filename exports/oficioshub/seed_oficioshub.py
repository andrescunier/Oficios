#!/usr/bin/env python3
"""Seed OficiosHub: marketplace de servicios (productos) brindados por proveedores (personas)."""
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

ACCOUNT_ID = "cccedb72-8267-4513-9b9f-48c2d1fae78d"
ACCOUNT_SLUG = "oficioshub"
API = "https://api.cumar.com.ar"
EMAIL = "oficioshub@cumar.com.ar"
PASSWORD = "Hola4751.."
STOREFRONT = "https://oficioshub.cumar.com.ar"
BRAND = "/branding/oficioshub"


def asset(name: str) -> str:
    # query bust helps when Cloudflare cached early 404s from misrouting
    return f"{BRAND}/{name}?v=20260715a"


def api(method: str, path: str, token: str | None = None, body: dict | None = None):
    data = None if body is None else json.dumps(body, ensure_ascii=True).encode("ascii")
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/126.0.0.0 Safari/537.36"
        ),
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    headers["X-Account-ID"] = ACCOUNT_ID
    headers["X-Account-Slug"] = ACCOUNT_SLUG
    req = urllib.request.Request(f"{API}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = {"raw": raw[:800]}
        return e.code, payload


def login() -> str:
    status, payload = api(
        "POST",
        "/api/auth/login",
        body={"email": EMAIL, "password": PASSWORD},
    )
    if status >= 400:
        raise SystemExit(f"Login falló HTTP {status}: {payload}")
    data = payload.get("data") or payload
    token = data.get("access_token")
    if not token:
        raise SystemExit(f"Login sin token: {payload}")
    print(f"OK login account={data.get('account_id') or ACCOUNT_ID}")
    return token


def cat(
    name: str,
    slug: str,
    description: str,
    search_terms: list[str],
    group: str = "Oficios",
) -> dict:
    return {
        "name": name,
        "image": asset("mark.svg"),
        "link": f"/productos?buscar={slug}",
        "description": description,
        "slug": slug,
        "group": group,
        "searchTerms": search_terms,
        "productCategories": [name],
        "subcategories": [],
    }


def build_config() -> dict:
    return {
        "version": "1.0.0",
        "api": {
            "storefrontBaseUrl": STOREFRONT,
            "assetsBaseUrl": "",
            "supportBaseUrl": "",
            "extraHeaders": {"X-Channel": "ecommerce"},
        },
        "app": {
            "name": "OficiosHub",
            "companyName": "OficiosHub",
            "slogan": "Servicios de personas, para personas",
            "description": (
                "Marketplace donde proveedores ofrecen sus oficios como servicios "
                "y los clientes los contratan online."
            ),
            "url": STOREFRONT,
            "hidePricesForGuests": False,
            "requireAuthForCart": False,
            "loginMessage": "Ingresá para contratar servicios y gestionar tus pedidos",
            "loginCta": "Ingresar",
        },
        "contact": {
            "email": "hola@oficioshub.cumar.com.ar",
            "salesEmail": "proveedores@oficioshub.cumar.com.ar",
            "phone": "+54 11 5555 0100",
            "whatsapp": "5491155550100",
            "address": "Buenos Aires, Argentina",
        },
        "legal": {
            "companyName": "OficiosHub",
            "cuit": "00000000000",
            "address": "Buenos Aires, Argentina",
            "jurisdiction": "CABA, Argentina",
        },
        "business": {
            "defaultTaxRate": 0.21,
            "maxQuantityPerProduct": 20,
            "defaultCurrency": "ARS",
            "defaultCountry": "AR",
            "businessHours": "Lunes a Sábado 8:00 a 20:00",
            "returnPolicyDays": 0,
            "refundProcessingTime": "A coordinar con el proveedor",
            "productsPerPage": 24,
            "featuredProductsCount": 8,
            "heroSliderInterval": 6000,
            "invoiceNote": "Los servicios se facturan según la condición fiscal del proveedor.",
            "freeShippingThreshold": 0,
            "locale": "es-AR",
        },
        "branding": {
            "logo": asset("logo.svg"),
            "headerLogo": asset("logo.svg"),
            "footerLogo": asset("logo.svg"),
            "logoDark": asset("logo.svg"),
            "favicon": asset("favicon.svg"),
            "banner": asset("hero-oficios.svg"),
            "ogImage": asset("og.svg"),
        },
        "theme": {
            "colorPrimary": "#14213D",
            "colorPrimaryHover": "#0D1729",
            "colorPrimaryForeground": "#FFFFFF",
            "colorSecondary": "#EEF2F6",
            "colorSecondaryForeground": "#14213D",
            "colorBackground": "#EEF2F6",
            "colorForeground": "#14213D",
            "colorSurface": "#FFFFFF",
            "colorSurfaceForeground": "#14213D",
            "colorMuted": "#E2E8F0",
            "colorMutedForeground": "#4B5563",
            "colorBorder": "#CBD5E1",
            "colorInput": "#CBD5E1",
            "colorRing": "#FCA311",
            "colorSuccess": "#2F9E6E",
            "colorWarning": "#E08E00",
            "colorError": "#C2410C",
            "colorAccent": "#FCA311",
            "colorAccentForeground": "#14213D",
            "fontFamily": "'Outfit', system-ui, sans-serif",
            "fontUrl": "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Bricolage+Grotesque:wght@600;700;800&display=swap",
        },
        "social": {
            "facebook": "",
            "instagram": "",
            "twitter": "",
            "linkedin": "",
        },
        "features": {
            "notifications": True,
            "analytics": False,
            "realPayments": False,
            "benefits": [
                {
                    "icon": "BadgeCheck",
                    "title": "Proveedores reales",
                    "description": "Cada servicio lo brinda una persona con oficio publicado",
                },
                {
                    "icon": "Package",
                    "title": "Contratá online",
                    "description": "Elegí el servicio, pedí y coordiná fecha con el proveedor",
                },
                {
                    "icon": "Shield",
                    "title": "Pedido trazable",
                    "description": "Tu contratación queda registrada en la plataforma",
                },
                {
                    "icon": "Truck",
                    "title": "A domicilio",
                    "description": "La mayoría de los oficios se hacen en tu casa u obra",
                },
            ],
        },
        "filters": {
            "enabled": True,
            "capacidad": False,
            "velocidad": False,
            "capacidadOptions": [],
            "velocidadOptions": [],
        },
        "paymentMethods": {
            "transferencia": True,
            "efectivo": True,
            "mercadopago": False,
            "tarjeta": False,
            "prestamo": False,
        },
        "payment": {
            "bankName": "Mercado Pago",
            "accountHolder": "OficiosHub",
            "cbu": "",
            "alias": "oficios.hub",
            "whatsappVerification": "5491155550100",
        },
        "loan": {"enabled": False},
        "observability": {
            "enabled": False,
            "endpoint": None,
            "flushIntervalMs": 15000,
            "maxQueueSize": 50,
            "useBeacon": True,
        },
        "shipping": {
            "enabled": True,
            "mode": "flat_rate",
            "bannerText": "Los servicios se coordinan directo con cada proveedor",
            "label": "Visita / coordinación",
            "freeLabel": "Incluida",
            "pendingLabel": "A coordinar",
            "chargedMessage": "La visita se coordina al confirmar el pedido",
            "drawerMessage": "Cada proveedor confirma día y horario",
            "productBadgeTitle": "Modalidad",
            "productBadgeDescription": "Servicio a domicilio o en taller",
            "chargeAmount": 0,
            "chargeProductId": None,
            "chargeProductSku": None,
            "chargeProductDescription": "Coordinación de visita",
            "taxRate": 0.21,
        },
        "newsletter": {
            "enabled": True,
            "endpoint": None,
            "headers": {},
            "title": "Oficios y tips en tu correo",
            "description": "Novedades de proveedores y servicios destacados",
            "placeholder": "tu@email.com",
            "buttonLabel": "Suscribirme",
            "successMessage": "¡Listo! Te avisamos las próximas novedades",
            "errorMessage": "No se pudo suscribir. Probá de nuevo",
        },
        "registration": {
            "title": "Crear cuenta",
            "subtitle": "Registrate para contratar servicios de proveedores",
            "submitLabel": "Crear cuenta",
            "successMessage": "Cuenta creada con éxito",
            "acceptTermsLabel": "Acepto los términos y condiciones",
            "alreadyHaveAccountText": "¿Ya tenés cuenta?",
            "alreadyHaveAccountLinkText": "Ingresá acá",
            "fields": [
                {
                    "name": "email",
                    "label": "Email",
                    "placeholder": "tu@email.com",
                    "required": True,
                    "visible": True,
                },
                {
                    "name": "password",
                    "label": "Contraseña",
                    "placeholder": "Tu contraseña",
                    "required": True,
                    "visible": True,
                    "type": "password",
                },
                {
                    "name": "confirmPassword",
                    "label": "Confirmar contraseña",
                    "placeholder": "Repetí la contraseña",
                    "required": False,
                    "visible": True,
                    "type": "password",
                },
                {
                    "name": "company_name",
                    "label": "Nombre o empresa",
                    "placeholder": "Cómo te llamamos",
                    "required": True,
                    "visible": True,
                },
                {
                    "name": "tax_id",
                    "label": "CUIT / CUIL",
                    "placeholder": "20-12345678-9",
                    "required": False,
                    "visible": True,
                },
                {
                    "name": "phone",
                    "label": "Celular",
                    "placeholder": "11 5555 0100",
                    "required": True,
                    "visible": True,
                    "type": "tel",
                },
            ],
        },
        "validation": {
            "passwordMinLength": 8,
            "passwordRequireUppercase": True,
            "passwordRequireLowercase": True,
            "passwordRequireNumber": True,
            "passwordRequireSymbol": False,
            "zipRegex": "^[0-9]{4}$",
            "phoneRegex": "^[0-9+\\s()-]{8,20}$",
            "taxIdRegex": "",
            "messages": {
                "invalidZip": "El código postal no es válido",
                "invalidEmail": "Ingresá un email válido",
                "invalidPhone": "El celular no tiene un formato válido",
                "fieldRequired": "{field} es obligatorio",
                "loginGreeting": "¡Bienvenido/a {name}!",
                "requiredField": "Este campo es obligatorio",
                "passwordTooShort": "La contraseña debe tener al menos {min} caracteres",
                "loginGenericError": "No se pudo ingresar. Probá de nuevo",
                "passwordsDontMatch": "Las contraseñas no coinciden",
                "acceptTermsRequired": "Tenés que aceptar los términos y condiciones",
                "passwordNeedsNumber": "Debe incluir al menos un número",
                "passwordNeedsSymbol": "Debe incluir al menos un símbolo",
                "sessionCleanedTitle": "Sesión limpia",
                "registerGenericError": "No pudimos crear tu cuenta. Probá más tarde",
                "registerSuccessTitle": "¡Cuenta creada!",
                "sessionCleanedMessage": "La sesión local quedó limpia. Volvé a ingresar",
                "passwordNeedsLowercase": "Debe incluir al menos una minúscula",
                "passwordNeedsUppercase": "Debe incluir al menos una mayúscula",
                "registerSuccessMessage": "Te mandamos un mail a {email} para confirmar la cuenta",
                "checkoutAuthRequiredTitle": "Ingresá a tu cuenta",
                "checkoutFieldRequiredTitle": "Faltan datos",
                "checkoutAuthRequiredMessage": "Para contratar necesitás ingresar",
                "checkoutFieldRequiredMessage": "Completá el campo: {field}",
            },
        },
        "seo": {
            "title": "OficiosHub · Marketplace de servicios",
            "description": "Contratá plomería, electricidad, pintura y más oficios de proveedores reales.",
            "robots": "index,follow",
            "keywords": [
                "oficios",
                "servicios",
                "marketplace",
                "plomería",
                "electricidad",
                "proveedores",
            ],
            "defaultTitle": "OficiosHub · Servicios de proveedores",
            "titleTemplate": "{title} | OficiosHub",
            "defaultDescription": "Marketplace para contratar servicios de oficios brindados por proveedores.",
            "defaultKeywords": "oficios, servicios, marketplace, proveedores",
            "defaultOgImage": asset("og.svg"),
            "twitterHandle": "",
            "canonicalBaseUrl": STOREFRONT,
            "enableJsonLd": True,
            "enableProductJsonLd": True,
            "organization": {
                "name": "OficiosHub",
                "url": STOREFRONT,
                "logo": asset("logo.svg"),
                "sameAs": [],
            },
            "routes": {
                "/": {
                    "title": "Inicio",
                    "description": "Contratá oficios de proveedores en tu zona.",
                },
                "/productos": {
                    "title": "Servicios",
                    "description": "Catálogo de servicios por oficio y proveedor.",
                },
                "/contacto": {
                    "title": "Contacto",
                    "description": "Escribinos para sumarte como proveedor o cliente.",
                },
            },
        },
        "pages": {
            "about": (
                "OficiosHub es un marketplace donde personas publican sus oficios como servicios "
                "y otras personas los contratan. Los productos del catálogo son servicios; "
                "los proveedores son las personas que los brindan."
            ),
            "terms": (
                "Al contratar un servicio aceptás coordinar fecha, alcance y forma de pago "
                "con el proveedor. OficiosHub facilita el pedido; la ejecución la realiza el proveedor."
            ),
            "contact": "Escribinos a hola@oficioshub.cumar.com.ar o por WhatsApp.",
            "privacy": "Cuidamos tus datos conforme a la normativa argentina de protección de datos.",
            "cookies": "Usamos cookies técnicas para el carrito, la sesión y el funcionamiento del marketplace.",
        },
        "images": {
            "heroSlides": [
                {
                    "image": asset("hero-oficios.svg"),
                    "title": "OficiosHub",
                    "subtitle": "Contratá servicios de proveedores: plomería, electricidad, pintura y más",
                    "cta": "Ver servicios",
                    "link": "/productos",
                },
                {
                    "image": asset("og.svg"),
                    "title": "Proveedores con oficio",
                    "subtitle": "Cada servicio lo ofrece una persona. Elegí, pedí y coordiná",
                    "cta": "Explorar oficios",
                    "link": "/productos",
                },
            ],
            "categories": [
                cat("Plomería", "plomeria", "Destapes, instalaciones y reparaciones", ["plomería", "caño", "destape"]),
                cat("Electricidad", "electricidad", "Instalaciones y tableros", ["electricidad", "enchufe", "tablero"]),
                cat("Gas", "gas", "Artefactos y conexiones de gas", ["gas", "calefón", "cocina"]),
                cat("Albañilería", "albanileria", "Refacciones y obra liviana", ["albañilería", "revoque", "obra"]),
                cat("Pintura", "pintura", "Interior, exterior y terminaciones", ["pintura", "látex", "pintor"]),
                cat("Carpintería", "carpinteria", "Muebles, puertas y reparaciones", ["carpintería", "madera", "puerta"]),
                cat("Climatización", "climatizacion", "Aires, splits y mantenimiento", ["aire", "split", "climatización"]),
                cat("Jardinería", "jardineria", "Poda, césped y mantenimiento", ["jardinería", "poda", "césped"]),
            ],
            "placeholders": {
                "product": asset("mark.svg"),
                "category": asset("mark.svg"),
                "user": asset("mark.svg"),
            },
            "backgrounds": {
                "hero": asset("hero-oficios.svg"),
                "features": "",
                "testimonials": "",
            },
            "banners": {
                "main": asset("hero-oficios.svg"),
                "secondary": "",
                "seasonal": "",
                "sale": "",
            },
            "productFallbacks": {"default": asset("mark.svg")},
        },
        "header": {
            "showSearch": True,
            "showCategoriesMenu": True,
            "showFavorites": True,
            "showOrders": True,
            "showAccount": True,
            "showCart": True,
            "topBarMessage": "Marketplace de oficios · Contratá servicios de proveedores reales",
            "topBarHref": "/productos",
            "menu": [
                {"label": "Servicios", "href": "/productos"},
                {"label": "Oficios", "href": "/productos"},
                {"label": "Contacto", "href": "/contacto"},
            ],
        },
        "footer": {
            "sections": [
                {
                    "title": "Oficios",
                    "links": [
                        {"label": "Plomería", "href": "/productos?buscar=plomeria"},
                        {"label": "Electricidad", "href": "/productos?buscar=electricidad"},
                        {"label": "Pintura", "href": "/productos?buscar=pintura"},
                    ],
                },
                {
                    "title": "Ayuda",
                    "links": [
                        {"label": "Contacto", "href": "/contacto"},
                        {"label": "Seguimiento", "href": "/seguimiento"},
                        {"label": "Términos", "href": "/terminos"},
                    ],
                },
            ],
            "showWhatsappCapture": True,
            "whatsappOptInMessage": "Hola! Quiero contratar un servicio en OficiosHub.",
            "whatsappOptInSuccessMessage": "¡Listo! Te abrimos WhatsApp para continuar.",
            "withdrawalWhatsappMessage": "Quiero cancelar o modificar mi contratación en OficiosHub.",
            "paymentMethods": ["Transferencia", "Efectivo"],
            "showSocial": True,
            "showPaymentBadges": True,
        },
        "checkout": {
            "steps": ["shipping", "payment", "review"],
            "guestCheckoutEnabled": False,
            "fields": [
                {
                    "name": "firstName",
                    "label": "Nombre",
                    "required": True,
                    "visible": True,
                    "type": "text",
                    "step": "shipping",
                    "group": "account",
                },
                {
                    "name": "lastName",
                    "label": "Apellido",
                    "required": True,
                    "visible": True,
                    "type": "text",
                    "step": "shipping",
                    "group": "account",
                },
                {
                    "name": "email",
                    "label": "Email",
                    "required": True,
                    "visible": True,
                    "type": "email",
                    "step": "shipping",
                    "group": "account",
                },
                {
                    "name": "phone",
                    "label": "Celular",
                    "required": True,
                    "visible": True,
                    "type": "tel",
                    "step": "shipping",
                    "group": "account",
                },
                {
                    "name": "address",
                    "label": "Dirección del servicio",
                    "required": True,
                    "visible": True,
                    "type": "text",
                    "step": "shipping",
                    "group": "address",
                },
                {
                    "name": "city",
                    "label": "Localidad",
                    "required": True,
                    "visible": True,
                    "type": "text",
                    "step": "shipping",
                    "group": "address",
                },
                {
                    "name": "state",
                    "label": "Provincia",
                    "required": True,
                    "visible": True,
                    "type": "text",
                    "step": "shipping",
                    "group": "address",
                },
                {
                    "name": "zipCode",
                    "label": "Código postal",
                    "required": True,
                    "visible": True,
                    "type": "text",
                    "step": "shipping",
                    "group": "address",
                },
            ],
            "showOrderNotes": True,
            "orderNotesLabel": "Detalle del trabajo",
            "orderNotesPlaceholder": "Describí el problema, horarios preferidos, acceso al domicilio...",
            "showCouponInput": False,
            "couponPlaceholder": "Código de descuento",
            "couponApplyLabel": "Aplicar",
        },
        "wishlist": {"enabled": True, "storageKey": "wishlist_oficioshub_v1", "requireAuth": False},
        "consent": {
            "enabled": True,
            "title": "Usamos cookies para que el marketplace funcione",
            "body": "Usamos cookies propias para el carrito, la sesión y mejorar la experiencia. Podés aceptar o rechazar.",
            "acceptLabel": "Aceptar",
            "rejectLabel": "Rechazar",
            "preferencesLabel": "Preferencias",
            "learnMoreLabel": "Más info",
            "learnMoreHref": "/cookies",
            "storageKey": "cookie_consent_oficioshub_v1",
            "blockAnalyticsUntilConsent": True,
        },
        "analytics": {
            "enabled": False,
            "ga4MeasurementId": "",
            "gtmContainerId": "",
            "facebookPixelId": "",
            "hotjarId": "",
            "clarityId": "",
            "anonymizeIp": True,
            "trackPageViews": True,
            "trackEcommerce": True,
        },
        "ui": {
            "searchPlaceholder": "Buscar oficio, servicio o proveedor...",
            "noProductsTitle": "No encontramos servicios",
            "noProductsMessage": "Probá con otro oficio o mirá el catálogo completo",
            "loginTitle": "Ingresar a OficiosHub",
            "loginSubtitle": "Accedé para contratar servicios de proveedores",
            "cartEmptyTitle": "Todavía no elegiste servicios",
            "cartEmptyMessage": "Sumá un oficio al pedido para contratarlo",
            "checkoutFinalizeLabel": "Confirmar contratación",
            "addToCartLabel": "Contratar servicio",
            "homeHeroCta": "Ver servicios",
            "homeFeaturedTitle": "Servicios destacados",
            "homeFeaturedSubtitle": "Oficios que más se contratan esta semana",
            "homeCategoriesTitle": "Oficios",
            "homeCategoriesSubtitle": "Elegí el rubro y encontrá proveedores",
            "homeNewTitle": "Nuevos en el hub",
            "homeNewSubtitle": "Últimos servicios publicados por proveedores",
        },
    }


# product = servicio; provider_* = persona que lo brinda
PRODUCTS = [
    {
        "sku": "OH-PLO-DES-01",
        "name": "Destape de cañerías",
        "description": "Destape de cocina, baño o cloaca con equipo profesional. Incluye diagnóstico en domicilio.",
        "unit_price": 45000,
        "stock_quantity": 50,
        "stock_unit": "servicio",
        "family": "Hogar",
        "category": "Plomería",
        "subcategory": "Destapes",
        "provider_name": "Martín Acosta",
        "provider_headline": "Plomero matriculado · CABA y GBA",
    },
    {
        "sku": "OH-PLO-INS-01",
        "name": "Instalación de grifería",
        "description": "Cambio o instalación de grifería de cocina/baño. Mano de obra; grifería a cargo del cliente o a cotizar.",
        "unit_price": 38000,
        "stock_quantity": 40,
        "stock_unit": "servicio",
        "family": "Hogar",
        "category": "Plomería",
        "subcategory": "Instalaciones",
        "provider_name": "Martín Acosta",
        "provider_headline": "Plomero matriculado · CABA y GBA",
    },
    {
        "sku": "OH-ELE-TAB-01",
        "name": "Revisión de tablero eléctrico",
        "description": "Chequeo de tablero, termomagnéticas y puesta a tierra. Informe y recomendaciones.",
        "unit_price": 52000,
        "stock_quantity": 30,
        "stock_unit": "servicio",
        "family": "Hogar",
        "category": "Electricidad",
        "subcategory": "Tableros",
        "provider_name": "Lucía Fernández",
        "provider_headline": "Electricista · instalaciones domiciliarias",
    },
    {
        "sku": "OH-ELE-PUN-01",
        "name": "Puntos de luz y tomas",
        "description": "Instalación de hasta 3 puntos de luz o tomacorrientes. Cableado embutido o exterior según obra.",
        "unit_price": 68000,
        "stock_quantity": 25,
        "stock_unit": "servicio",
        "family": "Hogar",
        "category": "Electricidad",
        "subcategory": "Instalaciones",
        "provider_name": "Lucía Fernández",
        "provider_headline": "Electricista · instalaciones domiciliarias",
    },
    {
        "sku": "OH-GAS-CAL-01",
        "name": "Instalación de calefón",
        "description": "Instalación de calefón a gas con prueba de hermeticidad. Artefacto a cargo del cliente.",
        "unit_price": 95000,
        "stock_quantity": 20,
        "stock_unit": "servicio",
        "family": "Hogar",
        "category": "Gas",
        "subcategory": "Artefactos",
        "provider_name": "Diego Rivas",
        "provider_headline": "Gasista matriculado",
    },
    {
        "sku": "OH-ALB-REV-01",
        "name": "Reparación de revoque",
        "description": "Reparación de revoque y fisuras en pared interior (hasta 4 m²). Incluye preparación y terminación.",
        "unit_price": 72000,
        "stock_quantity": 35,
        "stock_unit": "servicio",
        "family": "Obra",
        "category": "Albañilería",
        "subcategory": "Refacciones",
        "provider_name": "Pedro Gómez",
        "provider_headline": "Albañil · refacciones y obra liviana",
    },
    {
        "sku": "OH-PIN-INT-01",
        "name": "Pintura interior por ambiente",
        "description": "Pintura de un ambiente estándar (hasta 12 m²). Incluye preparación liviana y dos manos.",
        "unit_price": 110000,
        "stock_quantity": 40,
        "stock_unit": "servicio",
        "family": "Terminaciones",
        "category": "Pintura",
        "subcategory": "Interior",
        "provider_name": "Ana Beltrán",
        "provider_headline": "Pintora profesional",
    },
    {
        "sku": "OH-PIN-EXT-01",
        "name": "Pintura de frente",
        "description": "Pintura de frente de casa o PH (hasta 30 m²). Presupuesto a confirmar según estado.",
        "unit_price": 185000,
        "stock_quantity": 15,
        "stock_unit": "servicio",
        "family": "Terminaciones",
        "category": "Pintura",
        "subcategory": "Exterior",
        "provider_name": "Ana Beltrán",
        "provider_headline": "Pintora profesional",
    },
    {
        "sku": "OH-CAR-PUE-01",
        "name": "Ajuste y reparación de puertas",
        "description": "Ajuste de bisagras, cepillado y cierre de puertas interiores. Hasta 2 puertas.",
        "unit_price": 42000,
        "stock_quantity": 30,
        "stock_unit": "servicio",
        "family": "Hogar",
        "category": "Carpintería",
        "subcategory": "Reparaciones",
        "provider_name": "Sofía Ruiz",
        "provider_headline": "Carpintera · muebles y aberturas",
    },
    {
        "sku": "OH-CLI-SPL-01",
        "name": "Instalación de split",
        "description": "Instalación de aire split hasta 3000 frigorías. Incluye soporte y conexión básica.",
        "unit_price": 140000,
        "stock_quantity": 18,
        "stock_unit": "servicio",
        "family": "Hogar",
        "category": "Climatización",
        "subcategory": "Instalación",
        "provider_name": "Nicolás Vega",
        "provider_headline": "Técnico en climatización",
    },
    {
        "sku": "OH-CLI-MNT-01",
        "name": "Service de aire acondicionado",
        "description": "Limpieza y service de split o ventana. Incluye filtros y chequeo de gas.",
        "unit_price": 48000,
        "stock_quantity": 45,
        "stock_unit": "servicio",
        "family": "Hogar",
        "category": "Climatización",
        "subcategory": "Mantenimiento",
        "provider_name": "Nicolás Vega",
        "provider_headline": "Técnico en climatización",
    },
    {
        "sku": "OH-JAR-POD-01",
        "name": "Poda y mantenimiento de jardín",
        "description": "Poda liviana, corte de césped y limpieza de jardín chico/mediano (hasta 80 m²).",
        "unit_price": 55000,
        "stock_quantity": 40,
        "stock_unit": "servicio",
        "family": "Exterior",
        "category": "Jardinería",
        "subcategory": "Mantenimiento",
        "provider_name": "Camila Soto",
        "provider_headline": "Jardinera · mantenimiento residencial",
    },
]


def put_config(token: str, config: dict) -> None:
    status, payload = api(
        "PUT",
        f"/api/accounts/{ACCOUNT_ID}/ecommerce-config",
        token=token,
        body=config,
    )
    if status >= 400:
        raise SystemExit(
            f"PUT ecommerce-config falló HTTP {status}: {json.dumps(payload, ensure_ascii=False)[:2000]}"
        )
    print(f"OK ecommerce-config version={(payload.get('data') or {}).get('version')}")


def create_products(token: str) -> None:
    created = 0
    skipped = 0
    for raw in PRODUCTS:
        item = dict(raw)
        provider_name = item.pop("provider_name")
        provider_headline = item.pop("provider_headline")
        description = (
            f"{item['description']} Proveedor: {provider_name} — {provider_headline}."
        )
        body = {
            **item,
            "description": description,
            "currency": "ARS",
            "tax_rate": 0.21,
            "status": "active",
            "product_type": "service",
            "track_inventory": True,
            "allow_backorders": True,
            "stock_min": 0,
            "image_url": asset("mark.svg"),
            "thumbnail_url": asset("mark.svg"),
            "metadata": {
                "kind": "service",
                "marketplace": "oficioshub",
                "provider": {
                    "name": provider_name,
                    "headline": provider_headline,
                    "type": "person",
                },
                "rubro": item["family"],
                "country": "AR",
                "locale": "es-AR",
                "channels": ["ecommerce"],
                "showecommerce": True,
                "public": {
                    "channels": ["ecommerce"],
                    "showecommerce": True,
                    "provider_name": provider_name,
                },
            },
        }
        status, payload = api(
            "POST",
            f"/api/accounts/{ACCOUNT_ID}/products",
            token=token,
            body=body,
        )
        if status in (200, 201):
            created += 1
            print(f"  + {item['sku']} · {provider_name} · {item['name']}")
        elif status == 409 or "Ya existe" in json.dumps(payload, ensure_ascii=False):
            skipped += 1
            print(f"  = existe {item['sku']}")
        else:
            # Fallback product_type if API rejects "service"
            if status == 422 and "product_type" in json.dumps(payload, ensure_ascii=False):
                body["product_type"] = "physical"
                status2, payload2 = api(
                    "POST",
                    f"/api/accounts/{ACCOUNT_ID}/products",
                    token=token,
                    body=body,
                )
                if status2 in (200, 201):
                    created += 1
                    print(f"  + {item['sku']} (physical fallback) · {provider_name}")
                    continue
                print(
                    f"  ! FAIL {item['sku']} HTTP {status2}: "
                    f"{json.dumps(payload2, ensure_ascii=False)[:400]}"
                )
            else:
                print(
                    f"  ! FAIL {item['sku']} HTTP {status}: "
                    f"{json.dumps(payload, ensure_ascii=False)[:400]}"
                )
    print(f"OK productos created={created} skipped={skipped} total={len(PRODUCTS)}")


def verify() -> None:
    status, payload = api("GET", f"/api/accounts/{ACCOUNT_ID}/ecommerce-config")
    print(
        f"GET ecommerce-config -> {status} "
        f"name={(payload.get('data') or {}).get('app', {}).get('name')}"
    )
    status, payload = api(
        "GET", f"/api/accounts/{ACCOUNT_ID}/products/public?page=1&page_size=50"
    )
    data = payload.get("data") or []
    print(
        f"GET products/public -> {status} "
        f"count={len(data) if isinstance(data, list) else payload.get('pagination')}"
    )


def main() -> int:
    out_dir = Path(__file__).resolve().parent
    config = build_config()
    (out_dir / "ecommerce-config.body.json").write_text(
        json.dumps(config, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Wrote {out_dir / 'ecommerce-config.body.json'}")

    token = login()
    put_config(token, config)
    create_products(token)
    verify()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
