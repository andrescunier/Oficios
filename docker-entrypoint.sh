#!/bin/sh
set -e

# =============================================================================
# Docker Entrypoint para DIAP Ecommerce
# Genera config.js runtime desde variables de entorno
# =============================================================================

CONFIG_TEMPLATE="/app/config.js.template"
CONFIG_OUTPUT="/usr/share/nginx/html/config.js"

echo "🚀 DIAP Ecommerce - Starting container..."

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
  
  APP_NAME=$(get_value "APP_NAME" "DIAP")
  COMPANY_NAME=$(get_value "COMPANY_NAME" "DIAP")
  APP_SLOGAN=$(get_value "APP_SLOGAN" "Tecnología profesional para empresas")
  APP_DESCRIPTION=$(get_value "APP_DESCRIPTION" "DIAP - Distribuidora de productos tecnológicos de primera calidad")
  APP_URL=$(get_value "APP_URL" "https://diap.com")
  HIDE_PRICES_FOR_GUESTS=$(get_value "HIDE_PRICES_FOR_GUESTS" "true")
  REQUIRE_AUTH_FOR_CART=$(get_value "REQUIRE_AUTH_FOR_CART" "true")
  LOGIN_TO_VIEW_PRICES_MESSAGE=$(get_value "LOGIN_TO_VIEW_PRICES_MESSAGE" "Inicia sesión para ver precios")
  LOGIN_FOR_PRICES_CTA=$(get_value "LOGIN_FOR_PRICES_CTA" "Iniciar Sesión")
  
  CONTACT_EMAIL=$(get_value "CONTACT_EMAIL" "info@diapstore.com")
  CONTACT_PHONE=$(get_value "CONTACT_PHONE" "+54 11 2631-0884")
  CONTACT_ADDRESS=$(get_value "CONTACT_ADDRESS" "Palomar, Provincia de Buenos Aires")
  
  LOGO_URL=$(get_value "LOGO_URL" "/diap-logo.png")
  LOGO_DARK_URL=$(get_value "LOGO_DARK_URL" "")
  FAVICON_URL=$(get_value "FAVICON_URL" "/favicon.ico")
  BANNER_URL=$(get_value "BANNER_URL" "")
  OG_IMAGE_URL=$(get_value "OG_IMAGE_URL" "/diap-logo.png")
  
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
    phone: "${CONTACT_PHONE}",
    address: "${CONTACT_ADDRESS}"
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
