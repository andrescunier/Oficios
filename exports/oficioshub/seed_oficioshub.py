#!/usr/bin/env python3
"""Seed OficiosHub: marketplace de servicios (productos) brindados por proveedores (personas)."""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from oficioshub_pages import build_pages  # noqa: E402

ACCOUNT_ID = "cccedb72-8267-4513-9b9f-48c2d1fae78d"
ACCOUNT_SLUG = "oficioshub"
API = os.environ.get("OFICIOSHUB_API", "https://api.cumar.com.ar")
EMAIL = "oficioshub@cumar.com.ar"
PASSWORD = "Hola4751.."
STOREFRONT = "https://oficioshub.cumar.com.ar"
BRAND = "/branding/oficioshub"


ASSET_V = "20260716c"


def asset(name: str) -> str:
    # query bust helps when Cloudflare cached early 404s from misrouting
    return f"{BRAND}/{name}?v={ASSET_V}"


def photo(name: str) -> str:
    return asset(f"photos/{name}")


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
    image: str,
    group: str = "Personas",
) -> dict:
    return {
        "name": name,
        "image": image,
        "link": f"/categoria/{slug}",
        "description": description,
        "slug": slug,
        "group": group,
        "searchTerms": search_terms,
        "productCategories": [name],
        "subcategories": [],
    }


