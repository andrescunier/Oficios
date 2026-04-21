/**
 * Runtime configuration
 * La app se inicializa con dos variables de entorno:
 * - VITE_API_BASE_URL
 * - VITE_ACCOUNT_ID
 *
 * Todo el resto debe venir del endpoint:
 * GET /api/accounts/{accountId}/ecommerce-config
 */

export interface HeroSlideConfig {
  image: string;
  mobileImage?: string;
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
  slug?: string;
  group?: string;
  searchTerms?: string[];
  productCategories?: string[];
  subcategories?: CategoryConfig[];
}

export interface FeatureBenefitConfig {
  icon: string;
  title: string;
  description: string;
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
  productFallbacks: Record<string, string>;
}

export interface FilterConfig {
  enabled: boolean;
  capacidad: boolean;
  velocidad: boolean;
  capacidadOptions?: Array<{ value: string; label: string }>;
  velocidadOptions?: Array<{ value: string; label: string }>;
}

export interface ObservabilityConfig {
  enabled: boolean;
  endpoint: string;
  flushIntervalMs: number;
  maxQueueSize: number;
  useBeacon: boolean;
}

export interface RuntimeConfig {
  api: {
    url: string;
    accountId: string;
    accountSlug: string;
    channel?: string;
    extraHeaders: Record<string, string>;
  };
  cdnBaseUrl?: string;
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
    salesEmail: string;
    phone: string;
    whatsapp: string;
    address: string;
  };
  legal: {
    companyName: string;
    cuit: string;
    address: string;
    jurisdiction: string;
  };
  business: {
    defaultTaxRate: number;
    maxQuantityPerProduct: number;
    defaultCurrency: string;
    defaultCountry: string;
    businessHours: string;
    returnPolicyDays: string;
    refundProcessingTime: string;
    productsPerPage: number;
    featuredProductsCount: number;
    heroSliderInterval: number;
    invoiceNote: string;
    freeShippingThreshold: number;
    locale: string;
  };
  branding: {
    logo: string;
    headerLogo: string;
    footerLogo: string;
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
    benefits: FeatureBenefitConfig[];
  };
  filters: FilterConfig;
  paymentMethods: {
    transferencia: boolean;
    efectivo: boolean;
    mercadopago: boolean;
    tarjeta: boolean;
  };
  payment: {
    bankName: string;
    accountHolder: string;
    cbu: string;
    alias: string;
    whatsappVerification: string;
  };
  observability: ObservabilityConfig;
  images: ImagesConfig;
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

declare global {
  interface Window {
    __APP_CONFIG__?: DeepPartial<RuntimeConfig>;
  }
}

