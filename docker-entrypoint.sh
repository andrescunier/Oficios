#!/bin/sh
set -e

# =============================================================================
# Docker Entrypoint para Ecommerce App
# Genera config.js runtime desde variables de entorno
# =============================================================================

CONFIG_TEMPLATE="/app/config.js.template"
CONFIG_OUTPUT="/usr/share/nginx/html/config.js"

echo "🚀 Ecommerce App - Starting container..."

# =============================================================================
# Función para obtener valor con default
# =============================================================================
get_value() {
  local var_name="$1"
  local default_value="$2"
  eval "local value=\${$var_name:-$default_value}"
  echo "$value"
}

# =============================================================================
# Generar config.js desde template o directamente
# =============================================================================
generate_config() {
  echo "📝 Generating runtime configuration..."
  
  # Valores con defaults
  API_URL=$(get_value "API_URL" "https://api.cumar.com.ar")
  ACCOUNT_ID=$(get_value "ACCOUNT_ID" "bed2df35-717f-4900-a4b1-7c3a7fb59b7c")
  ACCOUNT_SLUG=$(get_value "ACCOUNT_SLUG" "diap")
  
  APP_NAME=$(get_value "APP_NAME" "Mi Tienda")
  COMPANY_NAME=$(get_value "COMPANY_NAME" "Mi Empresa")
  APP_SLOGAN=$(get_value "APP_SLOGAN" "Tu tienda online")
  APP_DESCRIPTION=$(get_value "APP_DESCRIPTION" "Tienda online de productos")
  APP_URL=$(get_value "APP_URL" "")
  HIDE_PRICES_FOR_GUESTS=$(get_value "HIDE_PRICES_FOR_GUESTS" "true")
  REQUIRE_AUTH_FOR_CART=$(get_value "REQUIRE_AUTH_FOR_CART" "true")
  LOGIN_TO_VIEW_PRICES_MESSAGE=$(get_value "LOGIN_TO_VIEW_PRICES_MESSAGE" "Inicia sesión para ver precios")
  LOGIN_FOR_PRICES_CTA=$(get_value "LOGIN_FOR_PRICES_CTA" "Iniciar Sesión")
  
  CONTACT_EMAIL=$(get_value "CONTACT_EMAIL" "info@tienda.com")
  CONTACT_PHONE=$(get_value "CONTACT_PHONE" "")
  CONTACT_ADDRESS=$(get_value "CONTACT_ADDRESS" "")
  CONTACT_SALES_EMAIL=$(get_value "CONTACT_SALES_EMAIL" "ventas@tienda.com")
  CONTACT_WHATSAPP=$(get_value "CONTACT_WHATSAPP" "")
  
  LEGAL_COMPANY_NAME=$(get_value "LEGAL_COMPANY_NAME" "")
  LEGAL_CUIT=$(get_value "LEGAL_CUIT" "")
  LEGAL_ADDRESS=$(get_value "LEGAL_ADDRESS" "")
  LEGAL_JURISDICTION=$(get_value "LEGAL_JURISDICTION" "")
  
  DEFAULT_TAX_RATE=$(get_value "DEFAULT_TAX_RATE" "0.21")
  MAX_QUANTITY_PER_PRODUCT=$(get_value "MAX_QUANTITY_PER_PRODUCT" "5")
  DEFAULT_CURRENCY=$(get_value "DEFAULT_CURRENCY" "ARS")
  DEFAULT_COUNTRY=$(get_value "DEFAULT_COUNTRY" "Argentina")
  BUSINESS_HOURS=$(get_value "BUSINESS_HOURS" "Lunes a Viernes: 9:00 - 18:00hs")
  RETURN_POLICY_DAYS=$(get_value "RETURN_POLICY_DAYS" "10 días corridos")
  REFUND_PROCESSING_TIME=$(get_value "REFUND_PROCESSING_TIME" "5 a 10 días hábiles")
  PRODUCTS_PER_PAGE=$(get_value "PRODUCTS_PER_PAGE" "50")
  FEATURED_PRODUCTS_COUNT=$(get_value "FEATURED_PRODUCTS_COUNT" "8")
  HERO_SLIDER_INTERVAL=$(get_value "HERO_SLIDER_INTERVAL" "5000")
  INVOICE_NOTE=$(get_value "INVOICE_NOTE" "Se emite factura tipo A o B según la condición fiscal del comprador.")
  FREE_SHIPPING_THRESHOLD=$(get_value "FREE_SHIPPING_THRESHOLD" "50000")
  LOCALE=$(get_value "LOCALE" "es-AR")

  LOGO_URL=$(get_value "LOGO_URL" "/logo.png")
  LOGO_DARK_URL=$(get_value "LOGO_DARK_URL" "")
  FAVICON_URL=$(get_value "FAVICON_URL" "/favicon.ico")
  BANNER_URL=$(get_value "BANNER_URL" "")
  OG_IMAGE_URL=$(get_value "OG_IMAGE_URL" "/logo.png")
  
  COLOR_PRIMARY=$(get_value "COLOR_PRIMARY" "#2563eb")
  COLOR_PRIMARY_HOVER=$(get_value "COLOR_PRIMARY_HOVER" "#1d4ed8")
  COLOR_PRIMARY_FOREGROUND=$(get_value "COLOR_PRIMARY_FOREGROUND" "#ffffff")
  COLOR_SECONDARY=$(get_value "COLOR_SECONDARY" "#f1f5f9")
  COLOR_SECONDARY_FOREGROUND=$(get_value "COLOR_SECONDARY_FOREGROUND" "#0f172a")
  COLOR_BACKGROUND=$(get_value "COLOR_BACKGROUND" "#ffffff")
  COLOR_FOREGROUND=$(get_value "COLOR_FOREGROUND" "#0f172a")
  COLOR_SURFACE=$(get_value "COLOR_SURFACE" "#ffffff")
  COLOR_SURFACE_FOREGROUND=$(get_value "COLOR_SURFACE_FOREGROUND" "#0f172a")
  COLOR_MUTED=$(get_value "COLOR_MUTED" "#f1f5f9")
  COLOR_MUTED_FOREGROUND=$(get_value "COLOR_MUTED_FOREGROUND" "#64748b")
  COLOR_BORDER=$(get_value "COLOR_BORDER" "#e2e8f0")
  COLOR_INPUT=$(get_value "COLOR_INPUT" "#e2e8f0")
  COLOR_RING=$(get_value "COLOR_RING" "#2563eb")
  COLOR_SUCCESS=$(get_value "COLOR_SUCCESS" "#22c55e")
  COLOR_WARNING=$(get_value "COLOR_WARNING" "#f59e0b")
  COLOR_ERROR=$(get_value "COLOR_ERROR" "#ef4444")
  COLOR_ACCENT=$(get_value "COLOR_ACCENT" "#f1f5f9")
  COLOR_ACCENT_FOREGROUND=$(get_value "COLOR_ACCENT_FOREGROUND" "#0f172a")
  FONT_FAMILY=$(get_value "FONT_FAMILY" "")
  FONT_URL=$(get_value "FONT_URL" "")
  
  FACEBOOK_URL=$(get_value "FACEBOOK_URL" "")
  INSTAGRAM_URL=$(get_value "INSTAGRAM_URL" "")
  TWITTER_URL=$(get_value "TWITTER_URL" "")
  LINKEDIN_URL=$(get_value "LINKEDIN_URL" "")
  
  FEATURE_NOTIFICATIONS=$(get_value "FEATURE_NOTIFICATIONS" "false")
  FEATURE_ANALYTICS=$(get_value "FEATURE_ANALYTICS" "false")
  FEATURE_REAL_PAYMENTS=$(get_value "FEATURE_REAL_PAYMENTS" "false")

  FILTERS_ENABLED=$(get_value "FILTERS_ENABLED" "false")
  FILTER_CAPACIDAD=$(get_value "FILTER_CAPACIDAD" "false")
  FILTER_VELOCIDAD=$(get_value "FILTER_VELOCIDAD" "false")

  PAYMENT_TRANSFERENCIA=$(get_value "PAYMENT_TRANSFERENCIA" "true")
  PAYMENT_EFECTIVO=$(get_value "PAYMENT_EFECTIVO" "true")
  PAYMENT_MERCADOPAGO=$(get_value "PAYMENT_MERCADOPAGO" "false")
  PAYMENT_TARJETA=$(get_value "PAYMENT_TARJETA" "false")

  PAYMENT_BANK_NAME=$(get_value "PAYMENT_BANK_NAME" "")
  PAYMENT_ACCOUNT_HOLDER=$(get_value "PAYMENT_ACCOUNT_HOLDER" "")
  PAYMENT_CBU=$(get_value "PAYMENT_CBU" "")
  PAYMENT_ALIAS=$(get_value "PAYMENT_ALIAS" "")
  PAYMENT_WA_VERIFICATION=$(get_value "PAYMENT_WA_VERIFICATION" "")

  # Images - JSON strings (se pasan como env vars con JSON completo)
  # Si se proveen, se incluyen directamente; si no, se usan los defaults del frontend
  IMAGES_CONFIG=$(get_value "IMAGES_CONFIG" "")

  # Generar config.js
  cat > "$CONFIG_OUTPUT" << EOF
/**
 * Runtime Configuration - Generated at container startup
 * Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
 */
window.__APP_CONFIG__ = {
  api: {
    url: "${API_URL}",
    accountId: "${ACCOUNT_ID}",
    accountSlug: "${ACCOUNT_SLUG}"
  },
  app: {
    name: "${APP_NAME}",
    companyName: "${COMPANY_NAME}",
    slogan: "${APP_SLOGAN}",
    description: "${APP_DESCRIPTION}",
    url: "${APP_URL}",
    hidePricesForGuests: ${HIDE_PRICES_FOR_GUESTS},
    requireAuthForCart: ${REQUIRE_AUTH_FOR_CART},
    loginMessage: "${LOGIN_TO_VIEW_PRICES_MESSAGE}",
    loginCta: "${LOGIN_FOR_PRICES_CTA}"
  },
  contact: {
    email: "${CONTACT_EMAIL}",
    salesEmail: "${CONTACT_SALES_EMAIL}",
    phone: "${CONTACT_PHONE}",
    whatsapp: "${CONTACT_WHATSAPP}",
    address: "${CONTACT_ADDRESS}"
  },
  legal: {
    companyName: "${LEGAL_COMPANY_NAME}",
    cuit: "${LEGAL_CUIT}",
    address: "${LEGAL_ADDRESS}",
    jurisdiction: "${LEGAL_JURISDICTION}"
  },
  business: {
    defaultTaxRate: ${DEFAULT_TAX_RATE},
    maxQuantityPerProduct: ${MAX_QUANTITY_PER_PRODUCT},
    defaultCurrency: "${DEFAULT_CURRENCY}",
    defaultCountry: "${DEFAULT_COUNTRY}",
    businessHours: "${BUSINESS_HOURS}",
    returnPolicyDays: "${RETURN_POLICY_DAYS}",
    refundProcessingTime: "${REFUND_PROCESSING_TIME}",
    productsPerPage: ${PRODUCTS_PER_PAGE},
    featuredProductsCount: ${FEATURED_PRODUCTS_COUNT},
    heroSliderInterval: ${HERO_SLIDER_INTERVAL},
    invoiceNote: "${INVOICE_NOTE}",
    freeShippingThreshold: ${FREE_SHIPPING_THRESHOLD},
    locale: "${LOCALE}"
  },
  branding: {
    logo: "${LOGO_URL}",
    logoDark: "${LOGO_DARK_URL}",
    favicon: "${FAVICON_URL}",
    banner: "${BANNER_URL}",
    ogImage: "${OG_IMAGE_URL}"
  },
  theme: {
    colorPrimary: "${COLOR_PRIMARY}",
    colorPrimaryHover: "${COLOR_PRIMARY_HOVER}",
    colorPrimaryForeground: "${COLOR_PRIMARY_FOREGROUND}",
    colorSecondary: "${COLOR_SECONDARY}",
    colorSecondaryForeground: "${COLOR_SECONDARY_FOREGROUND}",
    colorBackground: "${COLOR_BACKGROUND}",
    colorForeground: "${COLOR_FOREGROUND}",
    colorSurface: "${COLOR_SURFACE}",
    colorSurfaceForeground: "${COLOR_SURFACE_FOREGROUND}",
    colorMuted: "${COLOR_MUTED}",
    colorMutedForeground: "${COLOR_MUTED_FOREGROUND}",
    colorBorder: "${COLOR_BORDER}",
    colorInput: "${COLOR_INPUT}",
    colorRing: "${COLOR_RING}",
    colorSuccess: "${COLOR_SUCCESS}",
    colorWarning: "${COLOR_WARNING}",
    colorError: "${COLOR_ERROR}",
    colorAccent: "${COLOR_ACCENT}",
    colorAccentForeground: "${COLOR_ACCENT_FOREGROUND}",
    fontFamily: "${FONT_FAMILY}",
    fontUrl: "${FONT_URL}"
  },
  social: {
    facebook: "${FACEBOOK_URL}",
    instagram: "${INSTAGRAM_URL}",
    twitter: "${TWITTER_URL}",
    linkedin: "${LINKEDIN_URL}"
  },
  features: {
    notifications: ${FEATURE_NOTIFICATIONS},
    analytics: ${FEATURE_ANALYTICS},
    realPayments: ${FEATURE_REAL_PAYMENTS}
  },
  filters: {
    enabled: ${FILTERS_ENABLED},
    capacidad: ${FILTER_CAPACIDAD},
    velocidad: ${FILTER_VELOCIDAD}
  },$(if [ -n "${IMAGES_CONFIG}" ]; then echo "
  images: ${IMAGES_CONFIG},"; fi)
  paymentMethods: {
    transferencia: ${PAYMENT_TRANSFERENCIA},
    efectivo: ${PAYMENT_EFECTIVO},
    mercadopago: ${PAYMENT_MERCADOPAGO},
    tarjeta: ${PAYMENT_TARJETA}
  },
  payment: {
    bankName: "${PAYMENT_BANK_NAME}",
    accountHolder: "${PAYMENT_ACCOUNT_HOLDER}",
    cbu: "${PAYMENT_CBU}",
    alias: "${PAYMENT_ALIAS}",
    whatsappVerification: "${PAYMENT_WA_VERIFICATION}"
  }
};
EOF

  echo "✅ Configuration generated successfully"
  echo "   API URL: ${API_URL}"
  echo "   Account ID: ${ACCOUNT_ID}"
  echo "   App Name: ${APP_NAME}"
  echo "   Primary Color: ${COLOR_PRIMARY}"
}

# =============================================================================
# Main
# =============================================================================

# Generar configuración runtime
generate_config

# Mostrar configuración generada (solo en modo debug)
if [ "${DEBUG:-false}" = "true" ]; then
  echo "📄 Generated config.js:"
  cat "$CONFIG_OUTPUT"
fi

echo "🎉 Starting nginx..."

# Ejecutar nginx
exec nginx -g "daemon off;"
