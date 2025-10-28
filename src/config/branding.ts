/**
 * Configuración central de la aplicación basada en variables de entorno
 */

// =========================================
// API CONFIGURATION
// =========================================
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.cumar.com.ar',
  ACCOUNT_ID: import.meta.env.VITE_ACCOUNT_ID || '37b694f4-f2c9-4500-8e47-52b8ad8daaea',
  TIMEOUT: 30000,
  EXTRA_HEADERS: (() => {
    try {
      return JSON.parse(import.meta.env.VITE_API_EXTRA_HEADERS || '{}');
    } catch {
      return {};
    }
  })(),
} as const;

// =========================================
// BRANDING & COMPANY INFO
// =========================================
export const BRANDING = {
  // App Information
  APP_NAME: import.meta.env.VITE_APP_NAME || 'DIAP',
  COMPANY_NAME: import.meta.env.VITE_COMPANY_NAME || 'DIAP',
  APP_SLOGAN: import.meta.env.VITE_APP_SLOGAN || 'Tecnología profesional para empresas',
  APP_URL: import.meta.env.VITE_APP_URL || 'https://diap.com',
  APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'DIAP - Distribuidora de productos tecnológicos de primera calidad. Soluciones profesionales para tu empresa.',
  
  // Contact Information
  CONTACT_EMAIL: import.meta.env.VITE_CONTACT_EMAIL || 'info@diap.com',
  CONTACT_PHONE: import.meta.env.VITE_CONTACT_PHONE || '+54 11 1234-5678',
  CONTACT_ADDRESS: import.meta.env.VITE_CONTACT_ADDRESS || 'Av. Corrientes 1234, CABA, Argentina',
} as const;

