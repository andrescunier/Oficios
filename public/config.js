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
    velocidad: false,
    capacidadOptions: [],
    velocidadOptions: []
  },
  images: {
    heroSlides: [
      {
        image: "/images/heroes/slide-1.jpg",
        title: "Tecnología Profesional para Empresas",
        subtitle: "Soluciones B2B en componentes de alta gama",
        cta: "Ver Catálogo",
        link: "/productos"
      },
      {
        image: "/images/heroes/slide-2.jpg",
        title: "SSDs de Alto Rendimiento",
        subtitle: "Almacenamiento profesional para tu negocio",
        cta: "Explorar SSDs",
        link: "/productos"
      },
      {
        image: "/images/heroes/slide-3.jpg",
        title: "Memorias RAM DDR4 & DDR5",
        subtitle: "Maximiza el rendimiento de tus equipos",
        cta: "Ver Memorias",
        link: "/productos"
      }
    ],
    categories: [
      {
        name: \"SSD SATA\",
        slug: \"ssd-sata\",
        image: \"/images/categories/ssd-sata.jpg\",
        link: \"/categoria/ssd-sata\",
        description: \"SATA III para máximo rendimiento\",
        searchTerms: [\"ssd\"]
      },
      {
        name: \"Memoria RAM\",
        slug: \"memoria-ram\",
        image: \"/images/categories/ddr4.jpg\",
        link: \"/categoria/memoria-ram\",
        description: \"Módulos de memoria de alta velocidad\",
        searchTerms: [\"ram\", \"ddr\", \"sodimm\", \"udimm\", \"memoria\", \"memory\"]
      }
    ],
    placeholders: {
      product: "/images/placeholders/product-placeholder.jpg",
      category: "/images/placeholders/category-placeholder.jpg",
      user: "/images/placeholders/user-placeholder.jpg"
    },
    backgrounds: {
      hero: "/images/backgrounds/hero-bg.jpg",
      features: "/images/backgrounds/features-bg.jpg",
      testimonials: "/images/backgrounds/testimonials-bg.jpg"
    },
    banners: {
      main: "/images/banners/main-banner.jpg",
      secondary: "/images/banners/secondary-banner.jpg",
      seasonal: "/images/banners/seasonal-banner.jpg",
      sale: "/images/banners/sale-banner.jpg"
    },
    productFallbacks: {
      "ssd-m2": "/images/categories/ssd-m2.jpg",
      "ssd-nvme": "/images/categories/ssd-m2.jpg",
      "ssd-sata": "/images/categories/ssd-sata.jpg",
      "ssd": "/images/categories/ssd-m2.jpg",
      "ddr5": "/images/categories/ddr5.jpg",
      "ddr4": "/images/categories/ddr4.jpg",
      "memoria": "/images/categories/ddr4.jpg",
      "ram": "/images/categories/ddr4.jpg",
      "gaming": "/images/categories/gaming.jpg",
      "componentes": "/images/categories/componentes.jpg",
      "default": "/images/categories/componentes.jpg"
    }
  },
  paymentMethods: {
    transferencia: true,
    efectivo: true,
    mercadopago: false,
    tarjeta: false
  }
};
