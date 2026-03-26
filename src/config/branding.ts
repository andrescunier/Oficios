/**
 * Configuración central de la aplicación basada en variables de entorno
 * NOTA: Este archivo mantiene compatibilidad con el código existente
 * pero ahora usa la configuración runtime como fuente principal
 */

import { 
  getApiConfig, 
  getAppConfig, 
  getContactConfig, 
  getLegalConfig,
  getPaymentConfig,
  getBusinessConfig,
  getBrandingConfig as getRuntimeBranding,
  getThemeConfig,
  getSocialConfig,
  getFeaturesConfig,
  getImagesConfig
} from './runtime';

// =========================================
// API CONFIGURATION (desde runtime)
// =========================================
const runtimeApi = getApiConfig();
export const API_CONFIG = {
  BASE_URL: runtimeApi.url,
  ACCOUNT_ID: runtimeApi.accountId,
  ACCOUNT_SLUG: runtimeApi.accountSlug,
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
// BRANDING & COMPANY INFO (desde runtime)
// =========================================
const runtimeApp = getAppConfig();
const runtimeContact = getContactConfig();
export const BRANDING = {
  // App Information
  APP_NAME: runtimeApp.name,
  COMPANY_NAME: runtimeApp.companyName,
  APP_SLOGAN: runtimeApp.slogan,
  APP_URL: runtimeApp.url,
  APP_DESCRIPTION: runtimeApp.description,
  
  // Contact Information
  CONTACT_EMAIL: runtimeContact.email,
  CONTACT_PHONE: runtimeContact.phone,
  CONTACT_ADDRESS: runtimeContact.address,
} as const;

// =========================================
// ASSETS & IMAGES (desde runtime)
// =========================================
const runtimeBranding = getRuntimeBranding();
const runtimeImages = getImagesConfig();
export const ASSETS = {
  // Logos
  LOGO_PATH: runtimeBranding.logo,
  FAVICON_PATH: runtimeBranding.favicon,
  HEADER_LOGO_PATH: runtimeBranding.logo,
  FOOTER_LOGO_PATH: runtimeBranding.logo,
  LOGO_DARK_PATH: runtimeBranding.logoDark,
  
  // Hero Slider Images (desde runtime config)
  HERO_SLIDES: runtimeImages.heroSlides,
  
  // Category Images (dinámico desde runtime config productFallbacks)
  CATEGORIES: runtimeImages.productFallbacks,
  
  // Banner & Promotional Images (desde runtime config)
  BANNERS: {
    MAIN: runtimeImages.banners.main,
    SECONDARY: runtimeImages.banners.secondary,
    SEASONAL: runtimeImages.banners.seasonal,
    SALE: runtimeImages.banners.sale
  },
  
  // Background Images (desde runtime config)
  BACKGROUNDS: {
    HERO: runtimeImages.backgrounds.hero,
    FEATURES: runtimeImages.backgrounds.features,
    TESTIMONIALS: runtimeImages.backgrounds.testimonials
  },
  
  // Placeholder Images (desde runtime config)
  PLACEHOLDERS: {
    PRODUCT: runtimeImages.placeholders.product,
    CATEGORY: runtimeImages.placeholders.category,
    USER: runtimeImages.placeholders.user
  },
  
  // Función helper para obtener URLs completas
  getAssetUrl: (path: string) => {
    if (path.startsWith('http')) return path;
    return `${BRANDING.APP_URL}${path.startsWith('/') ? path : `/${path}`}`;
  }
} as const;

// =========================================
// SOCIAL MEDIA & LINKS (desde runtime)
// =========================================
const runtimeSocial = getSocialConfig();
export const SOCIAL_LINKS = {
  FACEBOOK: runtimeSocial.facebook,
  INSTAGRAM: runtimeSocial.instagram,
  TWITTER: runtimeSocial.twitter,
  LINKEDIN: runtimeSocial.linkedin,
} as const;

// Función helper para verificar si un link está configurado
export const isSocialLinkConfigured = (platform: keyof typeof SOCIAL_LINKS): boolean => {
  return Boolean(SOCIAL_LINKS[platform]);
};

// =========================================
// CONTACT CONFIG (desde runtime)
// =========================================
const runtimeContact2 = getContactConfig();
export const CONTACT = {
  EMAIL: runtimeContact2.email,
  SALES_EMAIL: runtimeContact2.salesEmail,
  PHONE: runtimeContact2.phone,
  WHATSAPP: runtimeContact2.whatsapp,
  ADDRESS: runtimeContact2.address,
  WHATSAPP_LINK: runtimeContact2.whatsapp ? `https://wa.me/${runtimeContact2.whatsapp}` : '',
} as const;

// =========================================
// LEGAL CONFIG (desde runtime)
// =========================================
const runtimeLegal = getLegalConfig();
export const LEGAL = {
  COMPANY_NAME: runtimeLegal.companyName,
  CUIT: runtimeLegal.cuit,
  ADDRESS: runtimeLegal.address,
  JURISDICTION: runtimeLegal.jurisdiction,
} as const;

// =========================================
// PAYMENT CONFIG (desde runtime)
// =========================================
const runtimePayment = getPaymentConfig();
export const PAYMENT_INFO = {
  BANK_NAME: runtimePayment.bankName,
  ACCOUNT_HOLDER: runtimePayment.accountHolder,
  CBU: runtimePayment.cbu,
  ALIAS: runtimePayment.alias,
  WA_VERIFICATION: runtimePayment.whatsappVerification,
} as const;

// =========================================
// BUSINESS CONFIG (desde runtime)
// =========================================
const runtimeBusiness = getBusinessConfig();
export const BUSINESS = {
  DEFAULT_TAX_RATE: runtimeBusiness.defaultTaxRate,
  MAX_QUANTITY_PER_PRODUCT: runtimeBusiness.maxQuantityPerProduct,
  DEFAULT_CURRENCY: runtimeBusiness.defaultCurrency,
  DEFAULT_COUNTRY: runtimeBusiness.defaultCountry,
  BUSINESS_HOURS: runtimeBusiness.businessHours,
  RETURN_POLICY_DAYS: runtimeBusiness.returnPolicyDays,
  REFUND_PROCESSING_TIME: runtimeBusiness.refundProcessingTime,
  PRODUCTS_PER_PAGE: runtimeBusiness.productsPerPage,
  FEATURED_PRODUCTS_COUNT: runtimeBusiness.featuredProductsCount,
  HERO_SLIDER_INTERVAL: runtimeBusiness.heroSliderInterval,
  INVOICE_NOTE: runtimeBusiness.invoiceNote,
  FREE_SHIPPING_THRESHOLD: runtimeBusiness.freeShippingThreshold,
  LOCALE: runtimeBusiness.locale,
} as const;

// =========================================
// APP CONFIGURATION
// =========================================
export const APP_CONFIG = {
  ENV: import.meta.env.VITE_APP_ENV || 'production',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.2.14',
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  API_LOGGING: false,
} as const;

// =========================================
// FEATURE FLAGS (desde runtime)
// =========================================
const runtimeFeatures = getFeaturesConfig();
export const FEATURES = {
  // Feature flags
  NOTIFICATIONS: runtimeFeatures.notifications,
  ANALYTICS: runtimeFeatures.analytics,
  REAL_PAYMENTS: runtimeFeatures.realPayments,
  
  // B2B Specific Features (desde runtime app config)
  HIDE_PRICES_FOR_GUESTS: runtimeApp.hidePricesForGuests,
  LOGIN_TO_VIEW_PRICES_MESSAGE: runtimeApp.loginMessage,
  LOGIN_FOR_PRICES_CTA: runtimeApp.loginCta,
  REQUIRE_AUTH_FOR_CART: runtimeApp.requireAuthForCart,
  
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
// COLORS & THEMING (desde runtime)
// =========================================
const runtimeTheme = getThemeConfig();
export const THEME = {
  PRIMARY_COLOR: runtimeTheme.colorPrimary,
  SECONDARY_COLOR: runtimeTheme.colorSecondary,
  ACCENT_COLOR: runtimeTheme.colorAccent,
  
  // Función helper para aplicar colores CSS (ahora manejado por theme.ts)
  applyCSSVariables: () => {
    // Las variables CSS ahora se manejan en src/config/theme.ts
    // Esta función se mantiene por compatibilidad
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
  'X-Account-ID': (() => {
    if (typeof window === 'undefined') {
      return API_CONFIG.ACCOUNT_ID;
    }
    return window.localStorage.getItem('active_account_id') || API_CONFIG.ACCOUNT_ID;
  })(),
  ...API_CONFIG.EXTRA_HEADERS,
});

/**
 * Valida que todas las variables de entorno críticas estén configuradas
 */
export const validateEnvironment = () => {
  // En producción, la configuración puede venir de window.__APP_CONFIG__ (runtime config)
  const runtimeConfig = (window as any).__APP_CONFIG__;
  if (runtimeConfig?.API_BASE_URL && runtimeConfig?.ACCOUNT_ID) {
    return true;
  }

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