// =========================================
// ASSETS & IMAGES
// =========================================
export const ASSETS = {
  // Logos
  LOGO_PATH: import.meta.env.VITE_CDN_LOGO || import.meta.env.VITE_LOGO_PATH || '/diap-logo.png',
  FAVICON_PATH: import.meta.env.VITE_FAVICON_PATH || '/favicon.ico',
  HEADER_LOGO_PATH: import.meta.env.VITE_CDN_LOGO || import.meta.env.VITE_HEADER_LOGO_PATH || '/diap-logo.png',
  FOOTER_LOGO_PATH: import.meta.env.VITE_CDN_LOGO || import.meta.env.VITE_FOOTER_LOGO_PATH || '/diap-logo.png',
  
  // Hero Slider Images
  HERO_SLIDES: [
    {
      image: import.meta.env.VITE_CDN_HERO_SLIDE_1 || import.meta.env.VITE_HERO_SLIDE_1 || '/images/heroes/slide-1.jpg',
      title: import.meta.env.VITE_HERO_SLIDE_1_TITLE || 'Tecnología Profesional para Empresas',
      subtitle: import.meta.env.VITE_HERO_SLIDE_1_SUBTITLE || 'Soluciones B2B en componentes de alta gama',
      cta: import.meta.env.VITE_HERO_SLIDE_1_CTA || 'Ver Catálogo',
      link: '/productos'
    },
    {
      image: import.meta.env.VITE_CDN_HERO_SLIDE_2 || import.meta.env.VITE_HERO_SLIDE_2 || '/images/heroes/slide-2.jpg',
      title: import.meta.env.VITE_HERO_SLIDE_2_TITLE || 'SSDs de Alto Rendimiento',
      subtitle: import.meta.env.VITE_HERO_SLIDE_2_SUBTITLE || 'Almacenamiento profesional para tu negocio',
      cta: import.meta.env.VITE_HERO_SLIDE_2_CTA || 'Explorar SSDs',
      link: '/productos'
    },
    {
      image: import.meta.env.VITE_CDN_HERO_SLIDE_3 || import.meta.env.VITE_HERO_SLIDE_3 || '/images/heroes/slide-3.jpg',
      title: import.meta.env.VITE_HERO_SLIDE_3_TITLE || 'Memorias RAM DDR4 & DDR5',
      subtitle: import.meta.env.VITE_HERO_SLIDE_3_SUBTITLE || 'Maximiza el rendimiento de tus equipos',
      cta: import.meta.env.VITE_HERO_SLIDE_3_CTA || 'Ver Memorias',
      link: '/productos'
    }
  ],
  
  // Category Images
  CATEGORIES: {
    COMPONENTES: import.meta.env.VITE_CATEGORY_COMPONENTES_IMG || '/images/categories/componentes.jpg',
    GAMING: import.meta.env.VITE_CATEGORY_GAMING_IMG || '/images/categories/gaming.jpg',
    DDR4: import.meta.env.VITE_CATEGORY_DDR4_IMG || '/images/categories/ddr4.jpg',
    DDR5: import.meta.env.VITE_CATEGORY_DDR5_IMG || '/images/categories/ddr5.jpg',
    SSD_M2: import.meta.env.VITE_CATEGORY_SSD_M2_IMG || '/images/categories/ssd-m2.jpg',
    SSD_SATA: import.meta.env.VITE_CATEGORY_SSD_SATA_IMG || '/images/categories/ssd-sata.jpg'
  },
  
  // Banner & Promotional Images
  BANNERS: {
    MAIN: import.meta.env.VITE_BANNER_MAIN || '/images/banners/main-banner.jpg',
    SECONDARY: import.meta.env.VITE_BANNER_SECONDARY || '/images/banners/secondary-banner.jpg',
    SEASONAL: import.meta.env.VITE_BANNER_SEASONAL || '/images/banners/seasonal-banner.jpg',
    SALE: import.meta.env.VITE_BANNER_SALE || '/images/banners/sale-banner.jpg'
  },
  
  // Background Images
  BACKGROUNDS: {
    HERO: import.meta.env.VITE_BG_HERO || '/images/backgrounds/hero-bg.jpg',
    FEATURES: import.meta.env.VITE_BG_FEATURES || '/images/backgrounds/features-bg.jpg',
    TESTIMONIALS: import.meta.env.VITE_BG_TESTIMONIALS || '/images/backgrounds/testimonials-bg.jpg'
  },
  
  // Placeholder Images
  PLACEHOLDERS: {
    PRODUCT: import.meta.env.VITE_PLACEHOLDER_PRODUCT || '/images/placeholders/product-placeholder.jpg',
    CATEGORY: import.meta.env.VITE_PLACEHOLDER_CATEGORY || '/images/placeholders/category-placeholder.jpg',
    USER: import.meta.env.VITE_PLACEHOLDER_USER || '/images/placeholders/user-placeholder.jpg'
  },
  
  // Función helper para obtener URLs completas
  getAssetUrl: (path: string) => {
    if (path.startsWith('http')) return path;
    return `${BRANDING.APP_URL}${path.startsWith('/') ? path : `/${path}`}`;
  }
} as const;

// =========================================
// SOCIAL MEDIA & LINKS
// =========================================
export const SOCIAL_LINKS = {
  FACEBOOK: import.meta.env.VITE_FACEBOOK_URL || '',
  INSTAGRAM: import.meta.env.VITE_INSTAGRAM_URL || '',
  TWITTER: import.meta.env.VITE_TWITTER_URL || '',
  LINKEDIN: import.meta.env.VITE_LINKEDIN_URL || '',
} as const;

// Función helper para verificar si un link está configurado
export const isSocialLinkConfigured = (platform: keyof typeof SOCIAL_LINKS): boolean => {
  return Boolean(SOCIAL_LINKS[platform]);
};

// =========================================
// APP CONFIGURATION
// =========================================
export const APP_CONFIG = {
  ENV: import.meta.env.VITE_APP_ENV || 'production',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  API_LOGGING: false,
} as const;