const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  api: {
    url: import.meta.env.VITE_API_BASE_URL || 'https://api.cumar.com.ar',
    accountId: import.meta.env.VITE_ACCOUNT_ID || '',
    accountSlug: '',
    channel: 'ecommerce',
    extraHeaders: {},
  },
  cdnBaseUrl: '',
  app: {
    name: 'Mi Tienda',
    companyName: 'Mi Empresa',
    slogan: 'Tu tienda online',
    description: 'Tienda online de productos',
    url: '',
    hidePricesForGuests: true,
    requireAuthForCart: true,
    loginMessage: 'Inicia sesión para ver precios',
    loginCta: 'Iniciar sesión',
  },
  contact: {
    email: 'info@tienda.com',
    salesEmail: 'ventas@tienda.com',
    phone: '',
    whatsapp: '',
    address: '',
  },
  legal: {
    companyName: 'Mi Empresa',
    cuit: '',
    address: '',
    jurisdiction: '',
  },
  business: {
    defaultTaxRate: 0.21,
    maxQuantityPerProduct: 5,
    defaultCurrency: 'ARS',
    defaultCountry: 'Argentina',
    businessHours: 'Lunes a Viernes: 9:00 - 18:00hs',
    returnPolicyDays: '10 días corridos',
    refundProcessingTime: '5 a 10 días hábiles',
    productsPerPage: 50,
    featuredProductsCount: 8,
    heroSliderInterval: 5000,
    invoiceNote: 'Se emite factura tipo A o B según la condición fiscal del comprador.',
    freeShippingThreshold: 50000,
    locale: 'es-AR',
  },
  branding: {
    logo: '/diap-logo.png',
    headerLogo: '/diap-logo.png',
    footerLogo: '/diap-logo.png',
    logoDark: '',
    favicon: '/favicon.ico',
    banner: '',
    ogImage: '/diap-logo.png',
  },
  theme: {
    colorPrimary: '#2563eb',
    colorPrimaryHover: '#1d4ed8',
    colorPrimaryForeground: '#ffffff',
    colorSecondary: '#f1f5f9',
    colorSecondaryForeground: '#0f172a',
    colorBackground: '#ffffff',
    colorForeground: '#0f172a',
    colorSurface: '#ffffff',
    colorSurfaceForeground: '#0f172a',
    colorMuted: '#f1f5f9',
    colorMutedForeground: '#64748b',
    colorBorder: '#e2e8f0',
    colorInput: '#e2e8f0',
    colorRing: '#2563eb',
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorAccent: '#f1f5f9',
    colorAccentForeground: '#0f172a',
    fontFamily: '',
    fontUrl: '',
  },
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
  },
  features: {
    notifications: false,
    analytics: false,
    realPayments: false,
    benefits: [
      {
        icon: 'Truck',
        title: 'Envio Gratis',
        description: 'En compras seleccionadas',
      },
      {
        icon: 'RotateCcw',
        title: 'Devolucion Facil',
        description: 'Cambios y devoluciones simples',
      },
      {
        icon: 'Shield',
        title: 'Compra Segura',
        description: 'Protegemos tus datos',
      },
      {
        icon: 'CreditCard',
        title: 'Multiples Pagos',
        description: 'Transferencia y medios seleccionados',
      },
    ],
  },
  filters: {
    enabled: false,
    capacidad: false,
    velocidad: false,
  },
  paymentMethods: {
    transferencia: true,
    efectivo: true,
    mercadopago: false,
    tarjeta: false,
  },
  payment: {
    bankName: '',
    accountHolder: '',
    cbu: '',
    alias: '',
    whatsappVerification: '',
  },
  observability: {
    enabled: false,
    endpoint: '',
    flushIntervalMs: 15000,
    maxQueueSize: 50,
    useBeacon: true,
  },
  images: {
    heroSlides: [],
    categories: [],
    placeholders: {
      product: '/placeholder-product.svg',
      category: '/placeholder-product.svg',
      user: '/placeholder-product.svg',
    },
    backgrounds: {
      hero: '',
      features: '',
      testimonials: '',
    },
    banners: {
      main: '',
      secondary: '',
      seasonal: '',
      sale: '',
    },
    productFallbacks: {},
  },
};

function getConfigRoot(): DeepPartial<RuntimeConfig> {
  if (typeof window === 'undefined') {
    return {};
  }

  return window.__APP_CONFIG__ || {};
}

export const setRuntimeConfig = (config: DeepPartial<RuntimeConfig>): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.__APP_CONFIG__ = config;
};

