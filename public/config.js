/**
 * Configuración runtime por defecto para desarrollo local
 * Este archivo será reemplazado en producción por docker-entrypoint.sh
 */
window.__APP_CONFIG__ = {
  api: {
    url: "https://api.cumar.com.ar",
    accountId: "bed2df35-717f-4900-a4b1-7c3a7fb59b7c",
    accountSlug: "diap"
  },
  app: {
    name: "DIAP",
    companyName: "DIAP",
    slogan: "Tecnología profesional para empresas",
    description: "DIAP - Distribuidora de productos tecnológicos de primera calidad. Soluciones profesionales para tu empresa.",
    url: "https://diap.com",
    hidePricesForGuests: true,
    requireAuthForCart: true,
    loginMessage: "Inicia sesión para ver precios",
    loginCta: "Iniciar Sesión"
  },
  contact: {
    email: "info@diapstore.com",
    phone: "+54 11 2631-0884",
    address: "Palomar, Provincia de Buenos Aires"
  },
  branding: {
    logo: "/diap-logo.png",
    logoDark: "",
    favicon: "/favicon.ico",
    banner: "",
    ogImage: "/diap-logo.png"
  },
  theme: {
    colorPrimary: "#2563eb",
    colorPrimaryHover: "#1d4ed8",
    colorPrimaryForeground: "#ffffff",
    colorSecondary: "#f1f5f9",
    colorSecondaryForeground: "#0f172a",
    colorBackground: "#ffffff",
    colorForeground: "#0f172a",
    colorSurface: "#ffffff",
    colorSurfaceForeground: "#0f172a",
    colorMuted: "#f1f5f9",
    colorMutedForeground: "#64748b",
    colorBorder: "#e2e8f0",
    colorInput: "#e2e8f0",
    colorRing: "#2563eb",
    colorSuccess: "#22c55e",
    colorWarning: "#f59e0b",
    colorError: "#ef4444",
    colorAccent: "#f1f5f9",
    colorAccentForeground: "#0f172a",
    fontFamily: "",
    fontUrl: ""
  },
  social: {
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: ""
  },
  features: {
    notifications: false,
    analytics: false,
    realPayments: false
  },
  filters: {
    enabled: false,
    capacidad: false,
    velocidad: false
  },
  paymentMethods: {
    transferencia: true,
    efectivo: true,
    mercadopago: false,
    tarjeta: false
  }
};
