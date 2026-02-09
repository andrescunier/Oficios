/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE_URL: string
  readonly VITE_ACCOUNT_ID: string
  readonly VITE_API_EXTRA_HEADERS: string
  
  // CDN Configuration
  readonly VITE_CDN_BASE_URL: string
  readonly VITE_CDN_HERO_SLIDE_1: string
  readonly VITE_CDN_HERO_SLIDE_2: string
  readonly VITE_CDN_HERO_SLIDE_3: string
  readonly VITE_CDN_LOGO: string
  
  // Branding & Company Info
  readonly VITE_APP_NAME: string
  readonly VITE_COMPANY_NAME: string
  readonly VITE_APP_SLOGAN: string
  readonly VITE_APP_URL: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_CONTACT_EMAIL: string
  readonly VITE_CONTACT_PHONE: string
  readonly VITE_CONTACT_ADDRESS: string
  
  // Logos & Images
  readonly VITE_LOGO_PATH: string
  readonly VITE_FAVICON_PATH: string
  readonly VITE_HEADER_LOGO_PATH: string
  readonly VITE_FOOTER_LOGO_PATH: string
  
  // Hero Slider Images
  readonly VITE_HERO_SLIDE_1: string
  readonly VITE_HERO_SLIDE_2: string
  readonly VITE_HERO_SLIDE_3: string
  readonly VITE_HERO_SLIDE_4: string
  readonly VITE_HERO_SLIDE_5: string
  
  // Hero Slider Texts
  readonly VITE_HERO_SLIDE_1_TITLE: string
  readonly VITE_HERO_SLIDE_1_SUBTITLE: string
  readonly VITE_HERO_SLIDE_1_CTA: string
  readonly VITE_HERO_SLIDE_2_TITLE: string
  readonly VITE_HERO_SLIDE_2_SUBTITLE: string
  readonly VITE_HERO_SLIDE_2_CTA: string
  readonly VITE_HERO_SLIDE_3_TITLE: string
  readonly VITE_HERO_SLIDE_3_SUBTITLE: string
  readonly VITE_HERO_SLIDE_3_CTA: string
  
  // Category Images
  readonly VITE_CATEGORY_COMPONENTES_IMG: string
  readonly VITE_CATEGORY_GAMING_IMG: string
  readonly VITE_CATEGORY_DDR4_IMG: string
  readonly VITE_CATEGORY_DDR5_IMG: string
  readonly VITE_CATEGORY_SSD_M2_IMG: string
  readonly VITE_CATEGORY_SSD_SATA_IMG: string
  
  // Banner & Promotional Images
  readonly VITE_BANNER_MAIN: string
  readonly VITE_BANNER_SECONDARY: string
  readonly VITE_BANNER_SEASONAL: string
  readonly VITE_BANNER_SALE: string
  
  // Background Images
  readonly VITE_BG_HERO: string
  readonly VITE_BG_FEATURES: string
  readonly VITE_BG_TESTIMONIALS: string
  
  // Placeholder Images
  readonly VITE_PLACEHOLDER_PRODUCT: string
  readonly VITE_PLACEHOLDER_CATEGORY: string
  readonly VITE_PLACEHOLDER_USER: string
  
  // Social Media
  readonly VITE_FACEBOOK_URL: string
  readonly VITE_INSTAGRAM_URL: string
  readonly VITE_TWITTER_URL: string
  readonly VITE_LINKEDIN_URL: string
  
  // App Configuration
  readonly VITE_APP_ENV: string
  readonly VITE_APP_VERSION: string
  
  // Feature Flags
  readonly VITE_ENABLE_NOTIFICATIONS: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_REAL_PAYMENTS: string
  
  // DIAP B2B Specific Features
  readonly VITE_HIDE_PRICES_FOR_GUESTS: string
  readonly VITE_LOGIN_TO_VIEW_PRICES_MESSAGE: string
  readonly VITE_LOGIN_FOR_PRICES_CTA: string
  readonly VITE_REQUIRE_AUTH_FOR_CART: string
  
  // Colors & Theming
  readonly VITE_PRIMARY_COLOR: string
  readonly VITE_SECONDARY_COLOR: string
  readonly VITE_ACCENT_COLOR: string
  
  // Shipping & Benefits Features
  readonly VITE_FEATURE_FREE_SHIPPING_TITLE: string
  readonly VITE_FEATURE_FREE_SHIPPING_DESC: string
  readonly VITE_FEATURE_FREE_RETURNS_TITLE: string
  readonly VITE_FEATURE_FREE_RETURNS_DESC: string
  readonly VITE_FEATURE_SECURE_PURCHASE_TITLE: string
  readonly VITE_FEATURE_SECURE_PURCHASE_DESC: string
  readonly VITE_FEATURE_MULTIPLE_PAYMENTS_TITLE: string
  readonly VITE_FEATURE_MULTIPLE_PAYMENTS_DESC: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}