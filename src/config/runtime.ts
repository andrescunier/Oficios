/**
 * Runtime Configuration Helper
 * Accede a la configuración inyectada en window.__APP_CONFIG__
 * con fallbacks a variables de entorno de Vite para desarrollo
 */

// Tipo para la configuración runtime
export interface HeroSlideConfig {
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
}

export interface CategoryConfig {
  name: string;
  image: string;
  link: string;
  description: string;
  /** Slug usado en la URL (ej: 'ssd-sata'). Si no se provee, se extrae de link. */
  slug?: string;
  /** Keywords para buscar productos de esta categoría en nombre, descripción y metadata */
  searchTerms?: string[];
}

export interface ImagesConfig {
  heroSlides: HeroSlideConfig[];
  categories: CategoryConfig[];
  placeholders: {
    product: string;
    category: string;
    user: string;
  };
  backgrounds: {
    hero: string;
    features: string;
    testimonials: string;
  };
  banners: {
    main: string;
    secondary: string;
    seasonal: string;
    sale: string;
  };
  /** Mapa de keyword → URL de imagen para fallback de productos sin image_url */
  productFallbacks: Record<string, string>;
}

export interface FilterConfig {
  enabled: boolean;
  capacidad: boolean;
  velocidad: boolean;
  /** Opciones personalizadas de capacidad */
  capacidadOptions?: Array<{ value: string; label: string }>;
  /** Opciones personalizadas de velocidad */
  velocidadOptions?: Array<{ value: string; label: string }>;
}