// =========================================
// FEATURE FLAGS
// =========================================
export const FEATURES = {
  // Feature flags
  NOTIFICATIONS: import.meta.env.VITE_FEATURE_NOTIFICATIONS === 'true',
  ANALYTICS: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
  REAL_PAYMENTS: import.meta.env.VITE_FEATURE_REAL_PAYMENTS === 'true',
  
  // DIAP B2B Specific Features
  HIDE_PRICES_FOR_GUESTS: import.meta.env.VITE_HIDE_PRICES_FOR_GUESTS === 'true',
  LOGIN_TO_VIEW_PRICES_MESSAGE: import.meta.env.VITE_LOGIN_TO_VIEW_PRICES_MESSAGE || 'Inicia sesión para ver precios',
  LOGIN_FOR_PRICES_CTA: import.meta.env.VITE_LOGIN_FOR_PRICES_CTA || 'Iniciar Sesión',
  REQUIRE_AUTH_FOR_CART: import.meta.env.VITE_REQUIRE_AUTH_FOR_CART === 'true',
  
  // Shipping and benefits features
  SHIPPING_BENEFITS: [
    {
      icon: 'Truck',
      title: import.meta.env.VITE_FEATURE_FREE_SHIPPING_TITLE || 'Envío Gratis',
      description: import.meta.env.VITE_FEATURE_FREE_SHIPPING_DESC || 'En todas tus compras'
    },
    {
      icon: 'Shield',
      title: import.meta.env.VITE_FEATURE_SECURE_PURCHASE_TITLE || 'Compra Segura',
      description: import.meta.env.VITE_FEATURE_SECURE_PURCHASE_DESC || 'Protegemos tus datos'
    },
    {
      icon: 'CreditCard',
      title: import.meta.env.VITE_FEATURE_PAYMENT_METHOD_TITLE || 'Transferencia Bancaria',
      description: import.meta.env.VITE_FEATURE_PAYMENT_METHOD_DESC || 'Método de pago seguro'
    }
  ]
} as const;

// =========================================
// COLORS & THEMING
// =========================================
export const THEME = {
  PRIMARY_COLOR: import.meta.env.VITE_PRIMARY_COLOR || '#2563eb',
  SECONDARY_COLOR: import.meta.env.VITE_SECONDARY_COLOR || '#7c3aed',
  ACCENT_COLOR: import.meta.env.VITE_ACCENT_COLOR || '#059669',
  
  // Función helper para aplicar colores CSS
  applyCSSVariables: () => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', THEME.PRIMARY_COLOR);
    root.style.setProperty('--color-secondary', THEME.SECONDARY_COLOR);
    root.style.setProperty('--color-accent', THEME.ACCENT_COLOR);
  },
} as const;

// =========================================
// METADATA FOR SEO
// =========================================
export const SEO_METADATA = {
  title: `${BRANDING.APP_NAME} - ${BRANDING.APP_SLOGAN}`,
  description: `${BRANDING.COMPANY_NAME} - ${BRANDING.APP_SLOGAN}. Productos de tecnología con la mejor calidad y precios.`,
  keywords: 'tecnología, ecommerce, productos, electrónicos, componentes',
  author: BRANDING.COMPANY_NAME,
  url: BRANDING.APP_URL,
  image: ASSETS.getAssetUrl(ASSETS.LOGO_PATH),
} as const;

// =========================================
// EXPORTS
// =========================================
export default {
  API_CONFIG,
  BRANDING,
  ASSETS,
  SOCIAL_LINKS,
  APP_CONFIG,
  FEATURES,
  THEME,
  SEO_METADATA,
};

// =========================================
// HELPER FUNCTIONS
// =========================================

/**
 * Obtiene la configuración completa de branding
 */
export const getBrandingConfig = () => ({
  name: BRANDING.APP_NAME,
  fullName: BRANDING.COMPANY_NAME,
  slogan: BRANDING.APP_SLOGAN,
  logo: ASSETS.LOGO_PATH,
  headerLogo: ASSETS.HEADER_LOGO_PATH,
  contact: {
    email: BRANDING.CONTACT_EMAIL,
    phone: BRANDING.CONTACT_PHONE,
  },
  social: SOCIAL_LINKS,
});

/**
 * Obtiene los headers para llamadas API
 */
export const getAPIHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Account-ID': API_CONFIG.ACCOUNT_ID,
  ...API_CONFIG.EXTRA_HEADERS,
});

/**
 * Valida que todas las variables de entorno críticas estén configuradas
 */
export const validateEnvironment = () => {
  const required = [
    'VITE_API_BASE_URL',
    'VITE_ACCOUNT_ID',
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    return false;
  }
  
  return true;
};

/**
 * Inicializa la configuración de la aplicación
 */
export const initializeApp = () => {
  // Validar variables de entorno
  if (!validateEnvironment()) {
    throw new Error('Configuración de variables de entorno inválida');
  }
  
  // Aplicar colores CSS
  THEME.applyCSSVariables();
  
  // Configuración inicializada
};