BARRIO_OPTIONS = [
    {"value": zone, "label": zone}
    for zone in (
        "Palermo",
        "Belgrano",
        "Caballito",
        "Flores",
        "Recoleta",
        "Villa Crespo",
        "Almagro",
        "San Telmo",
        "Ramos Mejía",
        "Morón",
        "Quilmes",
        "Avellaneda",
        "San Isidro",
        "Vicente López",
        "Lanús",
        "Lomas de Zamora",
    )
]


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
            "slogan": "Vecinos con oficio, cerca tuyo",
            "description": (
                "Marketplace de personas particulares que ofrecen un oficio: "
                "alguien que arregla, pinta o cuida tu casa. No es un directorio de empresas."
            ),
            "url": STOREFRONT,
            "hidePricesForGuests": False,
            "requireAuthForCart": False,
            "loginMessage": "Ingresá para contratar a una persona y seguir tus pedidos",
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
            "banner": photo("hero-home.jpg"),
            "ogImage": photo("hero-person.jpg"),
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
            "skuGrouping": False,
            "benefits": [
                {
                    "icon": "BadgeCheck",
                    "title": "Personas, no empresas",
                    "description": "Cada perfil es alguien particular con un oficio, no un rubro corporativo",
                },
                {
                    "icon": "Users",
                    "title": "Pocos oficios, claros",
                    "description": "Hogar, electricidad, pintura y exterior: fácil de elegir",
                },
                {
                    "icon": "MessageCircle",
                    "title": "Coordinás con la persona",
                    "description": "Pedís online y arreglás día y detalle directo con quien lo hace",
                },
                {
                    "icon": "Star",
                    "title": "Reseñas reales",
                    "description": "Quienes contrataron puntúan servicio, limpieza y puntualidad",
                },
            ],
        },
        "filters": {
            "enabled": True,
            "capacidad": False,
            "velocidad": False,
            "stock": False,
            "barrio": True,
            "capacidadOptions": [],
            "velocidadOptions": [],
            "barrioOptions": BARRIO_OPTIONS,
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
            "bannerText": "Indicás fecha, hora y zona; el proveedor acepta por OficiosHub",
            "label": "Visita / coordinación",
            "freeLabel": "Incluida",
            "pendingLabel": "A coordinar por OficiosHub",
            "chargedMessage": "Sin contacto directo: todo se coordina por OficiosHub",
            "drawerMessage": "El proveedor acepta la reserva; cobro tras tu OK de calidad",
            "productBadgeTitle": "Modalidad",
            "productBadgeDescription": "Intermediado por OficiosHub",
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
            "description": "Tips de oficios y personas nuevas en el hub",
            "placeholder": "tu@email.com",
            "buttonLabel": "Suscribirme",
            "successMessage": "¡Listo! Te avisamos las próximas novedades",
            "errorMessage": "No se pudo suscribir. Probá de nuevo",
        },
        "registration": {
            "title": "Crear cuenta",
            "subtitle": "Registrate para contratar a personas con oficio",
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
                    "label": "Tu nombre",
                    "placeholder": "Ej: Martín Acosta",
                    "required": True,
                    "visible": True,
                },
                {
                    "name": "tax_id",
                    "label": "CUIT / CUIL (opcional)",
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
            "title": "OficiosHub · Personas con oficio cerca tuyo",
            "description": "Contratá a vecinos que arreglan el hogar, electricidad, pintura o exterior. Personas particulares, no empresas.",
            "robots": "index,follow",
            "keywords": [
                "oficios",
                "personas",
                "hogar",
                "electricidad",
                "pintura",
                "jardín",
            ],
            "defaultTitle": "OficiosHub · Personas con oficio",
            "titleTemplate": "{title} | OficiosHub",
            "defaultDescription": "Marketplace de personas particulares que ofrecen un oficio en tu zona.",
            "defaultKeywords": "oficios, personas, hogar, electricidad, pintura",
            "defaultOgImage": photo("hero-person.jpg"),
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
                    "description": "Encontrá personas con oficio cerca tuyo.",
                },
                "/productos": {
                    "title": "Servicios",
                    "description": "Servicios publicados por personas particulares.",
                },
                "/contacto": {
                    "title": "Contacto",
                    "description": "Escribinos para sumarte u obtener ayuda.",
                },
            },
        },
        "pages": build_pages(),
        "images": {
            "heroSlides": [
                {
                    "image": photo("hero-home.jpg"),
                    "title": "OficiosHub",
                    "subtitle": "Personas particulares que arreglan, pintan o cuidan tu casa",
                    "cta": "Ver personas",
                    "link": "/productos",
                },
                {
                    "image": photo("hero-person.jpg"),
                    "title": "Un oficio, una persona",
                    "subtitle": "Pocas categorías. Pedís, el proveedor acepta y todo pasa por OficiosHub",
                    "cta": "Explorar",
                    "link": "/productos",
                },
            ],
            "categories": [
                cat(
                    "Hogar",
                    "hogar",
                    "Arreglos y manos en casa: caños, puertas, refacciones chicas",
                    ["hogar", "arreglo", "plomería", "mano"],
                    photo("cat-hogar.jpg"),
                ),
                cat(
                    "Electricidad",
                    "electricidad",
                    "Enchufes, luces, tablero y aires a cargo de una persona",
                    ["electricidad", "enchufe", "aire", "luz"],
                    photo("cat-electricidad.jpg"),
                ),
                cat(
                    "Pintura",
                    "pintura",
                    "Pintura de ambientes o frentes, sin cuadrillas",
                    ["pintura", "pintor", "látex"],
                    photo("cat-pintura.jpg"),
                ),
                cat(
                    "Exterior",
                    "exterior",
                    "Jardín, poda y mantenimiento afuera de casa",
                    ["jardín", "exterior", "poda", "césped"],
                    photo("cat-exterior.jpg"),
                ),
            ],
            "placeholders": {
                "product": photo("svc-arreglos.jpg"),
                "category": photo("cat-hogar.jpg"),
                "user": photo("hero-person.jpg"),
            },
            "backgrounds": {
                "hero": photo("hero-home.jpg"),
                "features": "",
                "testimonials": "",
            },
            "banners": {
                "main": photo("hero-home.jpg"),
                "secondary": "",
                "seasonal": "",
                "sale": "",
            },
            "productFallbacks": {"default": photo("svc-arreglos.jpg")},
        },
        "header": {
            "showSearch": True,
            "showCategoriesMenu": True,
            "showFavorites": True,
            "showOrders": True,
            "showAccount": True,
            "showCart": True,
            "topBarMessage": (
                "Personas con oficio · Validamos idoneidad · Capacitamos con la intermediación"
            ),
            "topBarHref": "/como-funciona",
            "menu": [
                {"label": "Servicios", "href": "/productos"},
                {"label": "Cómo funciona", "href": "/como-funciona"},
                {"label": "Contacto", "href": "/contacto"},
            ],
        },
        "footer": {
            "sections": [
                {
                    "title": "Oficios",
                    "links": [
                        {"label": "Hogar", "href": "/categoria/hogar"},
                        {"label": "Electricidad", "href": "/categoria/electricidad"},
                        {"label": "Pintura", "href": "/categoria/pintura"},
                        {"label": "Exterior", "href": "/categoria/exterior"},
                    ],
                },
                {
                    "title": "El sistema",
                    "links": [
                        {"label": "Cómo funciona", "href": "/como-funciona"},
                        {"label": "Sobre OficiosHub", "href": "/sobrenosotros"},
                        {"label": "Ofrecer mi oficio", "href": "/registro-proveedor"},
                        {"label": "Contacto", "href": "/contacto"},
                    ],
                },
                {
                    "title": "Ayuda",
                    "links": [
                        {"label": "Seguimiento", "href": "/seguimiento"},
                        {"label": "Cambios / cancelaciones", "href": "/devoluciones"},
                        {"label": "Calidad y reseñas", "href": "/garantias"},
                        {"label": "Términos", "href": "/terminos"},
                    ],
                },
            ],
            "showWhatsappCapture": True,
            "whatsappOptInMessage": "Hola! Quiero contratar a alguien en OficiosHub.",
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
            "searchPlaceholder": "Buscar persona u oficio...",
            "noProductsTitle": "No encontramos a nadie con ese oficio",
            "noProductsMessage": "Probá Hogar, Electricidad, Pintura o Exterior",
            "loginTitle": "Ingresar a OficiosHub",
            "loginSubtitle": "Accedé para contratar a una persona y seguir tus pedidos",
            "cartEmptyTitle": "Todavía no elegiste a nadie",
            "cartEmptyMessage": "Sumá el servicio de una persona para contratarla",
            "checkoutFinalizeLabel": "Confirmar contratación",
            "addToCartLabel": "Contratar a esta persona",
            "homeHeroCta": "Ver personas",
            "homeFeaturedTitle": "Personas destacadas",
            "homeFeaturedSubtitle": "Vecinos con oficio que más se contratan",
            "homeCategoriesTitle": "Oficios",
            "homeCategoriesSubtitle": "Solo cuatro: elegí y mirá quién ofrece",
            "homeNewTitle": "Recién sumados",
            "homeNewSubtitle": "Personas que acaban de publicar su oficio",
            "stockSemaforo": {
                "enabled": False,
            },
        },
    }