export interface RuntimeConfig {
  api: {
    url: string;
    accountId: string;
    accountSlug: string;
  };
  app: {
    name: string;
    companyName: string;
    slogan: string;
    description: string;
    url: string;
    hidePricesForGuests: boolean;
    requireAuthForCart: boolean;
    loginMessage: string;
    loginCta: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  branding: {
    logo: string;
    logoDark: string;
    favicon: string;
    banner: string;
    ogImage: string;
  };
  theme: {
    colorPrimary: string;
    colorPrimaryHover: string;
    colorPrimaryForeground: string;
    colorSecondary: string;
    colorSecondaryForeground: string;
    colorBackground: string;
    colorForeground: string;
    colorSurface: string;
    colorSurfaceForeground: string;
    colorMuted: string;
    colorMutedForeground: string;
    colorBorder: string;
    colorInput: string;
    colorRing: string;
    colorSuccess: string;
    colorWarning: string;
    colorError: string;
    colorAccent: string;
    colorAccentForeground: string;
    fontFamily: string;
    fontUrl: string;
  };
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  features: {
    notifications: boolean;
    analytics: boolean;
    realPayments: boolean;
  };
  filters: FilterConfig;
  paymentMethods: {
    transferencia: boolean;
    efectivo: boolean;
    mercadopago: boolean;
    tarjeta: boolean;
  };
  images: ImagesConfig;
}

// Extender Window para TypeScript
declare global {
  interface Window {
    __APP_CONFIG__?: RuntimeConfig;
  }
}

/**
 * Obtiene el valor de configuración runtime con fallback a Vite env
 */
function getEnvValue(runtimeValue: string | undefined, viteKey: string, defaultValue: string): string {
  // Primero intentar runtime config
  if (runtimeValue !== undefined && runtimeValue !== '') {
    return runtimeValue;
  }
  // Luego intentar variable de Vite (solo en desarrollo)
  const viteValue = import.meta.env[viteKey];
  if (viteValue !== undefined && viteValue !== '') {
    return viteValue;
  }
  // Finalmente usar default
  return defaultValue;
}

/**
 * Obtiene valor boolean con fallback
 */
function getBoolValue(runtimeValue: boolean | undefined, viteKey: string, defaultValue: boolean): boolean {
  if (runtimeValue !== undefined) {
    return runtimeValue;
  }
  const viteValue = import.meta.env[viteKey];
  if (viteValue !== undefined) {
    return viteValue === 'true';
  }
  return defaultValue;
}

/**
 * Configuración de API
 */
export const getApiConfig = () => {
  const rc = window.__APP_CONFIG__;
  return {
    url: getEnvValue(rc?.api?.url, 'VITE_API_BASE_URL', 'https://api.cumar.com.ar'),
    accountId: getEnvValue(rc?.api?.accountId, 'VITE_ACCOUNT_ID', 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c'),
    accountSlug: getEnvValue(rc?.api?.accountSlug, 'VITE_ACCOUNT_SLUG', 'diap'),
  };
};

/**
 * Configuración de la aplicación
 */
export const getAppConfig = () => {
  const rc = window.__APP_CONFIG__;
  return {
    name: getEnvValue(rc?.app?.name, 'VITE_APP_NAME', 'DIAP'),
    companyName: getEnvValue(rc?.app?.companyName, 'VITE_COMPANY_NAME', 'DIAP'),
    slogan: getEnvValue(rc?.app?.slogan, 'VITE_APP_SLOGAN', 'Tecnología profesional para empresas'),
    description: getEnvValue(rc?.app?.description, 'VITE_APP_DESCRIPTION', 'DIAP - Distribuidora de productos tecnológicos de primera calidad'),
    url: getEnvValue(rc?.app?.url, 'VITE_APP_URL', 'https://diap.com'),
    hidePricesForGuests: getBoolValue(rc?.app?.hidePricesForGuests, 'VITE_HIDE_PRICES_FOR_GUESTS', true),
    requireAuthForCart: getBoolValue(rc?.app?.requireAuthForCart, 'VITE_REQUIRE_AUTH_FOR_CART', true),
    loginMessage: getEnvValue(rc?.app?.loginMessage, 'VITE_LOGIN_TO_VIEW_PRICES_MESSAGE', 'Inicia sesión para ver precios'),
    loginCta: getEnvValue(rc?.app?.loginCta, 'VITE_LOGIN_FOR_PRICES_CTA', 'Iniciar Sesión'),
  };
};

/**
 * Configuración de contacto
 */
export const getContactConfig = () => {
  const rc = window.__APP_CONFIG__;
  return {
    email: getEnvValue(rc?.contact?.email, 'VITE_CONTACT_EMAIL', 'info@diapstore.com'),
    phone: getEnvValue(rc?.contact?.phone, 'VITE_CONTACT_PHONE', '+54 11 2631-0884'),
    address: getEnvValue(rc?.contact?.address, 'VITE_CONTACT_ADDRESS', 'Palomar, Provincia de Buenos Aires'),
  };
};

/**
 * Configuración de branding
 */
export const getBrandingConfig = () => {
  const rc = window.__APP_CONFIG__;
  return {
    logo: getEnvValue(rc?.branding?.logo, 'VITE_LOGO_PATH', '/diap-logo.png'),
    logoDark: getEnvValue(rc?.branding?.logoDark, 'VITE_LOGO_DARK_PATH', ''),
    favicon: getEnvValue(rc?.branding?.favicon, 'VITE_FAVICON_PATH', '/favicon.ico'),
    banner: getEnvValue(rc?.branding?.banner, 'VITE_BANNER_URL', ''),
    ogImage: getEnvValue(rc?.branding?.ogImage, 'VITE_OG_IMAGE_URL', '/diap-logo.png'),
  };
};

/**
 * Configuración de tema/colores
 */
export const getThemeConfig = () => {
  const rc = window.__APP_CONFIG__;
  return {
    colorPrimary: getEnvValue(rc?.theme?.colorPrimary, 'VITE_COLOR_PRIMARY', '#2563eb'),
    colorPrimaryHover: getEnvValue(rc?.theme?.colorPrimaryHover, 'VITE_COLOR_PRIMARY_HOVER', '#1d4ed8'),
    colorPrimaryForeground: getEnvValue(rc?.theme?.colorPrimaryForeground, 'VITE_COLOR_PRIMARY_FOREGROUND', '#ffffff'),
    colorSecondary: getEnvValue(rc?.theme?.colorSecondary, 'VITE_COLOR_SECONDARY', '#f1f5f9'),
    colorSecondaryForeground: getEnvValue(rc?.theme?.colorSecondaryForeground, 'VITE_COLOR_SECONDARY_FOREGROUND', '#0f172a'),
    colorBackground: getEnvValue(rc?.theme?.colorBackground, 'VITE_COLOR_BACKGROUND', '#ffffff'),
    colorForeground: getEnvValue(rc?.theme?.colorForeground, 'VITE_COLOR_FOREGROUND', '#0f172a'),
    colorSurface: getEnvValue(rc?.theme?.colorSurface, 'VITE_COLOR_SURFACE', '#ffffff'),
    colorSurfaceForeground: getEnvValue(rc?.theme?.colorSurfaceForeground, 'VITE_COLOR_SURFACE_FOREGROUND', '#0f172a'),
    colorMuted: getEnvValue(rc?.theme?.colorMuted, 'VITE_COLOR_MUTED', '#f1f5f9'),
    colorMutedForeground: getEnvValue(rc?.theme?.colorMutedForeground, 'VITE_COLOR_MUTED_FOREGROUND', '#64748b'),
    colorBorder: getEnvValue(rc?.theme?.colorBorder, 'VITE_COLOR_BORDER', '#e2e8f0'),
    colorInput: getEnvValue(rc?.theme?.colorInput, 'VITE_COLOR_INPUT', '#e2e8f0'),
    colorRing: getEnvValue(rc?.theme?.colorRing, 'VITE_COLOR_RING', '#2563eb'),
    colorSuccess: getEnvValue(rc?.theme?.colorSuccess, 'VITE_COLOR_SUCCESS', '#22c55e'),
    colorWarning: getEnvValue(rc?.theme?.colorWarning, 'VITE_COLOR_WARNING', '#f59e0b'),
    colorError: getEnvValue(rc?.theme?.colorError, 'VITE_COLOR_ERROR', '#ef4444'),
    colorAccent: getEnvValue(rc?.theme?.colorAccent, 'VITE_COLOR_ACCENT', '#f1f5f9'),
    colorAccentForeground: getEnvValue(rc?.theme?.colorAccentForeground, 'VITE_COLOR_ACCENT_FOREGROUND', '#0f172a'),
    fontFamily: getEnvValue(rc?.theme?.fontFamily, 'VITE_FONT_FAMILY', ''),
    fontUrl: getEnvValue(rc?.theme?.fontUrl, 'VITE_FONT_URL', ''),
  };
};

/**
 * Configuración de redes sociales
 */
export const getSocialConfig = () => {
  const rc = window.__APP_CONFIG__;
  return {
    facebook: getEnvValue(rc?.social?.facebook, 'VITE_FACEBOOK_URL', ''),
    instagram: getEnvValue(rc?.social?.instagram, 'VITE_INSTAGRAM_URL', ''),
    twitter: getEnvValue(rc?.social?.twitter, 'VITE_TWITTER_URL', ''),
    linkedin: getEnvValue(rc?.social?.linkedin, 'VITE_LINKEDIN_URL', ''),
  };
};

/**
 * Configuración de features
 */
export const getFeaturesConfig = () => {
  const rc = window.__APP_CONFIG__;
  return {
    notifications: getBoolValue(rc?.features?.notifications, 'VITE_FEATURE_NOTIFICATIONS', false),
    analytics: getBoolValue(rc?.features?.analytics, 'VITE_FEATURE_ANALYTICS', false),
    realPayments: getBoolValue(rc?.features?.realPayments, 'VITE_FEATURE_REAL_PAYMENTS', false),
  };
};

/**
 * Configuración de filtros de productos
 */
export const getFiltersConfig = (): FilterConfig => {
  const rc = window.__APP_CONFIG__;
  return {
    enabled: getBoolValue(rc?.filters?.enabled, 'VITE_FILTERS_ENABLED', false),
    capacidad: getBoolValue(rc?.filters?.capacidad, 'VITE_FILTER_CAPACIDAD', false),
    velocidad: getBoolValue(rc?.filters?.velocidad, 'VITE_FILTER_VELOCIDAD', false),
    capacidadOptions: rc?.filters?.capacidadOptions || undefined,
    velocidadOptions: rc?.filters?.velocidadOptions || undefined,
  };
};

/**
 * Configuración de imágenes (hero slides, categorías, placeholders, banners, backgrounds, fallbacks de productos)
 */
export const getImagesConfig = (): ImagesConfig => {
  const rc = window.__APP_CONFIG__;

  const defaultHeroSlides: HeroSlideConfig[] = [
    {
      image: '/images/heroes/slide-1.jpg',
      title: 'Tecnología Profesional para Empresas',
      subtitle: 'Soluciones B2B en componentes de alta gama',
      cta: 'Ver Catálogo',
      link: '/productos'
    },
    {
      image: '/images/heroes/slide-2.jpg',
      title: 'SSDs de Alto Rendimiento',
      subtitle: 'Almacenamiento profesional para tu negocio',
      cta: 'Explorar SSDs',
      link: '/productos'
    },
    {
      image: '/images/heroes/slide-3.jpg',
      title: 'Memorias RAM DDR4 & DDR5',
      subtitle: 'Maximiza el rendimiento de tus equipos',
      cta: 'Ver Memorias',
      link: '/productos'
    }
  ];

  const defaultCategories: CategoryConfig[] = [
    {
      name: 'SSD SATA',
      slug: 'ssd-sata',
      image: '/images/categories/ssd-sata.jpg',
      link: '/categoria/ssd-sata',
      description: 'SATA III para máximo rendimiento',
      searchTerms: ['ssd']
    },
    {
      name: 'Memoria RAM',
      slug: 'memoria-ram',
      image: '/images/categories/ddr4.jpg',
      link: '/categoria/memoria-ram',
      description: 'Módulos de memoria de alta velocidad',
      searchTerms: ['ram', 'ddr', 'sodimm', 'udimm', 'memoria', 'memory']
    }
  ];

  const defaultProductFallbacks: Record<string, string> = {
    'ssd-m2': '/images/categories/ssd-m2.jpg',
    'ssd-nvme': '/images/categories/ssd-m2.jpg',
    'ssd-sata': '/images/categories/ssd-sata.jpg',
    'ssd': '/images/categories/ssd-m2.jpg',
    'ddr5': '/images/categories/ddr5.jpg',
    'ddr4': '/images/categories/ddr4.jpg',
    'memoria': '/images/categories/ddr4.jpg',
    'ram': '/images/categories/ddr4.jpg',
    'gaming': '/images/categories/gaming.jpg',
    'componentes': '/images/categories/componentes.jpg',
    'default': '/images/categories/componentes.jpg'
  };

  return {
    heroSlides: rc?.images?.heroSlides?.length ? rc.images.heroSlides : defaultHeroSlides,
    categories: rc?.images?.categories?.length ? rc.images.categories : defaultCategories,
    placeholders: {
      product: rc?.images?.placeholders?.product || '/images/placeholders/product-placeholder.jpg',
      category: rc?.images?.placeholders?.category || '/images/placeholders/category-placeholder.jpg',
      user: rc?.images?.placeholders?.user || '/images/placeholders/user-placeholder.jpg',
    },
    backgrounds: {
      hero: rc?.images?.backgrounds?.hero || '/images/backgrounds/hero-bg.jpg',
      features: rc?.images?.backgrounds?.features || '/images/backgrounds/features-bg.jpg',
      testimonials: rc?.images?.backgrounds?.testimonials || '/images/backgrounds/testimonials-bg.jpg',
    },
    banners: {
      main: rc?.images?.banners?.main || '/images/banners/main-banner.jpg',
      secondary: rc?.images?.banners?.secondary || '/images/banners/secondary-banner.jpg',
      seasonal: rc?.images?.banners?.seasonal || '/images/banners/seasonal-banner.jpg',
      sale: rc?.images?.banners?.sale || '/images/banners/sale-banner.jpg',
    },
    productFallbacks: rc?.images?.productFallbacks || defaultProductFallbacks,
  };
};

/**
 * Configuración de métodos de pago
 */
export const getPaymentMethodsConfig = () => {
  const rc = window.__APP_CONFIG__;
  return {
    transferencia: getBoolValue(rc?.paymentMethods?.transferencia, 'VITE_PAYMENT_TRANSFERENCIA', true),
    efectivo: getBoolValue(rc?.paymentMethods?.efectivo, 'VITE_PAYMENT_EFECTIVO', true),
    mercadopago: getBoolValue(rc?.paymentMethods?.mercadopago, 'VITE_PAYMENT_MERCADOPAGO', false),
    tarjeta: getBoolValue(rc?.paymentMethods?.tarjeta, 'VITE_PAYMENT_TARJETA', false),
  };
};

/**
 * Helper: devuelve las categorías navegables con slug normalizado.
 * Cada categoría incluye searchTerms para filtrado genérico de productos.
 */
export const getCategoriesConfig = (): CategoryConfig[] => {
  const images = getImagesConfig();
  return images.categories.map(cat => ({
    ...cat,
    slug: cat.slug || cat.link.replace(/^\/categoria\//, ''),
  }));
};

/**
 * Helper: busca la config de una categoría por slug.
 */
export const getCategoryBySlug = (slug: string): CategoryConfig | undefined => {
  return getCategoriesConfig().find(c => (c.slug || c.link.replace(/^\/categoria\//, '')) === slug);
};

/**
 * Obtiene toda la configuración runtime
 */
export const getRuntimeConfig = (): RuntimeConfig => {
  return {
    api: getApiConfig(),
    app: getAppConfig(),
    contact: getContactConfig(),
    branding: getBrandingConfig(),
    theme: getThemeConfig(),
    social: getSocialConfig(),
    features: getFeaturesConfig(),
    filters: getFiltersConfig(),
    paymentMethods: getPaymentMethodsConfig(),
    images: getImagesConfig(),
  };
};

/**
 * Verificar si hay configuración runtime disponible
 */
export const hasRuntimeConfig = (): boolean => {
  return typeof window !== 'undefined' && window.__APP_CONFIG__ !== undefined;
};

// Exportar configuración como constantes para acceso rápido
export const API_CONFIG = getApiConfig();
export const APP_CONFIG = getAppConfig();
export const CONTACT_CONFIG = getContactConfig();
export const BRANDING_CONFIG = getBrandingConfig();
export const THEME_CONFIG = getThemeConfig();
export const SOCIAL_CONFIG = getSocialConfig();
export const FEATURES_CONFIG = getFeaturesConfig();
export const FILTERS_CONFIG = getFiltersConfig();
export const PAYMENT_METHODS_CONFIG = getPaymentMethodsConfig();

export default getRuntimeConfig;
