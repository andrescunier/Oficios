/**
 * Fachada de configuración para el resto de la app.
 * Mantiene la API pública existente, pero ya no depende de variables
 * de entorno legacy fuera del bootstrap de la API.
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
  getNewsletterConfig,
  getShippingConfig,
  getImagesConfig,
} from './runtime';
import { getActiveAccountId } from '@/config/api';

export const API_CONFIG = {
  get BASE_URL() { return getApiConfig().url; },
  get ACCOUNT_ID() { return getApiConfig().accountId; },
  get ACCOUNT_SLUG() { return getApiConfig().accountSlug; },
  TIMEOUT: 30000,
  get EXTRA_HEADERS() { return getApiConfig().extraHeaders; },
};

export const BRANDING = {
  get APP_NAME() { return getAppConfig().name; },
  get COMPANY_NAME() { return getAppConfig().companyName; },
  get APP_SLOGAN() { return getAppConfig().slogan; },
  get APP_URL() { return getAppConfig().url; },
  get APP_DESCRIPTION() { return getAppConfig().description; },
  get CONTACT_EMAIL() { return getContactConfig().email; },
  get CONTACT_PHONE() { return getContactConfig().phone; },
  get CONTACT_ADDRESS() { return getContactConfig().address; },
};

export const ASSETS = {
  get LOGO_PATH() { return getRuntimeBranding().logo; },
  get FAVICON_PATH() { return getRuntimeBranding().favicon; },
  get HEADER_LOGO_PATH() { return getRuntimeBranding().headerLogo; },
  get FOOTER_LOGO_PATH() { return getRuntimeBranding().footerLogo; },
  get LOGO_DARK_PATH() { return getRuntimeBranding().logoDark; },
  get HERO_SLIDES() { return getImagesConfig().heroSlides; },
  get CATEGORIES() { return getImagesConfig().productFallbacks; },
  get BANNERS() {
    const images = getImagesConfig();
    return {
      MAIN: images.banners.main,
      SECONDARY: images.banners.secondary,
      SEASONAL: images.banners.seasonal,
      SALE: images.banners.sale,
    };
  },
  get BACKGROUNDS() {
    const images = getImagesConfig();
    return {
      HERO: images.backgrounds.hero,
      FEATURES: images.backgrounds.features,
      TESTIMONIALS: images.backgrounds.testimonials,
    };
  },
  get PLACEHOLDERS() {
    const images = getImagesConfig();
    return {
      PRODUCT: images.placeholders.product,
      CATEGORY: images.placeholders.category,
      USER: images.placeholders.user,
    };
  },
  getAssetUrl: (path: string) => {
    if (path.startsWith('http')) return path;
    return `${BRANDING.APP_URL}${path.startsWith('/') ? path : `/${path}`}`;
  },
};

export const SOCIAL_LINKS = {
  get FACEBOOK() { return getSocialConfig().facebook; },
  get INSTAGRAM() { return getSocialConfig().instagram; },
  get TWITTER() { return getSocialConfig().twitter; },
  get LINKEDIN() { return getSocialConfig().linkedin; },
};

export const isSocialLinkConfigured = (platform: keyof typeof SOCIAL_LINKS): boolean => {
  return Boolean(SOCIAL_LINKS[platform]);
};

export const CONTACT = {
  get EMAIL() { return getContactConfig().email; },
  get SALES_EMAIL() { return getContactConfig().salesEmail; },
  get PHONE() { return getContactConfig().phone; },
  get WHATSAPP() { return getContactConfig().whatsapp; },
  get ADDRESS() { return getContactConfig().address; },
  get WHATSAPP_LINK() {
    const whatsapp = getContactConfig().whatsapp;
    return whatsapp ? `https://wa.me/${whatsapp}` : '';
  },
};

export const LEGAL = {
  get COMPANY_NAME() { return getLegalConfig().companyName; },
  get CUIT() { return getLegalConfig().cuit; },
  get ADDRESS() { return getLegalConfig().address; },
  get JURISDICTION() { return getLegalConfig().jurisdiction; },
};

export const PAYMENT_INFO = {
  get BANK_NAME() { return getPaymentConfig().bankName; },
  get ACCOUNT_HOLDER() { return getPaymentConfig().accountHolder; },
  get CBU() { return getPaymentConfig().cbu; },
  get ALIAS() { return getPaymentConfig().alias; },
  get WA_VERIFICATION() { return getPaymentConfig().whatsappVerification; },
};

export const BUSINESS = {
  get DEFAULT_TAX_RATE() { return getBusinessConfig().defaultTaxRate; },
  get MAX_QUANTITY_PER_PRODUCT() { return getBusinessConfig().maxQuantityPerProduct; },
  get DEFAULT_CURRENCY() { return getBusinessConfig().defaultCurrency; },
  get DEFAULT_COUNTRY() { return getBusinessConfig().defaultCountry; },
  get BUSINESS_HOURS() { return getBusinessConfig().businessHours; },
  get RETURN_POLICY_DAYS() { return getBusinessConfig().returnPolicyDays; },
  get REFUND_PROCESSING_TIME() { return getBusinessConfig().refundProcessingTime; },
  get PRODUCTS_PER_PAGE() { return getBusinessConfig().productsPerPage; },
  get FEATURED_PRODUCTS_COUNT() { return getBusinessConfig().featuredProductsCount; },
  get HERO_SLIDER_INTERVAL() { return getBusinessConfig().heroSliderInterval; },
  get INVOICE_NOTE() { return getBusinessConfig().invoiceNote; },
  get FREE_SHIPPING_THRESHOLD() { return getBusinessConfig().freeShippingThreshold; },
  get LOCALE() { return getBusinessConfig().locale; },
};

export const APP_CONFIG = {
  ENV: import.meta.env.DEV ? 'development' : 'production',
  VERSION: __APP_VERSION__,
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  API_LOGGING: false,
} as const;

export const FEATURES = {
  get NOTIFICATIONS() { return getFeaturesConfig().notifications; },
  get ANALYTICS() { return getFeaturesConfig().analytics; },
  get REAL_PAYMENTS() { return getFeaturesConfig().realPayments; },
  get HIDE_PRICES_FOR_GUESTS() { return getAppConfig().hidePricesForGuests; },
  get LOGIN_TO_VIEW_PRICES_MESSAGE() { return getAppConfig().loginMessage; },
  get LOGIN_FOR_PRICES_CTA() { return getAppConfig().loginCta; },
  get REQUIRE_AUTH_FOR_CART() { return getAppConfig().requireAuthForCart; },
  get SHIPPING_BENEFITS() { return getFeaturesConfig().benefits; },
};

export const SHIPPING = {
  get ENABLED() { return getShippingConfig().enabled; },
  get MODE() { return getShippingConfig().mode; },
  get BANNER_TEXT() { return getShippingConfig().bannerText; },
  get LABEL() { return getShippingConfig().label; },
  get FREE_LABEL() { return getShippingConfig().freeLabel; },
  get PENDING_LABEL() { return getShippingConfig().pendingLabel; },
  get DRAWER_MESSAGE() { return getShippingConfig().drawerMessage; },
  get CHARGED_MESSAGE() { return getShippingConfig().chargedMessage; },
  get PRODUCT_BADGE_TITLE() { return getShippingConfig().productBadgeTitle; },
  get PRODUCT_BADGE_DESCRIPTION() { return getShippingConfig().productBadgeDescription; },
};

export const NEWSLETTER = {
  get ENABLED() { return getNewsletterConfig().enabled; },
  get ENDPOINT() { return getNewsletterConfig().endpoint; },
  get TITLE() { return getNewsletterConfig().title; },
  get DESCRIPTION() { return getNewsletterConfig().description; },
  get PLACEHOLDER() { return getNewsletterConfig().placeholder; },
  get BUTTON_LABEL() { return getNewsletterConfig().buttonLabel; },
  get SUCCESS_MESSAGE() { return getNewsletterConfig().successMessage; },
  get ERROR_MESSAGE() { return getNewsletterConfig().errorMessage; },
};

export const THEME = {
  get PRIMARY_COLOR() { return getThemeConfig().colorPrimary; },
  get SECONDARY_COLOR() { return getThemeConfig().colorSecondary; },
  get ACCENT_COLOR() { return getThemeConfig().colorAccent; },
  applyCSSVariables: () => {},
};

export const SEO_METADATA = {
  title: `${BRANDING.APP_NAME} - ${BRANDING.APP_SLOGAN}`,
  description: `${BRANDING.COMPANY_NAME} - ${BRANDING.APP_SLOGAN}. Productos de tecnología con la mejor calidad y precios.`,
  keywords: 'tecnología, ecommerce, productos, electrónicos, componentes',
  author: BRANDING.COMPANY_NAME,
  url: BRANDING.APP_URL,
  image: ASSETS.getAssetUrl(ASSETS.LOGO_PATH),
} as const;

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

export const getBrandingConfig = () => ({
  name: BRANDING.APP_NAME,
  fullName: BRANDING.COMPANY_NAME,
  slogan: BRANDING.APP_SLOGAN,
  logo: ASSETS.LOGO_PATH,
  headerLogo: ASSETS.HEADER_LOGO_PATH,
  footerLogo: ASSETS.FOOTER_LOGO_PATH,
  favicon: ASSETS.FAVICON_PATH,
  ogImage: getRuntimeBranding().ogImage,
  contact: {
    email: BRANDING.CONTACT_EMAIL,
    phone: BRANDING.CONTACT_PHONE,
  },
  social: SOCIAL_LINKS,
});

export const getAPIHeaders = () => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  ...getApiConfig().extraHeaders,
  'X-Account-ID': getActiveAccountId(),
});

export const validateEnvironment = () => {
  const apiConfig = getApiConfig();
  return Boolean(apiConfig.url && apiConfig.accountId);
};

export const initializeApp = () => {
  if (!validateEnvironment()) {
    throw new Error('Configuración de entorno inválida: falta API base URL o account ID para bootstrap');
  }

  THEME.applyCSSVariables();
};