# Un servicio ≈ una persona particular (no empresa de rubro).
# Categorías canónicas: Hogar | Electricidad | Pintura | Exterior
PRODUCTS = [
    {
        "sku": "OH-HOG-MARTIN-01",
        "name": "Martín Acosta · Destape y caños",
        "description": (
            "Soy Martín, oficial plomero. Destapes y caños en casa: el valor final "
            "depende del diagnóstico (a convenir). Coordinamos solo por OficiosHub."
        ),
        "unit_price": 0,
        "pricing_mode": "a_convenir",
        "trade_rank": "oficial",
        "demand_level": "high",
        "stock_quantity": 1,
        "stock_unit": "servicio",
        "family": "Hogar",
        "category": "Hogar",
        "subcategory": "",
        "image": "person-martin.jpg",
        "provider_name": "Martín Acosta",
        "provider_headline": "Oficial plomero · destapes y caños",
        "provider_zone": "Palermo",
    },
    {
        "sku": "OH-HOG-DIEGO-01",
        "name": "Diego Rivas · Manos en casa",
        "description": (
            "Soy Diego, medio oficial. Arreglos varios (puertas, grifería, refacciones chicas). "
            "Presupuesto según el trabajo; pedilo por OficiosHub."
        ),
        "unit_price": 0,
        "pricing_mode": "a_convenir",
        "trade_rank": "medio_oficial",
        "demand_level": "medium",
        "stock_quantity": 1,
        "stock_unit": "servicio",
        "family": "Hogar",
        "category": "Hogar",
        "subcategory": "",
        "image": "person-diego.jpg",
        "provider_name": "Diego Rivas",
        "provider_headline": "Medio oficial · arreglos en el hogar",
        "provider_zone": "Ramos Mejía",
    },
    {
        "sku": "OH-ELE-LUCIA-01",
        "name": "Lucía Fernández · Cambio de toma",
        "description": (
            "Soy Lucía, oficial electricista. Cambio o instalación de una toma de luz "
            "domiciliaria a precio fijo. Trabajo sola en casas y departamentos."
        ),
        "unit_price": 28000,
        "pricing_mode": "fixed",
        "trade_rank": "oficial",
        "demand_level": "medium",
        "stock_quantity": 1,
        "stock_unit": "servicio",
        "family": "Electricidad",
        "category": "Electricidad",
        "subcategory": "",
        "image": "person-lucia.jpg",
        "provider_name": "Lucía Fernández",
        "provider_headline": "Oficial · electricidad domiciliaria",
        "provider_zone": "Caballito",
    },
    {
        "sku": "OH-ELE-NICO-01",
        "name": "Nicolás Vega · Service de aire",
        "description": (
            "Soy Nico, medio oficial. Service y limpieza de split o ventana a precio fijo. "
            "Si hace falta gas u otro material, te aviso por OficiosHub antes."
        ),
        "unit_price": 48000,
        "pricing_mode": "fixed",
        "trade_rank": "medio_oficial",
        "demand_level": "high",
        "stock_quantity": 1,
        "stock_unit": "servicio",
        "family": "Electricidad",
        "category": "Electricidad",
        "subcategory": "",
        "image": "person-nico.jpg",
        "provider_name": "Nicolás Vega",
        "provider_headline": "Medio oficial · aires y climatización",
        "provider_zone": "Quilmes",
    },
    {
        "sku": "OH-PIN-ANA-01",
        "name": "Ana Beltrán · Pintura de un ambiente",
        "description": (
            "Soy Ana, oficial pintora. Un ambiente (~12 m²) con preparación liviana y dos manos, "
            "precio fijo. La pintura la vemos por OficiosHub."
        ),
        "unit_price": 110000,
        "pricing_mode": "fixed",
        "trade_rank": "oficial",
        "demand_level": "low",
        "stock_quantity": 1,
        "stock_unit": "servicio",
        "family": "Pintura",
        "category": "Pintura",
        "subcategory": "",
        "image": "person-ana.jpg",
        "provider_name": "Ana Beltrán",
        "provider_headline": "Oficial · pintura de interiores",
        "provider_zone": "Flores",
    },
    {
        "sku": "OH-EXT-CAMILA-01",
        "name": "Camila Soto · Jardín y poda",
        "description": (
            "Soy Camila, particular con experiencia en jardín. Poda y césped: "
            "el valor se acuerda según tamaño y estado (a convenir)."
        ),
        "unit_price": 0,
        "pricing_mode": "a_convenir",
        "trade_rank": "particular",
        "demand_level": "low",
        "stock_quantity": 1,
        "stock_unit": "servicio",
        "family": "Exterior",
        "category": "Exterior",
        "subcategory": "",
        "image": "person-camila.jpg",
        "provider_name": "Camila Soto",
        "provider_headline": "Particular · jardín y exterior",
        "provider_zone": "San Isidro",
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


def list_products(token: str) -> list[dict]:
    items: list[dict] = []
    page = 1
    while page <= 20:
        status, payload = api(
            "GET",
            f"/api/accounts/{ACCOUNT_ID}/products?page={page}&page_size=100",
            token=token,
        )
        if status >= 400:
            raise SystemExit(f"List products HTTP {status}: {payload}")
        batch = payload.get("data") or []
        if not isinstance(batch, list):
            break
        items.extend(batch)
        pag = payload.get("pagination") or {}
        total_pages = int(pag.get("total_pages") or pag.get("pages") or 1)
        if page >= total_pages or not batch:
            break
        page += 1
    return items


def product_body(raw: dict) -> dict:
    item = dict(raw)
    provider_name = item.pop("provider_name")
    provider_headline = item.pop("provider_headline")
    provider_zone = item.pop("provider_zone", "")
    trade_rank = item.pop("trade_rank", "particular")
    pricing_mode = item.pop("pricing_mode", "fixed")
    demand_level = item.pop("demand_level", "medium")
    image_name = item.pop("image", "person-martin.jpg")
    image_url = photo(image_name)
    description = item["description"]
    return {
        "sku": item["sku"],
        "name": item["name"],
        "description": description,
        "unit_price": item["unit_price"],
        "stock_quantity": item.get("stock_quantity", 1),
        "stock_unit": item["stock_unit"],
        "family": item["family"],
        "category": item["category"],
        "subcategory": item.get("subcategory") or None,
        "currency": "ARS",
        "tax_rate": 0.21,
        "status": "active",
        "product_type": "service",
        "track_inventory": False,
        "allow_backorders": True,
        "stock_min": 0,
        "image_url": image_url,
        "thumbnail_url": image_url,
        "metadata": {
            "kind": "service",
            "marketplace": "oficioshub",
            "pricing_mode": pricing_mode,
            "demand_level": demand_level,
            "provider": {
                "name": provider_name,
                "headline": provider_headline,
                "zone": provider_zone,
                "type": "person",
                "trade_rank": trade_rank,
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
                "trade_rank": trade_rank,
                "pricing_mode": pricing_mode,
                "demand_level": demand_level,
                "provider_headline": provider_headline,
                "provider_zone": provider_zone,
            },
        },
    }


def sync_products(token: str) -> None:
    existing = list_products(token)
    by_sku = {str(p.get("sku") or ""): p for p in existing}
    keep_skus = {p["sku"] for p in PRODUCTS}
    created = 0
    updated = 0

    for raw in PRODUCTS:
        body = product_body(raw)
        sku = body["sku"]
        current = by_sku.get(sku)
        if current and current.get("id"):
            pid = current["id"]
            patch = {k: v for k, v in body.items() if k != "sku"}
            status, payload = api(
                "PATCH",
                f"/api/accounts/{ACCOUNT_ID}/products/{pid}",
                token=token,
                body=patch,
            )
            if status in (200, 201):
                updated += 1
                print(f"  ~ {sku}")
            else:
                print(
                    f"  ! PATCH FAIL {sku} HTTP {status}: "
                    f"{json.dumps(payload, ensure_ascii=False)[:400]}"
                )
            continue

        status, payload = api(
            "POST",
            f"/api/accounts/{ACCOUNT_ID}/products",
            token=token,
            body=body,
        )
        if status in (200, 201):
            created += 1
            print(f"  + {sku}")
            continue
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
                print(f"  + {sku} (physical fallback)")
                continue
            print(
                f"  ! FAIL {sku} HTTP {status2}: "
                f"{json.dumps(payload2, ensure_ascii=False)[:400]}"
            )
        else:
            print(
                f"  ! FAIL {sku} HTTP {status}: "
                f"{json.dumps(payload, ensure_ascii=False)[:400]}"
            )

    archived = 0
    for p in existing:
        sku = str(p.get("sku") or "")
        meta = p.get("metadata") or {}
        is_oh = meta.get("marketplace") == "oficioshub" or sku.startswith("OH-")
        if not is_oh or sku in keep_skus:
            continue
        if str(p.get("status") or "").lower() == "inactive":
            continue
        pid = p.get("id")
        if not pid:
            continue
        status, payload = api(
            "PATCH",
            f"/api/accounts/{ACCOUNT_ID}/products/{pid}",
            token=token,
            body={"status": "inactive"},
        )
        if status in (200, 201):
            archived += 1
            print(f"  - archive {sku}")
        else:
            print(f"  ! archive FAIL {sku} HTTP {status}")

    print(
        f"OK productos created={created} updated={updated} "
        f"archived={archived} catalog={len(PRODUCTS)}"
    )


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
    sync_products(token)
    verify()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