function readString(value: string | undefined, fallback: string): string {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

function readBoolean(value: boolean | undefined, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function readNumber(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
}

function readStringMap(value: unknown, fallback: Record<string, string>): Record<string, string> {
  if (typeof value !== 'object' || value === null) {
    return { ...fallback };
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>((acc, [key, entry]) => {
    if (typeof entry === 'string' && entry.trim() !== '') {
      acc[key] = entry;
    }
    return acc;
  }, { ...fallback });
}

function normalizeHeroSlides(raw: unknown): HeroSlideConfig[] {
  if (!Array.isArray(raw)) {
    return DEFAULT_RUNTIME_CONFIG.images.heroSlides;
  }

  // When slides are plain strings, use branding info as overlay text
  const app = getConfigRoot().app;
  const defaultTitle = readString(app?.slogan, DEFAULT_RUNTIME_CONFIG.app.slogan);
  const defaultSubtitle = readString(app?.description, DEFAULT_RUNTIME_CONFIG.app.description);

  return raw
    .map((item) => {
      if (typeof item === 'string') {
        return { image: item, title: defaultTitle, subtitle: defaultSubtitle, cta: 'Ver Catálogo', link: '/productos' };
      }

      if (typeof item === 'object' && item !== null) {
        const slide = item as Partial<HeroSlideConfig>;
        return {
          image: slide.image || '',
          mobileImage: slide.mobileImage || '',
          title: slide.title || '',
          subtitle: slide.subtitle || '',
          cta: slide.cta || '',
          link: slide.link || '/productos',
        };
      }

      return null;
    })
    .filter(Boolean) as HeroSlideConfig[];
}

function normalizeSingleCategory(item: unknown): CategoryConfig | null {
  if (typeof item !== 'object' || item === null) {
    return null;
  }

  const category = item as Partial<CategoryConfig> & { subcategories?: unknown };
  return {
    name: category.name || '',
    image: category.image || '',
    link: category.link || '',
    description: category.description || '',
    slug: category.slug || '',
    group: category.group || '',
    searchTerms: Array.isArray(category.searchTerms) ? category.searchTerms : [],
    productCategories: Array.isArray(category.productCategories) ? category.productCategories : [],
    subcategories: Array.isArray(category.subcategories)
      ? (category.subcategories.map(normalizeSingleCategory).filter(Boolean) as CategoryConfig[])
      : undefined,
  };
}

function normalizeCategories(raw: unknown): CategoryConfig[] {
  if (!Array.isArray(raw)) {
    return DEFAULT_RUNTIME_CONFIG.images.categories;
  }

  return raw.map(normalizeSingleCategory).filter(Boolean) as CategoryConfig[];
}

function normalizeFeatureBenefits(raw: unknown): FeatureBenefitConfig[] {
  if (!Array.isArray(raw)) {
    return DEFAULT_RUNTIME_CONFIG.features.benefits;
  }

  const normalized = raw
    .map((item) => {
      if (typeof item !== 'object' || item === null) {
        return null;
      }

      const benefit = item as Partial<FeatureBenefitConfig>;
      if (!benefit.title && !benefit.description) {
        return null;
      }

      return {
        icon: benefit.icon || 'Shield',
        title: benefit.title || '',
        description: benefit.description || '',
      };
    })
    .filter(Boolean) as FeatureBenefitConfig[];

  return normalized.length > 0 ? normalized : DEFAULT_RUNTIME_CONFIG.features.benefits;
}

function normalizeImageMap<T extends Record<string, string>>(raw: unknown, fallback: T): T {
  if (typeof raw !== 'object' || raw === null) {
    return { ...fallback };
  }

  const result = { ...fallback };
  for (const key of Object.keys(fallback)) {
    const value = (raw as Record<string, unknown>)[key];
    if (typeof value === 'string' && value.trim() !== '') {
      result[key as keyof T] = value as T[keyof T];
    }
  }

  return result;
}

export const getApiConfig = () => {
  const api = getConfigRoot().api;
  return {
    url: readString(api?.url, DEFAULT_RUNTIME_CONFIG.api.url),
    accountId: readString(api?.accountId, DEFAULT_RUNTIME_CONFIG.api.accountId),
    accountSlug: readString(api?.accountSlug, DEFAULT_RUNTIME_CONFIG.api.accountSlug),
    channel: readString(api?.channel, DEFAULT_RUNTIME_CONFIG.api.channel || 'ecommerce'),
    extraHeaders: readStringMap(api?.extraHeaders, DEFAULT_RUNTIME_CONFIG.api.extraHeaders),
  };
};

export const getCdnBaseUrl = (): string => {
  return readString(getConfigRoot().cdnBaseUrl, DEFAULT_RUNTIME_CONFIG.cdnBaseUrl || '');
};

export const getAppConfig = () => {
  const app = getConfigRoot().app;
  return {
    name: readString(app?.name, DEFAULT_RUNTIME_CONFIG.app.name),
    companyName: readString(app?.companyName, DEFAULT_RUNTIME_CONFIG.app.companyName),
    slogan: readString(app?.slogan, DEFAULT_RUNTIME_CONFIG.app.slogan),
    description: readString(app?.description, DEFAULT_RUNTIME_CONFIG.app.description),
    url: readString(app?.url, DEFAULT_RUNTIME_CONFIG.app.url),
    hidePricesForGuests: readBoolean(app?.hidePricesForGuests, DEFAULT_RUNTIME_CONFIG.app.hidePricesForGuests),
    requireAuthForCart: readBoolean(app?.requireAuthForCart, DEFAULT_RUNTIME_CONFIG.app.requireAuthForCart),
    loginMessage: readString(app?.loginMessage, DEFAULT_RUNTIME_CONFIG.app.loginMessage),
    loginCta: readString(app?.loginCta, DEFAULT_RUNTIME_CONFIG.app.loginCta),
  };
};

export const getContactConfig = () => {
  const contact = getConfigRoot().contact;
  return {
    email: readString(contact?.email, DEFAULT_RUNTIME_CONFIG.contact.email),
    salesEmail: readString(contact?.salesEmail, DEFAULT_RUNTIME_CONFIG.contact.salesEmail),
    phone: readString(contact?.phone, DEFAULT_RUNTIME_CONFIG.contact.phone),
    whatsapp: readString(contact?.whatsapp, DEFAULT_RUNTIME_CONFIG.contact.whatsapp),
    address: readString(contact?.address, DEFAULT_RUNTIME_CONFIG.contact.address),
  };
};

export const getLegalConfig = () => {
  const legal = getConfigRoot().legal;
  const app = getAppConfig();
  return {
    companyName: readString(legal?.companyName, app.companyName),
    cuit: readString(legal?.cuit, DEFAULT_RUNTIME_CONFIG.legal.cuit),
    address: readString(legal?.address, DEFAULT_RUNTIME_CONFIG.legal.address),
    jurisdiction: readString(legal?.jurisdiction, DEFAULT_RUNTIME_CONFIG.legal.jurisdiction),
  };
};

export const getPaymentConfig = () => {
  const payment = getConfigRoot().payment;
  return {
    bankName: readString(payment?.bankName, DEFAULT_RUNTIME_CONFIG.payment.bankName),
    accountHolder: readString(payment?.accountHolder, DEFAULT_RUNTIME_CONFIG.payment.accountHolder),
    cbu: readString(payment?.cbu, DEFAULT_RUNTIME_CONFIG.payment.cbu),
    alias: readString(payment?.alias, DEFAULT_RUNTIME_CONFIG.payment.alias),
    whatsappVerification: readString(payment?.whatsappVerification, DEFAULT_RUNTIME_CONFIG.payment.whatsappVerification),
  };
};

export const getObservabilityConfig = (): ObservabilityConfig => {
  const observability = getConfigRoot().observability;
  return {
    enabled: readBoolean(observability?.enabled, DEFAULT_RUNTIME_CONFIG.observability.enabled),
    endpoint: readString(observability?.endpoint, DEFAULT_RUNTIME_CONFIG.observability.endpoint),
    flushIntervalMs: readNumber(observability?.flushIntervalMs, DEFAULT_RUNTIME_CONFIG.observability.flushIntervalMs),
    maxQueueSize: readNumber(observability?.maxQueueSize, DEFAULT_RUNTIME_CONFIG.observability.maxQueueSize),
    useBeacon: readBoolean(observability?.useBeacon, DEFAULT_RUNTIME_CONFIG.observability.useBeacon),
  };
};

export const getBusinessConfig = () => {
  const business = getConfigRoot().business;
  return {
    defaultTaxRate: readNumber(business?.defaultTaxRate, DEFAULT_RUNTIME_CONFIG.business.defaultTaxRate),
    maxQuantityPerProduct: readNumber(business?.maxQuantityPerProduct, DEFAULT_RUNTIME_CONFIG.business.maxQuantityPerProduct),
    defaultCurrency: readString(business?.defaultCurrency, DEFAULT_RUNTIME_CONFIG.business.defaultCurrency),
    defaultCountry: readString(business?.defaultCountry, DEFAULT_RUNTIME_CONFIG.business.defaultCountry),
    businessHours: readString(business?.businessHours, DEFAULT_RUNTIME_CONFIG.business.businessHours),
    returnPolicyDays: readString(business?.returnPolicyDays, DEFAULT_RUNTIME_CONFIG.business.returnPolicyDays),
    refundProcessingTime: readString(business?.refundProcessingTime, DEFAULT_RUNTIME_CONFIG.business.refundProcessingTime),
    productsPerPage: readNumber(business?.productsPerPage, DEFAULT_RUNTIME_CONFIG.business.productsPerPage),
    featuredProductsCount: readNumber(business?.featuredProductsCount, DEFAULT_RUNTIME_CONFIG.business.featuredProductsCount),
    heroSliderInterval: readNumber(business?.heroSliderInterval, DEFAULT_RUNTIME_CONFIG.business.heroSliderInterval),
    invoiceNote: readString(business?.invoiceNote, DEFAULT_RUNTIME_CONFIG.business.invoiceNote),
    freeShippingThreshold: readNumber(business?.freeShippingThreshold, DEFAULT_RUNTIME_CONFIG.business.freeShippingThreshold),
    locale: readString(business?.locale, DEFAULT_RUNTIME_CONFIG.business.locale),
  };
};

export const getBrandingConfig = () => {
  const branding = getConfigRoot().branding;
  const logo = readString(branding?.logo, DEFAULT_RUNTIME_CONFIG.branding.logo);
  const headerLogo = readString(branding?.headerLogo, logo);
  const footerLogo = readString(branding?.footerLogo, headerLogo);
  return {
    logo,
    headerLogo,
    footerLogo,
    logoDark: readString(branding?.logoDark, DEFAULT_RUNTIME_CONFIG.branding.logoDark),
    favicon: readString(branding?.favicon, DEFAULT_RUNTIME_CONFIG.branding.favicon),
    banner: readString(branding?.banner, DEFAULT_RUNTIME_CONFIG.branding.banner),
    ogImage: readString(branding?.ogImage, DEFAULT_RUNTIME_CONFIG.branding.ogImage),
  };
};

export const getThemeConfig = () => {
  const theme = getConfigRoot().theme;
  return {
    colorPrimary: readString(theme?.colorPrimary, DEFAULT_RUNTIME_CONFIG.theme.colorPrimary),
    colorPrimaryHover: readString(theme?.colorPrimaryHover, DEFAULT_RUNTIME_CONFIG.theme.colorPrimaryHover),
    colorPrimaryForeground: readString(theme?.colorPrimaryForeground, DEFAULT_RUNTIME_CONFIG.theme.colorPrimaryForeground),
    colorSecondary: readString(theme?.colorSecondary, DEFAULT_RUNTIME_CONFIG.theme.colorSecondary),
    colorSecondaryForeground: readString(theme?.colorSecondaryForeground, DEFAULT_RUNTIME_CONFIG.theme.colorSecondaryForeground),
    colorBackground: readString(theme?.colorBackground, DEFAULT_RUNTIME_CONFIG.theme.colorBackground),
    colorForeground: readString(theme?.colorForeground, DEFAULT_RUNTIME_CONFIG.theme.colorForeground),
    colorSurface: readString(theme?.colorSurface, DEFAULT_RUNTIME_CONFIG.theme.colorSurface),
    colorSurfaceForeground: readString(theme?.colorSurfaceForeground, DEFAULT_RUNTIME_CONFIG.theme.colorSurfaceForeground),
    colorMuted: readString(theme?.colorMuted, DEFAULT_RUNTIME_CONFIG.theme.colorMuted),
    colorMutedForeground: readString(theme?.colorMutedForeground, DEFAULT_RUNTIME_CONFIG.theme.colorMutedForeground),
    colorBorder: readString(theme?.colorBorder, DEFAULT_RUNTIME_CONFIG.theme.colorBorder),
    colorInput: readString(theme?.colorInput, DEFAULT_RUNTIME_CONFIG.theme.colorInput),
    colorRing: readString(theme?.colorRing, DEFAULT_RUNTIME_CONFIG.theme.colorRing),
    colorSuccess: readString(theme?.colorSuccess, DEFAULT_RUNTIME_CONFIG.theme.colorSuccess),
    colorWarning: readString(theme?.colorWarning, DEFAULT_RUNTIME_CONFIG.theme.colorWarning),
    colorError: readString(theme?.colorError, DEFAULT_RUNTIME_CONFIG.theme.colorError),
    colorAccent: readString(theme?.colorAccent, DEFAULT_RUNTIME_CONFIG.theme.colorAccent),
    colorAccentForeground: readString(theme?.colorAccentForeground, DEFAULT_RUNTIME_CONFIG.theme.colorAccentForeground),
    fontFamily: readString(theme?.fontFamily, DEFAULT_RUNTIME_CONFIG.theme.fontFamily),
    fontUrl: readString(theme?.fontUrl, DEFAULT_RUNTIME_CONFIG.theme.fontUrl),
  };
};

export const getSocialConfig = () => {
  const social = getConfigRoot().social;
  return {
    facebook: readString(social?.facebook, DEFAULT_RUNTIME_CONFIG.social.facebook),
    instagram: readString(social?.instagram, DEFAULT_RUNTIME_CONFIG.social.instagram),
    twitter: readString(social?.twitter, DEFAULT_RUNTIME_CONFIG.social.twitter),
    linkedin: readString(social?.linkedin, DEFAULT_RUNTIME_CONFIG.social.linkedin),
  };
};

export const getFeaturesConfig = () => {
  const features = getConfigRoot().features;
  return {
    notifications: readBoolean(features?.notifications, DEFAULT_RUNTIME_CONFIG.features.notifications),
    analytics: readBoolean(features?.analytics, DEFAULT_RUNTIME_CONFIG.features.analytics),
    realPayments: readBoolean(features?.realPayments, DEFAULT_RUNTIME_CONFIG.features.realPayments),
    benefits: normalizeFeatureBenefits(features?.benefits),
  };
};

export const getFiltersConfig = (): FilterConfig => {
  const filters = getConfigRoot().filters;
  return {
    enabled: readBoolean(filters?.enabled, DEFAULT_RUNTIME_CONFIG.filters.enabled),
    capacidad: readBoolean(filters?.capacidad, DEFAULT_RUNTIME_CONFIG.filters.capacidad),
    velocidad: readBoolean(filters?.velocidad, DEFAULT_RUNTIME_CONFIG.filters.velocidad),
    capacidadOptions: Array.isArray(filters?.capacidadOptions) ? filters.capacidadOptions : undefined,
    velocidadOptions: Array.isArray(filters?.velocidadOptions) ? filters.velocidadOptions : undefined,
  };
};

export const getImagesConfig = (): ImagesConfig => {
  const images = getConfigRoot().images;

  return {
    heroSlides: normalizeHeroSlides(images?.heroSlides),
    categories: normalizeCategories(images?.categories),
    placeholders: normalizeImageMap(images?.placeholders, DEFAULT_RUNTIME_CONFIG.images.placeholders),
    backgrounds: normalizeImageMap(images?.backgrounds, DEFAULT_RUNTIME_CONFIG.images.backgrounds),
    banners: normalizeImageMap(images?.banners, DEFAULT_RUNTIME_CONFIG.images.banners),
    productFallbacks: readStringMap(images?.productFallbacks, DEFAULT_RUNTIME_CONFIG.images.productFallbacks),
  };
};

export const getPaymentMethodsConfig = () => {
  const paymentMethods = getConfigRoot().paymentMethods;
  return {
    transferencia: readBoolean(paymentMethods?.transferencia, DEFAULT_RUNTIME_CONFIG.paymentMethods.transferencia),
    efectivo: readBoolean(paymentMethods?.efectivo, DEFAULT_RUNTIME_CONFIG.paymentMethods.efectivo),
    mercadopago: readBoolean(paymentMethods?.mercadopago, DEFAULT_RUNTIME_CONFIG.paymentMethods.mercadopago),
    tarjeta: readBoolean(paymentMethods?.tarjeta, DEFAULT_RUNTIME_CONFIG.paymentMethods.tarjeta),
  };
};

function resolveSlug(category: CategoryConfig): string {
  if (category.slug) return category.slug;
  const link = category.link || '';
  const categoryMatch = link.match(/[?&]category=([^&]+)/);
  if (categoryMatch?.[1]) return decodeURIComponent(categoryMatch[1]);
  return link.replace(/^\/categoria\//, '').replace(/\/.*$/, '');
}

function enrichCategoryRecursive(category: CategoryConfig, parentPath: string, parentGroup: string): CategoryConfig {
  const slug = resolveSlug(category);
  const path = `${parentPath}/${slug}`;
  return {
    ...category,
    slug,
    group: category.group || parentGroup,
    link: category.link || path,
    subcategories: category.subcategories?.map((sub) =>
      enrichCategoryRecursive(sub, path, category.group || parentGroup),
    ),
  };
}

function enrichCategory(category: CategoryConfig): CategoryConfig {
  return enrichCategoryRecursive(category, '/categoria', '');
}

export const getCategoriesConfig = (): CategoryConfig[] => {
  return getImagesConfig().categories.map(enrichCategory);
};

export const getCategoryBySlug = (...slugs: string[]): CategoryConfig | undefined => {
  let current: CategoryConfig | undefined;
  let list = getCategoriesConfig();
  for (const s of slugs) {
    if (!s) break;
    current = list.find((c) => c.slug === s);
    if (!current) return undefined;
    list = current.subcategories || [];
  }
  return current;
};

export const getRuntimeConfig = (): RuntimeConfig => {
  return {
    api: getApiConfig(),
    cdnBaseUrl: getCdnBaseUrl(),
    app: getAppConfig(),
    contact: getContactConfig(),
    legal: getLegalConfig(),
    business: getBusinessConfig(),
    branding: getBrandingConfig(),
    theme: getThemeConfig(),
    social: getSocialConfig(),
    features: getFeaturesConfig(),
    filters: getFiltersConfig(),
    paymentMethods: getPaymentMethodsConfig(),
    payment: getPaymentConfig(),
    observability: getObservabilityConfig(),
    images: getImagesConfig(),
  };
};

export const hasRuntimeConfig = (): boolean => {
  return typeof window !== 'undefined' && window.__APP_CONFIG__ !== undefined;
};

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
