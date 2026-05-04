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

export interface RegistrationFieldConfig {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  visible?: boolean;
  type?: string;
}

export interface FeatureBenefitConfig {
  icon: string;
  title: string;
  description: string;
}

export interface ShippingConfig {
  enabled: boolean;
  mode: 'free' | 'flat_rate';
  bannerText: string;
  label: string;
  freeLabel: string;
  pendingLabel: string;
  drawerMessage: string;
  chargedMessage: string;
  productBadgeTitle: string;
  productBadgeDescription: string;
  chargeAmount: number;
  chargeProductId: string;
  chargeProductSku: string;
  chargeProductDescription: string;
  taxRate: number;
}

export interface NewsletterConfig {
  enabled: boolean;
  endpoint: string;
  headers: Record<string, string>;
  title: string;
  description: string;
  placeholder: string;
  buttonLabel: string;
  successMessage: string;
  errorMessage: string;
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

export interface ValidationConfig {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumber: boolean;
  passwordRequireSymbol: boolean;
  emailRegex: string;
  phoneRegex: string;
  zipRegex: string;
  messages: {
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordMinLength: string;
    passwordUppercase: string;
    passwordLowercase: string;
    passwordNumber: string;
    passwordSymbol: string;
    passwordsDontMatch: string;
    fieldRequired: string;
    acceptTermsRequired: string;
    phoneInvalid: string;
    zipInvalid: string;
    sessionCleanedTitle: string;
    sessionCleanedMessage: string;
    loginGreeting: string;
    registerSuccessMessage: string;
    loginGenericError: string;
    registerGenericError: string;
    checkoutAuthRequiredMessage: string;
    checkoutFieldRequiredTitle: string;
    checkoutFieldRequiredTemplate: string;
  };
}

export interface SeoMeta {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  canonical?: string;
  noindex?: boolean;
}

export interface SeoConfig {
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultKeywords: string;
  defaultOgImage: string;
  twitterHandle: string;
  organization: {
    name: string;
    url: string;
    logo: string;
    sameAs: string[];
  };
  routes: Record<string, SeoMeta>;
  enableJsonLd: boolean;
  enableProductJsonLd: boolean;
}

export interface PageBlock {
  type?: string;
  variant?: string;
  icon?: string;
  iconColor?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  html?: string;
  items?: any[];
  href?: string;
  label?: string;
  image?: string;
}

export interface PageContent {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  heroVariant?: string;
  heroImage?: string;
  blocks?: PageBlock[];
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
  lastUpdated?: string;
}

export interface PagesConfig {
  about?: PageContent;
  contact?: PageContent;
  cookies?: PageContent;
  terms?: PageContent;
  privacy?: PageContent;
  returns?: PageContent;
  warranty?: PageContent;
  legalNotice?: PageContent;
  tracking?: PageContent;
  notFound?: PageContent;
}

export interface AnalyticsConfig {
  enabled: boolean;
  ga4MeasurementId: string;
  gtmContainerId: string;
  facebookPixelId: string;
  hotjarId: string;
  clarityId: string;
  anonymizeIp: boolean;
  trackPageViews: boolean;
  trackEcommerce: boolean;
}

export interface ConsentConfig {
  enabled: boolean;
  title: string;
  body: string;
  acceptLabel: string;
  rejectLabel: string;
  preferencesLabel: string;
  learnMoreLabel: string;
  learnMoreHref: string;
  storageKey: string;
  blockAnalyticsUntilConsent: boolean;
}

export interface HeaderMenuItem {
  label?: string;
  href?: string;
  external?: boolean;
  icon?: string;
  children?: HeaderMenuItem[];
}

export interface HeaderConfig {
  showSearch: boolean;
  showCategoriesMenu: boolean;
  showFavorites: boolean;
  showOrders: boolean;
  showAccount: boolean;
  showCart: boolean;
  topBarMessage: string;
  topBarHref: string;
  menu: HeaderMenuItem[];
}

export interface FooterLinkItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSectionConfig {
  id: string;
  title: string;
  links: FooterLinkItem[];
  fromCategories?: boolean;
}

export interface FooterConfig {
  sections: FooterSectionConfig[];
  showWhatsappCapture: boolean;
  whatsappOptInMessage: string;
  whatsappOptInSuccessMessage: string;
  withdrawalWhatsappMessage: string;
  paymentMethods: string[];
  showSocial: boolean;
  showPaymentBadges: boolean;
}

export interface CheckoutFieldConfig {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  visible?: boolean;
  type?: string;
  step?: 'shipping' | 'payment' | 'review';
  group?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  options?: Array<{ value: string; label: string }>;
}

export interface CheckoutConfig {
  steps: Array<'shipping' | 'payment' | 'review'>;
  guestCheckoutEnabled: boolean;
  fields: CheckoutFieldConfig[];
  showOrderNotes: boolean;
  orderNotesLabel: string;
  orderNotesPlaceholder: string;
  showCouponInput: boolean;
  couponPlaceholder: string;
  couponApplyLabel: string;
}

export interface WishlistConfig {
  enabled: boolean;
  storageKey: string;
  requireAuth: boolean;
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
  shipping: ShippingConfig;
  newsletter: NewsletterConfig;
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
  registration: {
    title: string;
    subtitle: string;
    submitLabel: string;
    successMessage: string;
    acceptTermsLabel: string;
    alreadyHaveAccountText: string;
    alreadyHaveAccountLinkText: string;
    fields: RegistrationFieldConfig[];
  };
  observability: ObservabilityConfig;
  validation: ValidationConfig;
  seo: SeoConfig;
  pages: PagesConfig;
  analytics: AnalyticsConfig;
  consent: ConsentConfig;
  header: HeaderConfig;
  footer: FooterConfig;
  checkout: CheckoutConfig;
  wishlist: WishlistConfig;
  images: ImagesConfig;
  ui: {
    // Search & product listing
    searchPlaceholder: string;
    noProductsTitle: string;
    noProductsMessage: string;
    alreadyHaveAccountText: string;

    // Home page sections
    homeCategoriesTitle: string;
    homeCategoriesSubtitle: string;
    showHomeCategoriesHeader?: boolean;
    /** Cantidad de categorías visibles por vez en desktop. Default 3. */
    homeCategoriesPerView?: number;
    /** Padding lateral del slider de categorías en píxeles. Default 0 (full width). */
    homeCategoriesSidePadding?: number;
    /** Mostrar la barra de beneficios (Envíos / Cuotas / Contacto / etc.) en la home. Default true. */
    showHomeBenefits?: boolean;
    homeFeaturedTitle: string;
    homeFeaturedSubtitle: string;
    homeNewTitle: string;
    homeNewSubtitle: string;
    homeSaleTitle: string;
    homeSaleSubtitle: string;
    homeViewAllLabel: string;

    // Header navigation
    headerCategoriesLabel: string;
    headerAllProductsLabel: string;
    headerLoginLabel: string;
    headerRegisterLabel: string;
    headerMyProfileLabel: string;
    headerMyOrdersLabel: string;
    headerFavoritesLabel: string;
    headerLogoutLabel: string;

    // Footer
    footerWhatsappTitle: string;
    footerWhatsappBody: string;
    footerWhatsappPlaceholder: string;
    footerWhatsappButton: string;
    footerCopyrightSuffix: string;
    footerPaymentMethodsLabel: string;

    // Cart drawer
    cartTitle: string;
    cartEmptyTitle: string;
    cartEmptyBody: string;
    cartEmptyExploreLabel: string;
    cartProceedAuthLabel: string;
    cartProceedGuestLabel: string;
    cartClearLabel: string;

    // Auth gates (shared across protected pages)
    authRequiredTitle: string;
    authLoginButtonLabel: string;
    authRegisterButtonLabel: string;

    // Login page
    loginTitle: string;
    loginSubtitle: string;
    loginEmailLabel: string;
    loginEmailPlaceholder: string;
    loginPasswordLabel: string;
    loginPasswordPlaceholder: string;
    loginForgotPasswordLabel: string;
    loginForgotPasswordMessage: string;
    loginSubmitLabel: string;
    loginLoadingLabel: string;
    loginNoAccountText: string;
    loginNoAccountLinkText: string;
    loginClearSessionLabel: string;
    loginSuccessTitle: string;
    loginErrorTitle: string;
    loginSessionExpiredMessage: string;

    // Register page
    registerLoadingLabel: string;
    registerSuccessTitle: string;
    registerErrorTitle: string;
    passwordValidationLength: string;
    passwordValidationUppercase: string;
    passwordValidationLowercase: string;
    passwordValidationNumber: string;

    // Product detail page
    productNotFoundTitle: string;
    productNotFoundBody: string;
    productViewAllLabel: string;
    productBackLabel: string;
    productBreadcrumbHome: string;
    productBreadcrumbProducts: string;
    productDescriptionLabel: string;
    productVariantLabel: string;
    productNoVariantMessage: string;
    productAvailabilityLabel: string;
    productOutOfStockLabel: string;
    productAddToCartLabel: string;
    productSelectVariantLabel: string;
    productBuySecureTitle: string;
    productBuySecureDesc: string;
    productBuySecureIcon: string;
    productShippingBadgeIcon: string;
    productMultiplePaymentsTitle: string;
    productMultiplePaymentsDesc: string;
    productMultiplePaymentsIcon: string;
    headerPromoMessages: string[];

    // Cart page (full page, not drawer)
    cartPageTitle: string;
    cartPageContinueShopping: string;
    cartPageItemsLabel: string;
    cartPageClearCartLabel: string;
    cartPageProductSingular: string;
    cartPageProductPlural: string;
    cartPageSubtotalLabel: string;
    cartPageShippingLabel: string;
    cartPageTotalLabel: string;
    cartPageCheckoutLabel: string;
    cartPageSSLBadge: string;
    cartPageSSLDesc: string;
    cartPageShippingBadge: string;
    cartPageShippingDesc: string;

    // Checkout page
    checkoutTitle: string;
    checkoutBackLabel: string;
    checkoutStepShipping: string;
    checkoutStepPayment: string;
    checkoutStepReview: string;
    checkoutShippingTitle: string;
    checkoutPaymentTitle: string;
    checkoutReviewTitle: string;
    checkoutAddressTitle: string;
    checkoutAccountDataTitle: string;
    checkoutFieldFirst: string;
    checkoutFieldLast: string;
    checkoutFieldEmail: string;
    checkoutFieldPhone: string;
    checkoutFieldAddress: string;
    checkoutFieldCity: string;
    checkoutFieldState: string;
    checkoutFieldZip: string;
    checkoutContinueToPayment: string;
    checkoutPaymentMethodLabel: string;
    checkoutTransferLabel: string;
    checkoutTransferDesc: string;
    checkoutTransferInfoTitle: string;
    checkoutEfectivoLabel: string;
    checkoutEfectivoDesc: string;
    checkoutEfectivoInfoTitle: string;
    checkoutFinalizeLabel: string;
    checkoutFinalizingLabel: string;
    checkoutBackButton: string;
    checkoutCartEmptyTitle: string;
    checkoutCartEmptyMsg: string;
    checkoutViewProductsLabel: string;
    checkoutSubtotalLabel: string;
    checkoutShippingLabel: string;
    checkoutTotalLabel: string;
    checkoutOrderTitle: string;
    checkoutBankLabel: string;
    checkoutHolderLabel: string;
    checkoutCbuLabel: string;
    checkoutAliasLabel: string;
    checkoutTransferImportantNote: string;
    checkoutEfectivoNote: string;

    // Footer sections
    footerCompanyTitle: string;
    footerCustomerServiceTitle: string;
    footerCategoriesTitle: string;
    footerLegalTitle: string;
    footerCompanyAboutLabel: string;
    footerCustomerHelpLabel: string;
    footerCustomerTrackingLabel: string;
    footerCustomerReturnsLabel: string;
    footerCustomerWarrantyLabel: string;
    footerLegalTermsLabel: string;
    footerLegalPrivacyLabel: string;
    footerLegalCookiesLabel: string;
    footerLegalNoticeLabel: string;
    footerLegalWithdrawalLabel: string;

    // Registration success page
    registrationSuccessTitle: string;
    registrationSuccessSubtitle: string;
    registrationSuccessReadyTitle: string;
    registrationSuccessBullet1: string;
    registrationSuccessBullet2: string;
    registrationSuccessBullet3: string;
    registrationSuccessBullet4: string;
    registrationSuccessViewProductsLabel: string;
    registrationSuccessHomeLabel: string;

    // Order success page
    orderSuccessTitle: string;
    orderSuccessSubtitle: string;
    orderSuccessOrderNumberLabel: string;
    orderSuccessPaymentMethodLabel: string;
    orderSuccessPaymentPendingLabel: string;
    orderSuccessEmailLabel: string;
    orderSuccessTotalLabel: string;
    orderSuccessNextTitle: string;
    orderSuccessNextBullet1: string;
    orderSuccessNextBullet2: string;
    orderSuccessNextBullet3: string;
    orderSuccessViewOrdersLabel: string;
    orderSuccessContinueLabel: string;
    orderSuccessBackHomeLabel: string;

    // Payment method labels (shared)
    paymentMethodCash: string;
    paymentMethodTransfer: string;
    paymentMethodCreditCard: string;
    paymentMethodDebitCard: string;
    paymentMethodMercadopago: string;
    paymentMethodCard: string;
    paymentMethodCheck: string;
    paymentMethodOther: string;
    paymentMethodPending: string;

    // Order status labels (shared)
    orderStatusDraft: string;
    orderStatusPendingPayment: string;
    orderStatusPaymentReview: string;
    orderStatusConfirmed: string;
    orderStatusPreparing: string;
    orderStatusReadyToShip: string;
    orderStatusShipped: string;
    orderStatusInTransit: string;
    orderStatusOutForDelivery: string;
    orderStatusDelivered: string;
    orderStatusCompleted: string;
    orderStatusCancelled: string;
    orderStatusReturnRequested: string;
    orderStatusReturnInTransit: string;
    orderStatusReturned: string;
    orderStatusRefunded: string;

    // Payment review status labels
    paymentReviewPendingSubmit: string;
    paymentReviewPendingValidation: string;
    paymentReviewInReview: string;
    paymentReviewValidated: string;
    paymentReviewCancelled: string;
    paymentReviewInReturn: string;
    paymentReviewReturned: string;
    paymentReviewRefunded: string;

    // Orders page
    ordersPageTitle: string;
    ordersAuthMessage: string;
    ordersBackToProfileLabel: string;
    ordersSearchPlaceholder: string;
    ordersFilterAllLabel: string;
    ordersFilterPendingLabel: string;
    ordersFilterProcessingLabel: string;
    ordersFilterShippedLabel: string;
    ordersFilterDeliveredLabel: string;
    ordersFilterCancelledLabel: string;
    ordersFilterReturnedLabel: string;
    ordersLoadingMessage: string;
    ordersEmptyTitle: string;
    ordersEmptyBody: string;
    ordersEmptyFilterTitle: string;
    ordersEmptyFilterBody: string;
    ordersEmptyExploreLabel: string;
    ordersViewDetailLabel: string;
    ordersCancelLabel: string;
    ordersCancellingLabel: string;
    ordersTrackingLabel: string;
    ordersPaymentInformedLabel: string;
    ordersPaymentInfoBody: string;
    ordersItemsCountLabel: string;
    ordersDetailTitle: string;
    ordersDetailStatusLabel: string;
    ordersDetailDateLabel: string;
    ordersDetailTotalLabel: string;
    ordersDetailChannelLabel: string;
    ordersDetailNoChannelLabel: string;
    ordersDetailNotesLabel: string;
    ordersDetailProductsLabel: string;
    ordersDetailQuantityLabel: string;
    ordersDetailEachLabel: string;
    ordersDetailPaymentStatusLabel: string;
    ordersDetailStatusHistoryLabel: string;
    ordersDetailNoHistoryMessage: string;
    ordersDetailStorefrontNote: string;

    // Profile page
    profilePageTitle: string;
    profileBackLabel: string;
    profileEditLabel: string;
    profileSaveLabel: string;
    profileSavingLabel: string;
    profileCancelLabel: string;
    profilePersonalInfoTitle: string;
    profileFirstNameLabel: string;
    profileLastNameLabel: string;
    profileEmailLabel: string;
    profilePhoneLabel: string;
    profileEmailReadOnly: string;
    profileNotSpecified: string;
    profileAccountInfoTitle: string;
    profileUsernameLabel: string;
    profileStatusLabel: string;
    profileStatusActive: string;
    profileMemberSinceLabel: string;
    profileActionsTitle: string;
    profileViewOrdersLabel: string;
    profileFavoritesLabel: string;
    profileLogoutLabel: string;
    profileAuthMessage: string;

    // Favorites page
    favoritesPageTitle: string;
    favoritesBackLabel: string;
    favoritesAuthMessage: string;
    favoritesAddAllLabel: string;
    favoritesLoadingMessage: string;
    favoritesEmptyTitle: string;
    favoritesEmptyBody: string;
    favoritesEmptyExploreLabel: string;
    favoritesSearchPlaceholder: string;
    favoritesNoResultsBody: string;
    favoritesVariantsLabel: string;
    favoritesCountSingular: string;
    favoritesCountPlural: string;

    // Order tracking page
    trackingPageTitle: string;
    trackingBackLabel: string;
    trackingSubtitle: string;
    trackingWhatsappTitle: string;
    trackingWhatsappBody: string;
    trackingWhatsappLabel: string;
    trackingHowTitle: string;
    trackingStep1Title: string;
    trackingStep1Body: string;
    trackingStep2Title: string;
    trackingStep2Body: string;
    trackingStep3Title: string;
    trackingStep3Body: string;
    trackingStatusSectionTitle: string;
    trackingStatus1Label: string;
    trackingStatus1Desc: string;
    trackingStatus2Label: string;
    trackingStatus2Desc: string;
    trackingStatus3Label: string;
    trackingStatus3Desc: string;
    trackingStatus4Label: string;
    trackingStatus4Desc: string;
    trackingFaqTitle: string;
    trackingFaq1Question: string;
    trackingFaq1Answer: string;
    trackingFaq2Question: string;
    trackingFaq2Answer: string;
    trackingFaq3Question: string;
    trackingFaq3Answer: string;
    trackingFaq4Question: string;
    trackingFaq4Answer: string;
    trackingHelpTitle: string;
    trackingHelpBody: string;
    trackingHelpCtaLabel: string;

    // Contact page
    contactPageTitle: string;
    contactBackLabel: string;
    contactSubtitle: string;
    contactOfficialChannelTitle: string;
    contactOfficialChannelBody: string;
    contactWhatsappLabel: string;
    contactHowHelpTitle: string;
    contactProductsTitle: string;
    contactProductsBody: string;
    contactProductsLabel: string;
    contactTrackingTitle: string;
    contactTrackingBody: string;
    contactTrackingLabel: string;
    contactB2bTitle: string;
    contactB2bBody: string;
    contactB2bLabel: string;
    contactSupportTitle: string;
    contactSupportBody: string;
    contactSupportLabel: string;
    contactReturnsTitle: string;
    contactReturnsBody: string;
    contactReturnsLabel: string;

    // Cart drawer
    cartDrawerEmptyDescription: string;
    cartDrawerCountSuffix: string;
    cartItemRemovedTitle: string;
    cartItemRemovedMessage: string;
    cartClearedTitle: string;
    cartClearedMessage: string;
    cartDrawerSubtotalLabel: string;
    cartDrawerTotalLabel: string;

    // Product card notifications
    productOutOfStockNotifTitle: string;
    productOutOfStockNotifMessage: string;
    productAddedToFavoritesTitle: string;
    productAddedToFavoritesMessage: string;
    productRemovedFromFavoritesTitle: string;
    productRemovedFromFavoritesMessage: string;
    productLoginForFavoritesTitle: string;
    productLoginForFavoritesMessage: string;

    // Product detail notifications
    productVariantRequiredTitle: string;
    productVariantRequiredMessage: string;
    productVariantOutOfStockMessage: string;
    productSubtotalLabel: string;
    productWithVariantsLabel: string;
    productAvailableUnitsLabel: string;
  };
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
    benefits: [],
  },
  shipping: {
    enabled: true,
    mode: 'free',
    bannerText: 'Envio gratis en todas tus compras',
    label: 'Envio',
    freeLabel: 'Gratis',
    pendingLabel: 'A calcular',
    drawerMessage: 'Envio gratis en todas tus compras',
    chargedMessage: 'El costo de envio se suma al finalizar la compra',
    productBadgeTitle: 'Envio Gratis',
    productBadgeDescription: 'En compras superiores al minimo',
    chargeAmount: 0,
    chargeProductId: '',
    chargeProductSku: '',
    chargeProductDescription: 'Cargo de envio',
    taxRate: 0,
  },
  newsletter: {
    enabled: true,
    endpoint: '',
    headers: {},
    title: 'No te pierdas nuestras ofertas',
    description: 'Suscribite a nuestro newsletter y recibi descuentos exclusivos',
    placeholder: 'Tu email',
    buttonLabel: 'Suscribirse',
    successMessage: 'Gracias por suscribirte.',
    errorMessage: 'No pudimos registrar tu suscripcion. Intenta nuevamente.',
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
  validation: {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumber: true,
    passwordRequireSymbol: false,
    emailRegex: '',
    phoneRegex: '',
    zipRegex: '',
    messages: {
      emailRequired: 'El email es requerido',
      emailInvalid: 'Formato de email inválido',
      passwordRequired: 'La contraseña es requerida',
      passwordMinLength: 'La contraseña debe tener al menos {min} caracteres',
      passwordUppercase: 'Debe incluir al menos una mayúscula',
      passwordLowercase: 'Debe incluir al menos una minúscula',
      passwordNumber: 'Debe incluir al menos un número',
      passwordSymbol: 'Debe incluir al menos un símbolo',
      passwordsDontMatch: 'Las contraseñas no coinciden',
      fieldRequired: '{field} es requerido',
      acceptTermsRequired: 'Debes aceptar los términos y condiciones',
      phoneInvalid: 'Formato de teléfono inválido',
      zipInvalid: 'Código postal inválido',
      sessionCleanedTitle: 'Sesión limpiada',
      sessionCleanedMessage: 'Todos los datos han sido eliminados correctamente',
      loginGreeting: 'Hola {name}!',
      registerSuccessMessage: 'Usuario registrado correctamente.',
      loginGenericError: 'Error al iniciar sesión',
      registerGenericError: 'Error al crear cuenta',
      checkoutAuthRequiredMessage: 'Necesitas iniciar sesión para realizar una compra',
      checkoutFieldRequiredTitle: 'Campo requerido',
      checkoutFieldRequiredTemplate: 'Por favor completa el campo {field}',
    },
  },
  seo: {
    defaultTitle: '',
    titleTemplate: '%s',
    defaultDescription: '',
    defaultKeywords: '',
    defaultOgImage: '',
    twitterHandle: '',
    organization: { name: '', url: '', logo: '', sameAs: [] },
    routes: {},
    enableJsonLd: true,
    enableProductJsonLd: true,
  },
  pages: {},
  analytics: {
    enabled: false,
    ga4MeasurementId: '',
    gtmContainerId: '',
    facebookPixelId: '',
    hotjarId: '',
    clarityId: '',
    anonymizeIp: true,
    trackPageViews: true,
    trackEcommerce: true,
  },
  consent: {
    enabled: false,
    title: 'Usamos cookies para mejorar tu experiencia',
    body: 'Utilizamos cookies propias y de terceros para personalizar contenido, analizar tráfico y mejorar nuestros servicios. Podés aceptar todas o configurar tus preferencias.',
    acceptLabel: 'Aceptar todas',
    rejectLabel: 'Rechazar',
    preferencesLabel: 'Preferencias',
    learnMoreLabel: 'Más información',
    learnMoreHref: '/cookies',
    storageKey: 'cookie_consent_v1',
    blockAnalyticsUntilConsent: true,
  },
  header: {
    showSearch: true,
    showCategoriesMenu: true,
    showFavorites: true,
    showOrders: true,
    showAccount: true,
    showCart: true,
    topBarMessage: '',
    topBarHref: '',
    menu: [],
  },
  footer: {
    sections: [],
    showWhatsappCapture: true,
    whatsappOptInMessage: 'Hola! Quiero recibir notificaciones de ofertas y novedades.',
    whatsappOptInSuccessMessage: '¡Listo! Te abrimos WhatsApp para confirmar la suscripción.',
    withdrawalWhatsappMessage: 'Me arrepiento de mi compra y deseo ejercer mi derecho de arrepentimiento.',
    paymentMethods: ['Transferencia Bancaria'],
    showSocial: true,
    showPaymentBadges: true,
  },
  checkout: {
    steps: ['shipping', 'payment', 'review'],
    guestCheckoutEnabled: false,
    fields: [
      { name: 'firstName', label: 'Nombre', placeholder: '', required: true, visible: true, type: 'text', step: 'shipping', group: 'account' },
      { name: 'lastName', label: 'Apellido', placeholder: '', required: true, visible: true, type: 'text', step: 'shipping', group: 'account' },
      { name: 'email', label: 'Email', placeholder: '', required: true, visible: true, type: 'email', step: 'shipping', group: 'account' },
      { name: 'phone', label: 'Teléfono', placeholder: '', required: true, visible: true, type: 'tel', step: 'shipping', group: 'account' },
      { name: 'address', label: 'Dirección', placeholder: '', required: true, visible: true, type: 'text', step: 'shipping', group: 'address' },
      { name: 'city', label: 'Ciudad', placeholder: '', required: true, visible: true, type: 'text', step: 'shipping', group: 'address' },
      { name: 'state', label: 'Provincia', placeholder: '', required: false, visible: true, type: 'text', step: 'shipping', group: 'address' },
      { name: 'zipCode', label: 'Código Postal', placeholder: '', required: true, visible: true, type: 'text', step: 'shipping', group: 'address' },
    ],
    showOrderNotes: false,
    orderNotesLabel: 'Notas del pedido',
    orderNotesPlaceholder: 'Aclaraciones para la entrega...',
    showCouponInput: false,
    couponPlaceholder: 'Código de descuento',
    couponApplyLabel: 'Aplicar',
  },
  wishlist: {
    enabled: true,
    storageKey: 'wishlist_v1',
    requireAuth: false,
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
    registration: {
      title: 'Crear Cuenta',
      subtitle: 'Registrate para acceder a precios y realizar pedidos',
      submitLabel: 'Crear Cuenta',
      successMessage: 'Registro completado con éxito',
      acceptTermsLabel: 'Acepto los términos y condiciones',
      alreadyHaveAccountText: '¿Ya tenés cuenta?',
      alreadyHaveAccountLinkText: 'Iniciá sesión aquí',
      fields: [
        { name: 'email', label: 'Email', placeholder: 'tu@email.com', required: true, visible: true },
        { name: 'password', label: 'Contraseña', placeholder: 'Tu contraseña', required: true, visible: true, type: 'password' },
        { name: 'confirmPassword', label: 'Confirmar Contraseña', placeholder: 'Confirma tu contraseña', required: false, visible: true, type: 'password' },
      ],
    },
    ui: {
      searchPlaceholder: 'Buscar productos...',
      noProductsTitle: 'No se encontraron productos',
      noProductsMessage: 'Intenta con otros términos de búsqueda o explorá nuestro catálogo',
      alreadyHaveAccountText: '¿Ya tenés cuenta?',
      homeCategoriesTitle: 'Categorías',
      homeCategoriesSubtitle: 'Explorá nuestras categorías de productos',
      showHomeCategoriesHeader: true,
      homeCategoriesPerView: 3,
      homeCategoriesSidePadding: 0,
      showHomeBenefits: true,
      homeFeaturedTitle: 'Productos Destacados',
      homeFeaturedSubtitle: 'Los mejores productos seleccionados para vos',
      homeNewTitle: 'Nuevos Productos',
      homeNewSubtitle: 'Las últimas incorporaciones a nuestro catálogo',
      homeSaleTitle: 'Ofertas',
      homeSaleSubtitle: 'Los mejores precios del momento',
      homeViewAllLabel: 'Ver todos',
      headerCategoriesLabel: 'Categorías',
      headerAllProductsLabel: 'Todos los productos',
      headerLoginLabel: 'Iniciar Sesión',
      headerRegisterLabel: 'Registrarse',
      headerMyProfileLabel: 'Mi Perfil',
      headerMyOrdersLabel: 'Mis Pedidos',
      headerFavoritesLabel: 'Favoritos',
      headerLogoutLabel: 'Cerrar Sesión',
      footerWhatsappTitle: 'Recibí notificaciones por WhatsApp',
      footerWhatsappBody: 'Ingresá tu número y recibí novedades y estado de tus pedidos',
      footerWhatsappPlaceholder: '+54 9 11 1234-5678',
      footerWhatsappButton: 'Suscribirme',
      footerCopyrightSuffix: 'Todos los derechos reservados.',
      footerPaymentMethodsLabel: 'Medios de pago',
      cartTitle: 'Mi Carrito',
      cartEmptyTitle: 'Tu carrito está vacío',
      cartEmptyBody: 'Todavía no agregaste nada, ¡explorá nuestros productos!',
      cartEmptyExploreLabel: 'Explorar Productos',
      cartProceedAuthLabel: 'Finalizar Compra',
      cartProceedGuestLabel: 'Iniciar Sesión para Comprar',
      cartClearLabel: 'Vaciar Carrito',
      authRequiredTitle: 'Acceso Requerido',
      authLoginButtonLabel: 'Iniciar Sesión',
      authRegisterButtonLabel: 'Registrarse',
      // Login page
      loginTitle: 'Iniciar Sesión',
      loginSubtitle: 'Ingresá tu email y contraseña para acceder',
      loginEmailLabel: 'Email',
      loginEmailPlaceholder: 'tu@email.com',
      loginPasswordLabel: 'Contraseña',
      loginPasswordPlaceholder: 'Tu contraseña',
      loginForgotPasswordLabel: 'Recuperar contraseña por WhatsApp',
      loginForgotPasswordMessage: 'Hola, necesito recuperar mi contraseña. Mi email registrado es: ',
      loginSubmitLabel: 'Iniciar Sesión',
      loginLoadingLabel: 'Iniciando sesión...',
      loginNoAccountText: '¿No tenés cuenta?',
      loginNoAccountLinkText: 'Registrate',
      loginClearSessionLabel: 'Limpiar sesión',
      loginSuccessTitle: '¡Bienvenido!',
      loginErrorTitle: 'Error al iniciar sesión',
      loginSessionExpiredMessage: 'Tu sesión expiró. Por favor iniciá sesión nuevamente.',
      // Register page
      registerLoadingLabel: 'Creando cuenta...',
      registerSuccessTitle: '¡Cuenta creada!',
      registerErrorTitle: 'Error al registrarse',
      passwordValidationLength: 'Mínimo 8 caracteres',
      passwordValidationUppercase: 'Al menos una mayúscula',
      passwordValidationLowercase: 'Al menos una minúscula',
      passwordValidationNumber: 'Al menos un número',
      // Product detail page
      productNotFoundTitle: 'Producto no encontrado',
      productNotFoundBody: 'El producto que buscás no existe o fue removido',
      productViewAllLabel: 'Ver todos los productos',
      productBackLabel: 'Volver',
      productBreadcrumbHome: 'Inicio',
      productBreadcrumbProducts: 'Productos',
      productDescriptionLabel: 'Descripción',
      productVariantLabel: 'Variante',
      productNoVariantMessage: 'No hay variantes disponibles',
      productAvailabilityLabel: 'Disponibilidad',
      productOutOfStockLabel: 'Sin stock',
      productAddToCartLabel: 'Agregar al carrito',
      productSelectVariantLabel: 'Selecciona una variante',
      productBuySecureTitle: 'Compra Segura',
      productBuySecureDesc: 'Tus datos están protegidos con encriptación SSL',
      productBuySecureIcon: 'Shield',
      productShippingBadgeIcon: 'Truck',
      productMultiplePaymentsTitle: 'Múltiples Formas de Pago',
      productMultiplePaymentsDesc: 'Transferencia, efectivo y más',
      productMultiplePaymentsIcon: 'CreditCard',
      headerPromoMessages: [
        '✨ Tecnología Profesional para Empresas',
        '✨ ¡Envío gratis en todas tus compras!',
        '✨ Hasta 12 cuotas sin interés',
        '✨ Envíos a todo el país',
      ],
      // Cart page (full page, not drawer)
      cartPageTitle: 'Carrito de Compras',
      cartPageContinueShopping: 'Seguir Comprando',
      cartPageItemsLabel: 'Productos en tu carrito',
      cartPageClearCartLabel: 'Vaciar carrito',
      cartPageProductSingular: 'producto',
      cartPageProductPlural: 'productos',
      cartPageSubtotalLabel: 'Subtotal',
      cartPageShippingLabel: 'Envío',
      cartPageTotalLabel: 'Total',
      cartPageCheckoutLabel: 'Proceder al Pago',
      cartPageSSLBadge: 'Compra 100% Segura',
      cartPageSSLDesc: 'Todos tus datos están protegidos',
      cartPageShippingBadge: 'Envío Rápido',
      cartPageShippingDesc: 'Entrega a todo el país',
      // Checkout page
      checkoutTitle: 'Finalizar Compra',
      checkoutBackLabel: 'Volver al Carrito',
      checkoutStepShipping: 'Envío',
      checkoutStepPayment: 'Pago',
      checkoutStepReview: 'Revisar',
      checkoutShippingTitle: 'Información de Envío',
      checkoutPaymentTitle: 'Información de Pago',
      checkoutReviewTitle: 'Revisá tu Pedido',
      checkoutAddressTitle: 'Dirección de Entrega',
      checkoutAccountDataTitle: 'Datos de tu cuenta',
      checkoutFieldFirst: 'Nombre',
      checkoutFieldLast: 'Apellido',
      checkoutFieldEmail: 'Email',
      checkoutFieldPhone: 'Teléfono',
      checkoutFieldAddress: 'Dirección de Entrega',
      checkoutFieldCity: 'Ciudad',
      checkoutFieldState: 'Provincia',
      checkoutFieldZip: 'Código Postal',
      checkoutContinueToPayment: 'Continuar al Pago',
      checkoutPaymentMethodLabel: 'Método de Pago',
      checkoutTransferLabel: 'Transferencia Bancaria',
      checkoutTransferDesc: 'Método de pago seguro y directo',
      checkoutTransferInfoTitle: 'Datos para la Transferencia',
      checkoutEfectivoLabel: 'Efectivo',
      checkoutEfectivoDesc: 'Pago en efectivo al momento de la entrega o retiro',
      checkoutEfectivoInfoTitle: 'Pago en Efectivo',
      checkoutFinalizeLabel: 'Confirmar Pedido',
      checkoutFinalizingLabel: 'Procesando...',
      checkoutBackButton: 'Volver',
      checkoutCartEmptyTitle: 'Carrito vacío',
      checkoutCartEmptyMsg: 'No tenés productos en tu carrito para procesar',
      checkoutViewProductsLabel: 'Ver Productos',
      checkoutSubtotalLabel: 'Subtotal',
      checkoutShippingLabel: 'Envío',
      checkoutTotalLabel: 'Total',
      checkoutOrderTitle: 'Resumen del Pedido',
      checkoutBankLabel: 'Banco',
      checkoutHolderLabel: 'Titular',
      checkoutCbuLabel: 'CBU',
      checkoutAliasLabel: 'Alias',
      checkoutTransferImportantNote: 'Una vez realizada la transferencia, enviá el comprobante por WhatsApp con tu número de orden para acelerar la confirmación.',
      checkoutEfectivoNote: 'Recibirás una confirmación por email con los detalles de tu pedido y coordinación de entrega.',
      // Footer sections
      footerCompanyTitle: 'Empresa',
      footerCustomerServiceTitle: 'Atención al Cliente',
      footerCategoriesTitle: 'Categorías',
      footerLegalTitle: 'Legal',
      footerCompanyAboutLabel: 'Sobre Nosotros',
      footerCustomerHelpLabel: 'Centro de Ayuda',
      footerCustomerTrackingLabel: 'Seguimiento de Pedido',
      footerCustomerReturnsLabel: 'Devoluciones',
      footerCustomerWarrantyLabel: 'Garantías',
      footerLegalTermsLabel: 'Términos y Condiciones',
      footerLegalPrivacyLabel: 'Política de Privacidad',
      footerLegalCookiesLabel: 'Política de Cookies',
      footerLegalNoticeLabel: 'Aviso Legal',
      footerLegalWithdrawalLabel: 'Derecho de Arrepentimiento',
      // Registration success page
      registrationSuccessTitle: '¡Bienvenido!',
      registrationSuccessSubtitle: 'Tu cuenta ha sido creada y ya estás conectado',
      registrationSuccessReadyTitle: '¡Todo listo!',
      registrationSuccessBullet1: 'Tu cuenta empresarial está activa',
      registrationSuccessBullet2: 'Ya podés ver precios exclusivos B2B',
      registrationSuccessBullet3: 'Explorá nuestro catálogo de productos',
      registrationSuccessBullet4: 'Realizá pedidos cuando quieras',
      registrationSuccessViewProductsLabel: 'Ver Productos',
      registrationSuccessHomeLabel: 'Ir al Inicio',
      // Order success page
      orderSuccessTitle: 'Pedido Recibido',
      orderSuccessSubtitle: 'Gracias por tu compra. El backend validará el pago antes de confirmar el pedido.',
      orderSuccessOrderNumberLabel: 'Número de Orden',
      orderSuccessPaymentMethodLabel: 'Medio de pago informado',
      orderSuccessPaymentPendingLabel: 'Estado: pendiente de validación por el backend',
      orderSuccessEmailLabel: 'Confirmación enviada a',
      orderSuccessTotalLabel: 'Total del Pedido',
      orderSuccessNextTitle: '¿Qué sigue?',
      orderSuccessNextBullet1: 'Recibirás un email con los detalles de tu pedido',
      orderSuccessNextBullet2: 'El backend validará el pago informado y actualizará el estado del pedido',
      orderSuccessNextBullet3: 'Cuando la orden avance de estado, la verás reflejada en Mis Pedidos',
      orderSuccessViewOrdersLabel: 'Ver Mis Pedidos',
      orderSuccessContinueLabel: 'Seguir Comprando',
      orderSuccessBackHomeLabel: 'Volver al inicio',
      // Payment method labels (shared)
      paymentMethodCash: 'Efectivo',
      paymentMethodTransfer: 'Transferencia',
      paymentMethodCreditCard: 'Tarjeta de crédito',
      paymentMethodDebitCard: 'Tarjeta de débito',
      paymentMethodMercadopago: 'Mercado Pago',
      paymentMethodCard: 'Tarjeta',
      paymentMethodCheck: 'Cheque',
      paymentMethodOther: 'Otro',
      paymentMethodPending: 'Pendiente',
      // Order status labels (shared)
      orderStatusDraft: 'Borrador',
      orderStatusPendingPayment: 'Pago pendiente',
      orderStatusPaymentReview: 'Revisión de pago',
      orderStatusConfirmed: 'Confirmado',
      orderStatusPreparing: 'En preparación',
      orderStatusReadyToShip: 'Listo para enviar',
      orderStatusShipped: 'Enviado',
      orderStatusInTransit: 'En tránsito',
      orderStatusOutForDelivery: 'En reparto',
      orderStatusDelivered: 'Entregado',
      orderStatusCompleted: 'Completado',
      orderStatusCancelled: 'Cancelado',
      orderStatusReturnRequested: 'Devolución solicitada',
      orderStatusReturnInTransit: 'Dev. en tránsito',
      orderStatusReturned: 'Devuelto',
      orderStatusRefunded: 'Reembolsado',
      // Payment review status labels
      paymentReviewPendingSubmit: 'Pendiente de envío',
      paymentReviewPendingValidation: 'Pendiente de validación',
      paymentReviewInReview: 'En revisión backend',
      paymentReviewValidated: 'Validado por backend',
      paymentReviewCancelled: 'Cancelado',
      paymentReviewInReturn: 'En devolución',
      paymentReviewReturned: 'Devuelto',
      paymentReviewRefunded: 'Reembolsado',
      // Orders page
      ordersPageTitle: 'Mis Pedidos',
      ordersAuthMessage: 'Necesitás iniciar sesión para ver tus pedidos',
      ordersBackToProfileLabel: 'Volver a Perfil',
      ordersSearchPlaceholder: 'Buscar por número de pedido o producto...',
      ordersFilterAllLabel: 'Todos los estados',
      ordersFilterPendingLabel: 'Pendiente',
      ordersFilterProcessingLabel: 'Procesando',
      ordersFilterShippedLabel: 'Enviado',
      ordersFilterDeliveredLabel: 'Entregado',
      ordersFilterCancelledLabel: 'Cancelado',
      ordersFilterReturnedLabel: 'Devolución',
      ordersLoadingMessage: 'Cargando tus pedidos...',
      ordersEmptyTitle: 'No tenés pedidos aún',
      ordersEmptyBody: 'Cuando realices tu primera compra, aparecerá aquí.',
      ordersEmptyFilterTitle: 'No se encontraron pedidos',
      ordersEmptyFilterBody: 'Intentá ajustar los filtros de búsqueda.',
      ordersEmptyExploreLabel: 'Explorar Productos',
      ordersViewDetailLabel: 'Ver Detalles',
      ordersCancelLabel: 'Cancelar',
      ordersCancellingLabel: 'Cancelando...',
      ordersTrackingLabel: 'Seguimiento',
      ordersPaymentInformedLabel: 'Pago informado',
      ordersPaymentInfoBody: 'El storefront solo informa el medio de pago. La validación queda del lado backend.',
      ordersItemsCountLabel: 'producto(s)',
      ordersDetailTitle: 'Detalles del Pedido',
      ordersDetailStatusLabel: 'Estado',
      ordersDetailDateLabel: 'Fecha',
      ordersDetailTotalLabel: 'Total',
      ordersDetailChannelLabel: 'Canal',
      ordersDetailNoChannelLabel: 'Sin definir',
      ordersDetailNotesLabel: 'Notas / entrega',
      ordersDetailProductsLabel: 'Productos',
      ordersDetailQuantityLabel: 'Cantidad',
      ordersDetailEachLabel: 'c/u',
      ordersDetailPaymentStatusLabel: 'Estado de pago',
      ordersDetailStatusHistoryLabel: 'Historial de estados',
      ordersDetailNoHistoryMessage: 'No hay historial detallado disponible para este pedido.',
      ordersDetailStorefrontNote: 'El frontend informó el medio de pago y el backend controla la validación.',
      // Profile page
      profilePageTitle: 'Mi Perfil',
      profileBackLabel: 'Volver',
      profileEditLabel: 'Editar Perfil',
      profileSaveLabel: 'Guardar',
      profileSavingLabel: 'Guardando...',
      profileCancelLabel: 'Cancelar',
      profilePersonalInfoTitle: 'Información Personal',
      profileFirstNameLabel: 'Nombre',
      profileLastNameLabel: 'Apellido',
      profileEmailLabel: 'Email',
      profilePhoneLabel: 'Teléfono',
      profileEmailReadOnly: '(No editable)',
      profileNotSpecified: 'No especificado',
      profileAccountInfoTitle: 'Información de Cuenta',
      profileUsernameLabel: 'Usuario:',
      profileStatusLabel: 'Estado:',
      profileStatusActive: '✓ Activo',
      profileMemberSinceLabel: 'Miembro desde:',
      profileActionsTitle: 'Acciones',
      profileViewOrdersLabel: 'Ver mis pedidos',
      profileFavoritesLabel: 'Mis favoritos',
      profileLogoutLabel: 'Cerrar sesión',
      profileAuthMessage: 'Necesitás iniciar sesión para ver tu perfil',
      // Favorites page
      favoritesPageTitle: 'Mis Favoritos',
      favoritesBackLabel: 'Volver a Perfil',
      favoritesAuthMessage: 'Necesitás iniciar sesión para ver tus favoritos',
      favoritesAddAllLabel: 'Agregar Todo al Carrito',
      favoritesLoadingMessage: 'Cargando tus favoritos...',
      favoritesEmptyTitle: 'No tenés favoritos aún',
      favoritesEmptyBody: 'Guardá los productos que te gusten para encontrarlos fácilmente más tarde.',
      favoritesEmptyExploreLabel: 'Explorar Productos',
      favoritesSearchPlaceholder: 'Buscar en favoritos...',
      favoritesNoResultsBody: 'Intentá con otros términos de búsqueda.',
      favoritesVariantsLabel: 'Variantes disponibles',
      favoritesCountSingular: 'producto guardado',
      favoritesCountPlural: 'productos guardados',
      // Order tracking page
      trackingPageTitle: 'Seguimiento de Pedido',
      trackingBackLabel: 'Volver al inicio',
      trackingSubtitle: 'Consultá el estado de tu pedido en tiempo real',
      trackingWhatsappTitle: 'Consultá tu Pedido por WhatsApp',
      trackingWhatsappBody: 'Nuestro equipo te brindará información actualizada sobre el estado de tu pedido',
      trackingWhatsappLabel: 'Consultar por WhatsApp',
      trackingHowTitle: '¿Cómo funciona el seguimiento?',
      trackingStep1Title: 'Número de Pedido',
      trackingStep1Body: 'Una vez confirmada tu compra, recibirás un número de pedido único por email y WhatsApp. Guardá este número para futuras consultas.',
      trackingStep2Title: 'Contactá por WhatsApp',
      trackingStep2Body: 'Enviá un mensaje a nuestro WhatsApp oficial con tu número de pedido. Nuestro equipo te responderá de inmediato.',
      trackingStep3Title: 'Estado en Tiempo Real',
      trackingStep3Body: 'Te informaremos el estado actual de tu pedido: procesando, en preparación, despachado o en camino.',
      trackingStatusSectionTitle: 'Estados del Pedido',
      trackingStatus1Label: 'Procesando',
      trackingStatus1Desc: 'Tu pedido está siendo verificado',
      trackingStatus2Label: 'En Preparación',
      trackingStatus2Desc: 'Estamos preparando tu pedido',
      trackingStatus3Label: 'Despachado',
      trackingStatus3Desc: 'Tu pedido fue enviado',
      trackingStatus4Label: 'Entregado',
      trackingStatus4Desc: 'Tu pedido fue entregado exitosamente',
      trackingFaqTitle: 'Preguntas Frecuentes',
      trackingFaq1Question: '¿Cuánto tarda en llegar mi pedido?',
      trackingFaq1Answer: 'Los tiempos de entrega varían según tu ubicación. Para CABA y GBA: 24-48hs. Interior del país: 3-7 días hábiles. Consultá tu caso específico por WhatsApp.',
      trackingFaq2Question: '¿Puedo modificar mi pedido?',
      trackingFaq2Answer: 'Si tu pedido aún no fue despachado, podemos realizar modificaciones. Contactanos inmediatamente por WhatsApp con tu número de pedido.',
      trackingFaq3Question: 'No recibí el número de pedido',
      trackingFaq3Answer: 'Revisá tu carpeta de spam/correo no deseado. Si no lo encontrás, contactanos por WhatsApp con los datos de tu compra.',
      trackingFaq4Question: '¿Puedo retirar mi pedido en persona?',
      trackingFaq4Answer: 'Sí, ofrecemos retiro en nuestras oficinas. Consultá disponibilidad y horarios por WhatsApp al momento de realizar tu pedido.',
      trackingHelpTitle: '¿Necesitás ayuda adicional?',
      trackingHelpBody: 'Nuestro equipo está disponible para resolver todas tus dudas',
      trackingHelpCtaLabel: 'Ir a Centro de Ayuda',
      // Contact page
      contactPageTitle: 'Centro de Ayuda',
      contactBackLabel: 'Volver al inicio',
      contactSubtitle: 'Estamos aquí para asistirte en lo que necesites',
      contactOfficialChannelTitle: 'Canal Oficial de Atención',
      contactOfficialChannelBody: 'Nuestro medio oficial de contacto es WhatsApp. Respuesta inmediata de nuestro equipo.',
      contactWhatsappLabel: 'Chatear por WhatsApp',
      contactHowHelpTitle: '¿Cómo podemos ayudarte?',
      contactProductsTitle: 'Consultas de Productos',
      contactProductsBody: '¿Necesitás información sobre stock, especificaciones o disponibilidad?',
      contactProductsLabel: 'Consultar por WhatsApp →',
      contactTrackingTitle: 'Seguimiento de Pedido',
      contactTrackingBody: 'Consultá el estado de tu pedido y tiempos de entrega.',
      contactTrackingLabel: 'Consultar seguimiento →',
      contactB2bTitle: 'Cotizaciones B2B',
      contactB2bBody: 'Solicitá cotizaciones personalizadas para empresas.',
      contactB2bLabel: 'Solicitar cotización →',
      contactSupportTitle: 'Soporte Técnico',
      contactSupportBody: '¿Problemas técnicos? Nuestro equipo te asesora.',
      contactSupportLabel: 'Obtener soporte →',
      contactReturnsTitle: 'Devoluciones',
      contactReturnsBody: 'Gestioná cambios, devoluciones y garantías.',
      contactReturnsLabel: 'Gestionar devolución →',
      // Cart drawer
      cartDrawerEmptyDescription: 'Tu carrito está vacío',
      cartDrawerCountSuffix: 'en tu carrito',
      cartItemRemovedTitle: 'Producto eliminado',
      cartItemRemovedMessage: 'El producto fue eliminado del carrito',
      cartClearedTitle: 'Carrito vaciado',
      cartClearedMessage: 'Todos los productos fueron eliminados',
      cartDrawerSubtotalLabel: 'Subtotal:',
      cartDrawerTotalLabel: 'Total:',
      // Product card notifications
      productOutOfStockNotifTitle: 'Sin stock',
      productOutOfStockNotifMessage: 'Este producto no tiene stock disponible',
      productAddedToFavoritesTitle: 'Agregado a favoritos',
      productAddedToFavoritesMessage: 'agregado a tus favoritos',
      productRemovedFromFavoritesTitle: 'Eliminado de favoritos',
      productRemovedFromFavoritesMessage: 'eliminado de favoritos',
      productLoginForFavoritesTitle: 'Iniciá sesión',
      productLoginForFavoritesMessage: 'Necesitás iniciar sesión para agregar productos a favoritos',
      // Product detail notifications
      productVariantRequiredTitle: 'Elegí una variante',
      productVariantRequiredMessage: 'Seleccioná color, talle u opciones antes de agregar al carrito.',
      productVariantOutOfStockMessage: 'La variante elegida no tiene stock disponible.',
      productSubtotalLabel: 'Subtotal actual:',
      productWithVariantsLabel: 'Producto con variantes',
      productAvailableUnitsLabel: 'disponibles',
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
  if (!category.name && !category.link && !category.slug) {
    return null;
  }

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

function normalizeShippingConfig(raw: unknown): ShippingConfig {
  if (typeof raw !== 'object' || raw === null) {
    return { ...DEFAULT_RUNTIME_CONFIG.shipping };
  }

  const shipping = raw as Partial<ShippingConfig>;
  const mode = shipping.mode === 'flat_rate' ? 'flat_rate' : 'free';

  return {
    enabled: readBoolean(shipping.enabled, DEFAULT_RUNTIME_CONFIG.shipping.enabled),
    mode,
    bannerText: readString(shipping.bannerText, DEFAULT_RUNTIME_CONFIG.shipping.bannerText),
    label: readString(shipping.label, DEFAULT_RUNTIME_CONFIG.shipping.label),
    freeLabel: readString(shipping.freeLabel, DEFAULT_RUNTIME_CONFIG.shipping.freeLabel),
    pendingLabel: readString(shipping.pendingLabel, DEFAULT_RUNTIME_CONFIG.shipping.pendingLabel),
    drawerMessage: readString(shipping.drawerMessage, DEFAULT_RUNTIME_CONFIG.shipping.drawerMessage),
    chargedMessage: readString(shipping.chargedMessage, DEFAULT_RUNTIME_CONFIG.shipping.chargedMessage),
    productBadgeTitle: readString(shipping.productBadgeTitle, DEFAULT_RUNTIME_CONFIG.shipping.productBadgeTitle),
    productBadgeDescription: readString(
      shipping.productBadgeDescription,
      DEFAULT_RUNTIME_CONFIG.shipping.productBadgeDescription,
    ),
    chargeAmount: readNumber(shipping.chargeAmount, DEFAULT_RUNTIME_CONFIG.shipping.chargeAmount),
    chargeProductId: readString(shipping.chargeProductId, DEFAULT_RUNTIME_CONFIG.shipping.chargeProductId),
    chargeProductSku: readString(shipping.chargeProductSku, DEFAULT_RUNTIME_CONFIG.shipping.chargeProductSku),
    chargeProductDescription: readString(
      shipping.chargeProductDescription,
      DEFAULT_RUNTIME_CONFIG.shipping.chargeProductDescription,
    ),
    taxRate: readNumber(shipping.taxRate, DEFAULT_RUNTIME_CONFIG.shipping.taxRate),
  };
}

function normalizeNewsletterConfig(raw: unknown): NewsletterConfig {
  if (typeof raw !== 'object' || raw === null) {
    return {
      ...DEFAULT_RUNTIME_CONFIG.newsletter,
      headers: { ...DEFAULT_RUNTIME_CONFIG.newsletter.headers },
    };
  }

  const newsletter = raw as Partial<NewsletterConfig>;
  return {
    enabled: readBoolean(newsletter.enabled, DEFAULT_RUNTIME_CONFIG.newsletter.enabled),
    endpoint: readString(newsletter.endpoint, DEFAULT_RUNTIME_CONFIG.newsletter.endpoint),
    headers: readStringMap(newsletter.headers, DEFAULT_RUNTIME_CONFIG.newsletter.headers),
    title: readString(newsletter.title, DEFAULT_RUNTIME_CONFIG.newsletter.title),
    description: readString(newsletter.description, DEFAULT_RUNTIME_CONFIG.newsletter.description),
    placeholder: readString(newsletter.placeholder, DEFAULT_RUNTIME_CONFIG.newsletter.placeholder),
    buttonLabel: readString(newsletter.buttonLabel, DEFAULT_RUNTIME_CONFIG.newsletter.buttonLabel),
    successMessage: readString(newsletter.successMessage, DEFAULT_RUNTIME_CONFIG.newsletter.successMessage),
    errorMessage: readString(newsletter.errorMessage, DEFAULT_RUNTIME_CONFIG.newsletter.errorMessage),
  };
}

function normalizeRegistrationConfig(raw: unknown) {
  const defaultReg = DEFAULT_RUNTIME_CONFIG.registration;
  if (typeof raw !== 'object' || raw === null) {
    return { ...defaultReg };
  }

  const reg = raw as any;
  const fields = Array.isArray(reg.fields)
    ? reg.fields.map((f: any) => ({
        name: String(f.name),
        label: typeof f.label === 'string' ? f.label : '',
        placeholder: typeof f.placeholder === 'string' ? f.placeholder : '',
        required: typeof f.required === 'boolean' ? f.required : true,
        visible: typeof f.visible === 'boolean' ? f.visible : true,
        type: typeof f.type === 'string' ? f.type : undefined,
      }))
    : defaultReg.fields;

  return {
    title: typeof reg.title === 'string' ? reg.title : defaultReg.title,
    subtitle: typeof reg.subtitle === 'string' ? reg.subtitle : defaultReg.subtitle,
    submitLabel: typeof reg.submitLabel === 'string' ? reg.submitLabel : defaultReg.submitLabel,
    successMessage: typeof reg.successMessage === 'string' ? reg.successMessage : defaultReg.successMessage,
    acceptTermsLabel: typeof reg.acceptTermsLabel === 'string' ? reg.acceptTermsLabel : defaultReg.acceptTermsLabel,
    alreadyHaveAccountText: typeof reg.alreadyHaveAccountText === 'string' ? reg.alreadyHaveAccountText : defaultReg.alreadyHaveAccountText,
    alreadyHaveAccountLinkText: typeof reg.alreadyHaveAccountLinkText === 'string' ? reg.alreadyHaveAccountLinkText : defaultReg.alreadyHaveAccountLinkText,
    fields,
  };
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

export const getRegistrationConfig = () => {
  return normalizeRegistrationConfig(getConfigRoot().registration);
};

export const getShippingConfig = (): ShippingConfig => {
  return normalizeShippingConfig(getConfigRoot().shipping);
};

export const getNewsletterConfig = (): NewsletterConfig => {
  return normalizeNewsletterConfig(getConfigRoot().newsletter);
};

export const getUIConfig = (): RuntimeConfig['ui'] => {
  const ui = getConfigRoot().ui;
  const defaults = DEFAULT_RUNTIME_CONFIG.ui;
  return {
    // Search & product listing
    searchPlaceholder: readString(ui?.searchPlaceholder, defaults.searchPlaceholder),
    noProductsTitle: readString(ui?.noProductsTitle, defaults.noProductsTitle),
    noProductsMessage: readString(ui?.noProductsMessage, defaults.noProductsMessage),
    alreadyHaveAccountText: readString(ui?.alreadyHaveAccountText, defaults.alreadyHaveAccountText),

    // Home page sections
    homeCategoriesTitle: readString(ui?.homeCategoriesTitle, defaults.homeCategoriesTitle),
    homeCategoriesSubtitle: readString(ui?.homeCategoriesSubtitle, defaults.homeCategoriesSubtitle),
    showHomeCategoriesHeader: readBoolean(ui?.showHomeCategoriesHeader, defaults.showHomeCategoriesHeader ?? true),
    homeCategoriesPerView: readNumber(ui?.homeCategoriesPerView, defaults.homeCategoriesPerView ?? 3),
    homeCategoriesSidePadding: readNumber(ui?.homeCategoriesSidePadding, defaults.homeCategoriesSidePadding ?? 0),
    showHomeBenefits: readBoolean(ui?.showHomeBenefits, defaults.showHomeBenefits ?? true),
    homeFeaturedTitle: readString(ui?.homeFeaturedTitle, defaults.homeFeaturedTitle),
    homeFeaturedSubtitle: readString(ui?.homeFeaturedSubtitle, defaults.homeFeaturedSubtitle),
    homeNewTitle: readString(ui?.homeNewTitle, defaults.homeNewTitle),
    homeNewSubtitle: readString(ui?.homeNewSubtitle, defaults.homeNewSubtitle),
    homeSaleTitle: readString(ui?.homeSaleTitle, defaults.homeSaleTitle),
    homeSaleSubtitle: readString(ui?.homeSaleSubtitle, defaults.homeSaleSubtitle),
    homeViewAllLabel: readString(ui?.homeViewAllLabel, defaults.homeViewAllLabel),

    // Header navigation
    headerCategoriesLabel: readString(ui?.headerCategoriesLabel, defaults.headerCategoriesLabel),
    headerAllProductsLabel: readString(ui?.headerAllProductsLabel, defaults.headerAllProductsLabel),
    headerLoginLabel: readString(ui?.headerLoginLabel, defaults.headerLoginLabel),
    headerRegisterLabel: readString(ui?.headerRegisterLabel, defaults.headerRegisterLabel),
    headerMyProfileLabel: readString(ui?.headerMyProfileLabel, defaults.headerMyProfileLabel),
    headerMyOrdersLabel: readString(ui?.headerMyOrdersLabel, defaults.headerMyOrdersLabel),
    headerFavoritesLabel: readString(ui?.headerFavoritesLabel, defaults.headerFavoritesLabel),
    headerLogoutLabel: readString(ui?.headerLogoutLabel, defaults.headerLogoutLabel),

    // Footer
    footerWhatsappTitle: readString(ui?.footerWhatsappTitle, defaults.footerWhatsappTitle),
    footerWhatsappBody: readString(ui?.footerWhatsappBody, defaults.footerWhatsappBody),
    footerWhatsappPlaceholder: readString(ui?.footerWhatsappPlaceholder, defaults.footerWhatsappPlaceholder),
    footerWhatsappButton: readString(ui?.footerWhatsappButton, defaults.footerWhatsappButton),
    footerCopyrightSuffix: readString(ui?.footerCopyrightSuffix, defaults.footerCopyrightSuffix),
    footerPaymentMethodsLabel: readString(ui?.footerPaymentMethodsLabel, defaults.footerPaymentMethodsLabel),

    // Cart drawer
    cartTitle: readString(ui?.cartTitle, defaults.cartTitle),
    cartEmptyTitle: readString(ui?.cartEmptyTitle, defaults.cartEmptyTitle),
    cartEmptyBody: readString(ui?.cartEmptyBody, defaults.cartEmptyBody),
    cartEmptyExploreLabel: readString(ui?.cartEmptyExploreLabel, defaults.cartEmptyExploreLabel),
    cartProceedAuthLabel: readString(ui?.cartProceedAuthLabel, defaults.cartProceedAuthLabel),
    cartProceedGuestLabel: readString(ui?.cartProceedGuestLabel, defaults.cartProceedGuestLabel),
    cartClearLabel: readString(ui?.cartClearLabel, defaults.cartClearLabel),

    // Auth gates
    authRequiredTitle: readString(ui?.authRequiredTitle, defaults.authRequiredTitle),
    authLoginButtonLabel: readString(ui?.authLoginButtonLabel, defaults.authLoginButtonLabel),
    authRegisterButtonLabel: readString(ui?.authRegisterButtonLabel, defaults.authRegisterButtonLabel),

    // Login page
    loginTitle: readString(ui?.loginTitle, defaults.loginTitle),
    loginSubtitle: readString(ui?.loginSubtitle, defaults.loginSubtitle),
    loginEmailLabel: readString(ui?.loginEmailLabel, defaults.loginEmailLabel),
    loginEmailPlaceholder: readString(ui?.loginEmailPlaceholder, defaults.loginEmailPlaceholder),
    loginPasswordLabel: readString(ui?.loginPasswordLabel, defaults.loginPasswordLabel),
    loginPasswordPlaceholder: readString(ui?.loginPasswordPlaceholder, defaults.loginPasswordPlaceholder),
    loginForgotPasswordLabel: readString(ui?.loginForgotPasswordLabel, defaults.loginForgotPasswordLabel),
    loginForgotPasswordMessage: readString(ui?.loginForgotPasswordMessage, defaults.loginForgotPasswordMessage),
    loginSubmitLabel: readString(ui?.loginSubmitLabel, defaults.loginSubmitLabel),
    loginLoadingLabel: readString(ui?.loginLoadingLabel, defaults.loginLoadingLabel),
    loginNoAccountText: readString(ui?.loginNoAccountText, defaults.loginNoAccountText),
    loginNoAccountLinkText: readString(ui?.loginNoAccountLinkText, defaults.loginNoAccountLinkText),
    loginClearSessionLabel: readString(ui?.loginClearSessionLabel, defaults.loginClearSessionLabel),
    loginSuccessTitle: readString(ui?.loginSuccessTitle, defaults.loginSuccessTitle),
    loginErrorTitle: readString(ui?.loginErrorTitle, defaults.loginErrorTitle),
    loginSessionExpiredMessage: readString(ui?.loginSessionExpiredMessage, defaults.loginSessionExpiredMessage),

    // Register page
    registerLoadingLabel: readString(ui?.registerLoadingLabel, defaults.registerLoadingLabel),
    registerSuccessTitle: readString(ui?.registerSuccessTitle, defaults.registerSuccessTitle),
    registerErrorTitle: readString(ui?.registerErrorTitle, defaults.registerErrorTitle),
    passwordValidationLength: readString(ui?.passwordValidationLength, defaults.passwordValidationLength),
    passwordValidationUppercase: readString(ui?.passwordValidationUppercase, defaults.passwordValidationUppercase),
    passwordValidationLowercase: readString(ui?.passwordValidationLowercase, defaults.passwordValidationLowercase),
    passwordValidationNumber: readString(ui?.passwordValidationNumber, defaults.passwordValidationNumber),

    // Product detail page
    productNotFoundTitle: readString(ui?.productNotFoundTitle, defaults.productNotFoundTitle),
    productNotFoundBody: readString(ui?.productNotFoundBody, defaults.productNotFoundBody),
    productViewAllLabel: readString(ui?.productViewAllLabel, defaults.productViewAllLabel),
    productBackLabel: readString(ui?.productBackLabel, defaults.productBackLabel),
    productBreadcrumbHome: readString(ui?.productBreadcrumbHome, defaults.productBreadcrumbHome),
    productBreadcrumbProducts: readString(ui?.productBreadcrumbProducts, defaults.productBreadcrumbProducts),
    productDescriptionLabel: readString(ui?.productDescriptionLabel, defaults.productDescriptionLabel),
    productVariantLabel: readString(ui?.productVariantLabel, defaults.productVariantLabel),
    productNoVariantMessage: readString(ui?.productNoVariantMessage, defaults.productNoVariantMessage),
    productAvailabilityLabel: readString(ui?.productAvailabilityLabel, defaults.productAvailabilityLabel),
    productOutOfStockLabel: readString(ui?.productOutOfStockLabel, defaults.productOutOfStockLabel),
    productAddToCartLabel: readString(ui?.productAddToCartLabel, defaults.productAddToCartLabel),
    productSelectVariantLabel: readString(ui?.productSelectVariantLabel, defaults.productSelectVariantLabel),
    productBuySecureTitle: readString(ui?.productBuySecureTitle, defaults.productBuySecureTitle),
    productBuySecureDesc: readString(ui?.productBuySecureDesc, defaults.productBuySecureDesc),
    productBuySecureIcon: readString(ui?.productBuySecureIcon, defaults.productBuySecureIcon),
    productShippingBadgeIcon: readString(ui?.productShippingBadgeIcon, defaults.productShippingBadgeIcon),
    productMultiplePaymentsTitle: readString(ui?.productMultiplePaymentsTitle, defaults.productMultiplePaymentsTitle),
    productMultiplePaymentsDesc: readString(ui?.productMultiplePaymentsDesc, defaults.productMultiplePaymentsDesc),
    productMultiplePaymentsIcon: readString(ui?.productMultiplePaymentsIcon, defaults.productMultiplePaymentsIcon),
    headerPromoMessages: Array.isArray(ui?.headerPromoMessages)
      ? ui!.headerPromoMessages.filter((m: any) => typeof m === 'string' && m.trim().length > 0)
      : [...defaults.headerPromoMessages],

    // Cart page (full page)
    cartPageTitle: readString(ui?.cartPageTitle, defaults.cartPageTitle),
    cartPageContinueShopping: readString(ui?.cartPageContinueShopping, defaults.cartPageContinueShopping),
    cartPageItemsLabel: readString(ui?.cartPageItemsLabel, defaults.cartPageItemsLabel),
    cartPageClearCartLabel: readString(ui?.cartPageClearCartLabel, defaults.cartPageClearCartLabel),
    cartPageProductSingular: readString(ui?.cartPageProductSingular, defaults.cartPageProductSingular),
    cartPageProductPlural: readString(ui?.cartPageProductPlural, defaults.cartPageProductPlural),
    cartPageSubtotalLabel: readString(ui?.cartPageSubtotalLabel, defaults.cartPageSubtotalLabel),
    cartPageShippingLabel: readString(ui?.cartPageShippingLabel, defaults.cartPageShippingLabel),
    cartPageTotalLabel: readString(ui?.cartPageTotalLabel, defaults.cartPageTotalLabel),
    cartPageCheckoutLabel: readString(ui?.cartPageCheckoutLabel, defaults.cartPageCheckoutLabel),
    cartPageSSLBadge: readString(ui?.cartPageSSLBadge, defaults.cartPageSSLBadge),
    cartPageSSLDesc: readString(ui?.cartPageSSLDesc, defaults.cartPageSSLDesc),
    cartPageShippingBadge: readString(ui?.cartPageShippingBadge, defaults.cartPageShippingBadge),
    cartPageShippingDesc: readString(ui?.cartPageShippingDesc, defaults.cartPageShippingDesc),

    // Checkout page
    checkoutTitle: readString(ui?.checkoutTitle, defaults.checkoutTitle),
    checkoutBackLabel: readString(ui?.checkoutBackLabel, defaults.checkoutBackLabel),
    checkoutStepShipping: readString(ui?.checkoutStepShipping, defaults.checkoutStepShipping),
    checkoutStepPayment: readString(ui?.checkoutStepPayment, defaults.checkoutStepPayment),
    checkoutStepReview: readString(ui?.checkoutStepReview, defaults.checkoutStepReview),
    checkoutShippingTitle: readString(ui?.checkoutShippingTitle, defaults.checkoutShippingTitle),
    checkoutPaymentTitle: readString(ui?.checkoutPaymentTitle, defaults.checkoutPaymentTitle),
    checkoutReviewTitle: readString(ui?.checkoutReviewTitle, defaults.checkoutReviewTitle),
    checkoutAddressTitle: readString(ui?.checkoutAddressTitle, defaults.checkoutAddressTitle),
    checkoutAccountDataTitle: readString(ui?.checkoutAccountDataTitle, defaults.checkoutAccountDataTitle),
    checkoutFieldFirst: readString(ui?.checkoutFieldFirst, defaults.checkoutFieldFirst),
    checkoutFieldLast: readString(ui?.checkoutFieldLast, defaults.checkoutFieldLast),
    checkoutFieldEmail: readString(ui?.checkoutFieldEmail, defaults.checkoutFieldEmail),
    checkoutFieldPhone: readString(ui?.checkoutFieldPhone, defaults.checkoutFieldPhone),
    checkoutFieldAddress: readString(ui?.checkoutFieldAddress, defaults.checkoutFieldAddress),
    checkoutFieldCity: readString(ui?.checkoutFieldCity, defaults.checkoutFieldCity),
    checkoutFieldState: readString(ui?.checkoutFieldState, defaults.checkoutFieldState),
    checkoutFieldZip: readString(ui?.checkoutFieldZip, defaults.checkoutFieldZip),
    checkoutContinueToPayment: readString(ui?.checkoutContinueToPayment, defaults.checkoutContinueToPayment),
    checkoutPaymentMethodLabel: readString(ui?.checkoutPaymentMethodLabel, defaults.checkoutPaymentMethodLabel),
    checkoutTransferLabel: readString(ui?.checkoutTransferLabel, defaults.checkoutTransferLabel),
    checkoutTransferDesc: readString(ui?.checkoutTransferDesc, defaults.checkoutTransferDesc),
    checkoutTransferInfoTitle: readString(ui?.checkoutTransferInfoTitle, defaults.checkoutTransferInfoTitle),
    checkoutEfectivoLabel: readString(ui?.checkoutEfectivoLabel, defaults.checkoutEfectivoLabel),
    checkoutEfectivoDesc: readString(ui?.checkoutEfectivoDesc, defaults.checkoutEfectivoDesc),
    checkoutEfectivoInfoTitle: readString(ui?.checkoutEfectivoInfoTitle, defaults.checkoutEfectivoInfoTitle),
    checkoutFinalizeLabel: readString(ui?.checkoutFinalizeLabel, defaults.checkoutFinalizeLabel),
    checkoutFinalizingLabel: readString(ui?.checkoutFinalizingLabel, defaults.checkoutFinalizingLabel),
    checkoutBackButton: readString(ui?.checkoutBackButton, defaults.checkoutBackButton),
    checkoutCartEmptyTitle: readString(ui?.checkoutCartEmptyTitle, defaults.checkoutCartEmptyTitle),
    checkoutCartEmptyMsg: readString(ui?.checkoutCartEmptyMsg, defaults.checkoutCartEmptyMsg),
    checkoutViewProductsLabel: readString(ui?.checkoutViewProductsLabel, defaults.checkoutViewProductsLabel),
    checkoutSubtotalLabel: readString(ui?.checkoutSubtotalLabel, defaults.checkoutSubtotalLabel),
    checkoutShippingLabel: readString(ui?.checkoutShippingLabel, defaults.checkoutShippingLabel),
    checkoutTotalLabel: readString(ui?.checkoutTotalLabel, defaults.checkoutTotalLabel),
    checkoutOrderTitle: readString(ui?.checkoutOrderTitle, defaults.checkoutOrderTitle),
    checkoutBankLabel: readString(ui?.checkoutBankLabel, defaults.checkoutBankLabel),
    checkoutHolderLabel: readString(ui?.checkoutHolderLabel, defaults.checkoutHolderLabel),
    checkoutCbuLabel: readString(ui?.checkoutCbuLabel, defaults.checkoutCbuLabel),
    checkoutAliasLabel: readString(ui?.checkoutAliasLabel, defaults.checkoutAliasLabel),
    checkoutTransferImportantNote: readString(ui?.checkoutTransferImportantNote, defaults.checkoutTransferImportantNote),
    checkoutEfectivoNote: readString(ui?.checkoutEfectivoNote, defaults.checkoutEfectivoNote),

    // Footer sections
    footerCompanyTitle: readString(ui?.footerCompanyTitle, defaults.footerCompanyTitle),
    footerCustomerServiceTitle: readString(ui?.footerCustomerServiceTitle, defaults.footerCustomerServiceTitle),
    footerCategoriesTitle: readString(ui?.footerCategoriesTitle, defaults.footerCategoriesTitle),
    footerLegalTitle: readString(ui?.footerLegalTitle, defaults.footerLegalTitle),
    footerCompanyAboutLabel: readString(ui?.footerCompanyAboutLabel, defaults.footerCompanyAboutLabel),
    footerCustomerHelpLabel: readString(ui?.footerCustomerHelpLabel, defaults.footerCustomerHelpLabel),
    footerCustomerTrackingLabel: readString(ui?.footerCustomerTrackingLabel, defaults.footerCustomerTrackingLabel),
    footerCustomerReturnsLabel: readString(ui?.footerCustomerReturnsLabel, defaults.footerCustomerReturnsLabel),
    footerCustomerWarrantyLabel: readString(ui?.footerCustomerWarrantyLabel, defaults.footerCustomerWarrantyLabel),
    footerLegalTermsLabel: readString(ui?.footerLegalTermsLabel, defaults.footerLegalTermsLabel),
    footerLegalPrivacyLabel: readString(ui?.footerLegalPrivacyLabel, defaults.footerLegalPrivacyLabel),
    footerLegalCookiesLabel: readString(ui?.footerLegalCookiesLabel, defaults.footerLegalCookiesLabel),
    footerLegalNoticeLabel: readString(ui?.footerLegalNoticeLabel, defaults.footerLegalNoticeLabel),
    footerLegalWithdrawalLabel: readString(ui?.footerLegalWithdrawalLabel, defaults.footerLegalWithdrawalLabel),
    // Registration success page
    registrationSuccessTitle: readString(ui?.registrationSuccessTitle, defaults.registrationSuccessTitle),
    registrationSuccessSubtitle: readString(ui?.registrationSuccessSubtitle, defaults.registrationSuccessSubtitle),
    registrationSuccessReadyTitle: readString(ui?.registrationSuccessReadyTitle, defaults.registrationSuccessReadyTitle),
    registrationSuccessBullet1: readString(ui?.registrationSuccessBullet1, defaults.registrationSuccessBullet1),
    registrationSuccessBullet2: readString(ui?.registrationSuccessBullet2, defaults.registrationSuccessBullet2),
    registrationSuccessBullet3: readString(ui?.registrationSuccessBullet3, defaults.registrationSuccessBullet3),
    registrationSuccessBullet4: readString(ui?.registrationSuccessBullet4, defaults.registrationSuccessBullet4),
    registrationSuccessViewProductsLabel: readString(ui?.registrationSuccessViewProductsLabel, defaults.registrationSuccessViewProductsLabel),
    registrationSuccessHomeLabel: readString(ui?.registrationSuccessHomeLabel, defaults.registrationSuccessHomeLabel),
    // Order success page
    orderSuccessTitle: readString(ui?.orderSuccessTitle, defaults.orderSuccessTitle),
    orderSuccessSubtitle: readString(ui?.orderSuccessSubtitle, defaults.orderSuccessSubtitle),
    orderSuccessOrderNumberLabel: readString(ui?.orderSuccessOrderNumberLabel, defaults.orderSuccessOrderNumberLabel),
    orderSuccessPaymentMethodLabel: readString(ui?.orderSuccessPaymentMethodLabel, defaults.orderSuccessPaymentMethodLabel),
    orderSuccessPaymentPendingLabel: readString(ui?.orderSuccessPaymentPendingLabel, defaults.orderSuccessPaymentPendingLabel),
    orderSuccessEmailLabel: readString(ui?.orderSuccessEmailLabel, defaults.orderSuccessEmailLabel),
    orderSuccessTotalLabel: readString(ui?.orderSuccessTotalLabel, defaults.orderSuccessTotalLabel),
    orderSuccessNextTitle: readString(ui?.orderSuccessNextTitle, defaults.orderSuccessNextTitle),
    orderSuccessNextBullet1: readString(ui?.orderSuccessNextBullet1, defaults.orderSuccessNextBullet1),
    orderSuccessNextBullet2: readString(ui?.orderSuccessNextBullet2, defaults.orderSuccessNextBullet2),
    orderSuccessNextBullet3: readString(ui?.orderSuccessNextBullet3, defaults.orderSuccessNextBullet3),
    orderSuccessViewOrdersLabel: readString(ui?.orderSuccessViewOrdersLabel, defaults.orderSuccessViewOrdersLabel),
    orderSuccessContinueLabel: readString(ui?.orderSuccessContinueLabel, defaults.orderSuccessContinueLabel),
    orderSuccessBackHomeLabel: readString(ui?.orderSuccessBackHomeLabel, defaults.orderSuccessBackHomeLabel),
    // Payment method labels (shared)
    paymentMethodCash: readString(ui?.paymentMethodCash, defaults.paymentMethodCash),
    paymentMethodTransfer: readString(ui?.paymentMethodTransfer, defaults.paymentMethodTransfer),
    paymentMethodCreditCard: readString(ui?.paymentMethodCreditCard, defaults.paymentMethodCreditCard),
    paymentMethodDebitCard: readString(ui?.paymentMethodDebitCard, defaults.paymentMethodDebitCard),
    paymentMethodMercadopago: readString(ui?.paymentMethodMercadopago, defaults.paymentMethodMercadopago),
    paymentMethodCard: readString(ui?.paymentMethodCard, defaults.paymentMethodCard),
    paymentMethodCheck: readString(ui?.paymentMethodCheck, defaults.paymentMethodCheck),
    paymentMethodOther: readString(ui?.paymentMethodOther, defaults.paymentMethodOther),
    paymentMethodPending: readString(ui?.paymentMethodPending, defaults.paymentMethodPending),
    // Order status labels (shared)
    orderStatusDraft: readString(ui?.orderStatusDraft, defaults.orderStatusDraft),
    orderStatusPendingPayment: readString(ui?.orderStatusPendingPayment, defaults.orderStatusPendingPayment),
    orderStatusPaymentReview: readString(ui?.orderStatusPaymentReview, defaults.orderStatusPaymentReview),
    orderStatusConfirmed: readString(ui?.orderStatusConfirmed, defaults.orderStatusConfirmed),
    orderStatusPreparing: readString(ui?.orderStatusPreparing, defaults.orderStatusPreparing),
    orderStatusReadyToShip: readString(ui?.orderStatusReadyToShip, defaults.orderStatusReadyToShip),
    orderStatusShipped: readString(ui?.orderStatusShipped, defaults.orderStatusShipped),
    orderStatusInTransit: readString(ui?.orderStatusInTransit, defaults.orderStatusInTransit),
    orderStatusOutForDelivery: readString(ui?.orderStatusOutForDelivery, defaults.orderStatusOutForDelivery),
    orderStatusDelivered: readString(ui?.orderStatusDelivered, defaults.orderStatusDelivered),
    orderStatusCompleted: readString(ui?.orderStatusCompleted, defaults.orderStatusCompleted),
    orderStatusCancelled: readString(ui?.orderStatusCancelled, defaults.orderStatusCancelled),
    orderStatusReturnRequested: readString(ui?.orderStatusReturnRequested, defaults.orderStatusReturnRequested),
    orderStatusReturnInTransit: readString(ui?.orderStatusReturnInTransit, defaults.orderStatusReturnInTransit),
    orderStatusReturned: readString(ui?.orderStatusReturned, defaults.orderStatusReturned),
    orderStatusRefunded: readString(ui?.orderStatusRefunded, defaults.orderStatusRefunded),
    // Payment review status labels
    paymentReviewPendingSubmit: readString(ui?.paymentReviewPendingSubmit, defaults.paymentReviewPendingSubmit),
    paymentReviewPendingValidation: readString(ui?.paymentReviewPendingValidation, defaults.paymentReviewPendingValidation),
    paymentReviewInReview: readString(ui?.paymentReviewInReview, defaults.paymentReviewInReview),
    paymentReviewValidated: readString(ui?.paymentReviewValidated, defaults.paymentReviewValidated),
    paymentReviewCancelled: readString(ui?.paymentReviewCancelled, defaults.paymentReviewCancelled),
    paymentReviewInReturn: readString(ui?.paymentReviewInReturn, defaults.paymentReviewInReturn),
    paymentReviewReturned: readString(ui?.paymentReviewReturned, defaults.paymentReviewReturned),
    paymentReviewRefunded: readString(ui?.paymentReviewRefunded, defaults.paymentReviewRefunded),
    // Orders page
    ordersPageTitle: readString(ui?.ordersPageTitle, defaults.ordersPageTitle),
    ordersAuthMessage: readString(ui?.ordersAuthMessage, defaults.ordersAuthMessage),
    ordersBackToProfileLabel: readString(ui?.ordersBackToProfileLabel, defaults.ordersBackToProfileLabel),
    ordersSearchPlaceholder: readString(ui?.ordersSearchPlaceholder, defaults.ordersSearchPlaceholder),
    ordersFilterAllLabel: readString(ui?.ordersFilterAllLabel, defaults.ordersFilterAllLabel),
    ordersFilterPendingLabel: readString(ui?.ordersFilterPendingLabel, defaults.ordersFilterPendingLabel),
    ordersFilterProcessingLabel: readString(ui?.ordersFilterProcessingLabel, defaults.ordersFilterProcessingLabel),
    ordersFilterShippedLabel: readString(ui?.ordersFilterShippedLabel, defaults.ordersFilterShippedLabel),
    ordersFilterDeliveredLabel: readString(ui?.ordersFilterDeliveredLabel, defaults.ordersFilterDeliveredLabel),
    ordersFilterCancelledLabel: readString(ui?.ordersFilterCancelledLabel, defaults.ordersFilterCancelledLabel),
    ordersFilterReturnedLabel: readString(ui?.ordersFilterReturnedLabel, defaults.ordersFilterReturnedLabel),
    ordersLoadingMessage: readString(ui?.ordersLoadingMessage, defaults.ordersLoadingMessage),
    ordersEmptyTitle: readString(ui?.ordersEmptyTitle, defaults.ordersEmptyTitle),
    ordersEmptyBody: readString(ui?.ordersEmptyBody, defaults.ordersEmptyBody),
    ordersEmptyFilterTitle: readString(ui?.ordersEmptyFilterTitle, defaults.ordersEmptyFilterTitle),
    ordersEmptyFilterBody: readString(ui?.ordersEmptyFilterBody, defaults.ordersEmptyFilterBody),
    ordersEmptyExploreLabel: readString(ui?.ordersEmptyExploreLabel, defaults.ordersEmptyExploreLabel),
    ordersViewDetailLabel: readString(ui?.ordersViewDetailLabel, defaults.ordersViewDetailLabel),
    ordersCancelLabel: readString(ui?.ordersCancelLabel, defaults.ordersCancelLabel),
    ordersCancellingLabel: readString(ui?.ordersCancellingLabel, defaults.ordersCancellingLabel),
    ordersTrackingLabel: readString(ui?.ordersTrackingLabel, defaults.ordersTrackingLabel),
    ordersPaymentInformedLabel: readString(ui?.ordersPaymentInformedLabel, defaults.ordersPaymentInformedLabel),
    ordersPaymentInfoBody: readString(ui?.ordersPaymentInfoBody, defaults.ordersPaymentInfoBody),
    ordersItemsCountLabel: readString(ui?.ordersItemsCountLabel, defaults.ordersItemsCountLabel),
    ordersDetailTitle: readString(ui?.ordersDetailTitle, defaults.ordersDetailTitle),
    ordersDetailStatusLabel: readString(ui?.ordersDetailStatusLabel, defaults.ordersDetailStatusLabel),
    ordersDetailDateLabel: readString(ui?.ordersDetailDateLabel, defaults.ordersDetailDateLabel),
    ordersDetailTotalLabel: readString(ui?.ordersDetailTotalLabel, defaults.ordersDetailTotalLabel),
    ordersDetailChannelLabel: readString(ui?.ordersDetailChannelLabel, defaults.ordersDetailChannelLabel),
    ordersDetailNoChannelLabel: readString(ui?.ordersDetailNoChannelLabel, defaults.ordersDetailNoChannelLabel),
    ordersDetailNotesLabel: readString(ui?.ordersDetailNotesLabel, defaults.ordersDetailNotesLabel),
    ordersDetailProductsLabel: readString(ui?.ordersDetailProductsLabel, defaults.ordersDetailProductsLabel),
    ordersDetailQuantityLabel: readString(ui?.ordersDetailQuantityLabel, defaults.ordersDetailQuantityLabel),
    ordersDetailEachLabel: readString(ui?.ordersDetailEachLabel, defaults.ordersDetailEachLabel),
    ordersDetailPaymentStatusLabel: readString(ui?.ordersDetailPaymentStatusLabel, defaults.ordersDetailPaymentStatusLabel),
    ordersDetailStatusHistoryLabel: readString(ui?.ordersDetailStatusHistoryLabel, defaults.ordersDetailStatusHistoryLabel),
    ordersDetailNoHistoryMessage: readString(ui?.ordersDetailNoHistoryMessage, defaults.ordersDetailNoHistoryMessage),
    ordersDetailStorefrontNote: readString(ui?.ordersDetailStorefrontNote, defaults.ordersDetailStorefrontNote),
    // Profile page
    profilePageTitle: readString(ui?.profilePageTitle, defaults.profilePageTitle),
    profileBackLabel: readString(ui?.profileBackLabel, defaults.profileBackLabel),
    profileEditLabel: readString(ui?.profileEditLabel, defaults.profileEditLabel),
    profileSaveLabel: readString(ui?.profileSaveLabel, defaults.profileSaveLabel),
    profileSavingLabel: readString(ui?.profileSavingLabel, defaults.profileSavingLabel),
    profileCancelLabel: readString(ui?.profileCancelLabel, defaults.profileCancelLabel),
    profilePersonalInfoTitle: readString(ui?.profilePersonalInfoTitle, defaults.profilePersonalInfoTitle),
    profileFirstNameLabel: readString(ui?.profileFirstNameLabel, defaults.profileFirstNameLabel),
    profileLastNameLabel: readString(ui?.profileLastNameLabel, defaults.profileLastNameLabel),
    profileEmailLabel: readString(ui?.profileEmailLabel, defaults.profileEmailLabel),
    profilePhoneLabel: readString(ui?.profilePhoneLabel, defaults.profilePhoneLabel),
    profileEmailReadOnly: readString(ui?.profileEmailReadOnly, defaults.profileEmailReadOnly),
    profileNotSpecified: readString(ui?.profileNotSpecified, defaults.profileNotSpecified),
    profileAccountInfoTitle: readString(ui?.profileAccountInfoTitle, defaults.profileAccountInfoTitle),
    profileUsernameLabel: readString(ui?.profileUsernameLabel, defaults.profileUsernameLabel),
    profileStatusLabel: readString(ui?.profileStatusLabel, defaults.profileStatusLabel),
    profileStatusActive: readString(ui?.profileStatusActive, defaults.profileStatusActive),
    profileMemberSinceLabel: readString(ui?.profileMemberSinceLabel, defaults.profileMemberSinceLabel),
    profileActionsTitle: readString(ui?.profileActionsTitle, defaults.profileActionsTitle),
    profileViewOrdersLabel: readString(ui?.profileViewOrdersLabel, defaults.profileViewOrdersLabel),
    profileFavoritesLabel: readString(ui?.profileFavoritesLabel, defaults.profileFavoritesLabel),
    profileLogoutLabel: readString(ui?.profileLogoutLabel, defaults.profileLogoutLabel),
    profileAuthMessage: readString(ui?.profileAuthMessage, defaults.profileAuthMessage),
    // Favorites page
    favoritesPageTitle: readString(ui?.favoritesPageTitle, defaults.favoritesPageTitle),
    favoritesBackLabel: readString(ui?.favoritesBackLabel, defaults.favoritesBackLabel),
    favoritesAuthMessage: readString(ui?.favoritesAuthMessage, defaults.favoritesAuthMessage),
    favoritesAddAllLabel: readString(ui?.favoritesAddAllLabel, defaults.favoritesAddAllLabel),
    favoritesLoadingMessage: readString(ui?.favoritesLoadingMessage, defaults.favoritesLoadingMessage),
    favoritesEmptyTitle: readString(ui?.favoritesEmptyTitle, defaults.favoritesEmptyTitle),
    favoritesEmptyBody: readString(ui?.favoritesEmptyBody, defaults.favoritesEmptyBody),
    favoritesEmptyExploreLabel: readString(ui?.favoritesEmptyExploreLabel, defaults.favoritesEmptyExploreLabel),
    favoritesSearchPlaceholder: readString(ui?.favoritesSearchPlaceholder, defaults.favoritesSearchPlaceholder),
    favoritesNoResultsBody: readString(ui?.favoritesNoResultsBody, defaults.favoritesNoResultsBody),
    favoritesVariantsLabel: readString(ui?.favoritesVariantsLabel, defaults.favoritesVariantsLabel),
    favoritesCountSingular: readString(ui?.favoritesCountSingular, defaults.favoritesCountSingular),
    favoritesCountPlural: readString(ui?.favoritesCountPlural, defaults.favoritesCountPlural),
    // Order tracking page
    trackingPageTitle: readString(ui?.trackingPageTitle, defaults.trackingPageTitle),
    trackingBackLabel: readString(ui?.trackingBackLabel, defaults.trackingBackLabel),
    trackingSubtitle: readString(ui?.trackingSubtitle, defaults.trackingSubtitle),
    trackingWhatsappTitle: readString(ui?.trackingWhatsappTitle, defaults.trackingWhatsappTitle),
    trackingWhatsappBody: readString(ui?.trackingWhatsappBody, defaults.trackingWhatsappBody),
    trackingWhatsappLabel: readString(ui?.trackingWhatsappLabel, defaults.trackingWhatsappLabel),
    trackingHowTitle: readString(ui?.trackingHowTitle, defaults.trackingHowTitle),
    trackingStep1Title: readString(ui?.trackingStep1Title, defaults.trackingStep1Title),
    trackingStep1Body: readString(ui?.trackingStep1Body, defaults.trackingStep1Body),
    trackingStep2Title: readString(ui?.trackingStep2Title, defaults.trackingStep2Title),
    trackingStep2Body: readString(ui?.trackingStep2Body, defaults.trackingStep2Body),
    trackingStep3Title: readString(ui?.trackingStep3Title, defaults.trackingStep3Title),
    trackingStep3Body: readString(ui?.trackingStep3Body, defaults.trackingStep3Body),
    trackingStatusSectionTitle: readString(ui?.trackingStatusSectionTitle, defaults.trackingStatusSectionTitle),
    trackingStatus1Label: readString(ui?.trackingStatus1Label, defaults.trackingStatus1Label),
    trackingStatus1Desc: readString(ui?.trackingStatus1Desc, defaults.trackingStatus1Desc),
    trackingStatus2Label: readString(ui?.trackingStatus2Label, defaults.trackingStatus2Label),
    trackingStatus2Desc: readString(ui?.trackingStatus2Desc, defaults.trackingStatus2Desc),
    trackingStatus3Label: readString(ui?.trackingStatus3Label, defaults.trackingStatus3Label),
    trackingStatus3Desc: readString(ui?.trackingStatus3Desc, defaults.trackingStatus3Desc),
    trackingStatus4Label: readString(ui?.trackingStatus4Label, defaults.trackingStatus4Label),
    trackingStatus4Desc: readString(ui?.trackingStatus4Desc, defaults.trackingStatus4Desc),
    trackingFaqTitle: readString(ui?.trackingFaqTitle, defaults.trackingFaqTitle),
    trackingFaq1Question: readString(ui?.trackingFaq1Question, defaults.trackingFaq1Question),
    trackingFaq1Answer: readString(ui?.trackingFaq1Answer, defaults.trackingFaq1Answer),
    trackingFaq2Question: readString(ui?.trackingFaq2Question, defaults.trackingFaq2Question),
    trackingFaq2Answer: readString(ui?.trackingFaq2Answer, defaults.trackingFaq2Answer),
    trackingFaq3Question: readString(ui?.trackingFaq3Question, defaults.trackingFaq3Question),
    trackingFaq3Answer: readString(ui?.trackingFaq3Answer, defaults.trackingFaq3Answer),
    trackingFaq4Question: readString(ui?.trackingFaq4Question, defaults.trackingFaq4Question),
    trackingFaq4Answer: readString(ui?.trackingFaq4Answer, defaults.trackingFaq4Answer),
    trackingHelpTitle: readString(ui?.trackingHelpTitle, defaults.trackingHelpTitle),
    trackingHelpBody: readString(ui?.trackingHelpBody, defaults.trackingHelpBody),
    trackingHelpCtaLabel: readString(ui?.trackingHelpCtaLabel, defaults.trackingHelpCtaLabel),
    // Contact page
    contactPageTitle: readString(ui?.contactPageTitle, defaults.contactPageTitle),
    contactBackLabel: readString(ui?.contactBackLabel, defaults.contactBackLabel),
    contactSubtitle: readString(ui?.contactSubtitle, defaults.contactSubtitle),
    contactOfficialChannelTitle: readString(ui?.contactOfficialChannelTitle, defaults.contactOfficialChannelTitle),
    contactOfficialChannelBody: readString(ui?.contactOfficialChannelBody, defaults.contactOfficialChannelBody),
    contactWhatsappLabel: readString(ui?.contactWhatsappLabel, defaults.contactWhatsappLabel),
    contactHowHelpTitle: readString(ui?.contactHowHelpTitle, defaults.contactHowHelpTitle),
    contactProductsTitle: readString(ui?.contactProductsTitle, defaults.contactProductsTitle),
    contactProductsBody: readString(ui?.contactProductsBody, defaults.contactProductsBody),
    contactProductsLabel: readString(ui?.contactProductsLabel, defaults.contactProductsLabel),
    contactTrackingTitle: readString(ui?.contactTrackingTitle, defaults.contactTrackingTitle),
    contactTrackingBody: readString(ui?.contactTrackingBody, defaults.contactTrackingBody),
    contactTrackingLabel: readString(ui?.contactTrackingLabel, defaults.contactTrackingLabel),
    contactB2bTitle: readString(ui?.contactB2bTitle, defaults.contactB2bTitle),
    contactB2bBody: readString(ui?.contactB2bBody, defaults.contactB2bBody),
    contactB2bLabel: readString(ui?.contactB2bLabel, defaults.contactB2bLabel),
    contactSupportTitle: readString(ui?.contactSupportTitle, defaults.contactSupportTitle),
    contactSupportBody: readString(ui?.contactSupportBody, defaults.contactSupportBody),
    contactSupportLabel: readString(ui?.contactSupportLabel, defaults.contactSupportLabel),
    contactReturnsTitle: readString(ui?.contactReturnsTitle, defaults.contactReturnsTitle),
    contactReturnsBody: readString(ui?.contactReturnsBody, defaults.contactReturnsBody),
    contactReturnsLabel: readString(ui?.contactReturnsLabel, defaults.contactReturnsLabel),
    // Cart drawer
    cartDrawerEmptyDescription: readString(ui?.cartDrawerEmptyDescription, defaults.cartDrawerEmptyDescription),
    cartDrawerCountSuffix: readString(ui?.cartDrawerCountSuffix, defaults.cartDrawerCountSuffix),
    cartItemRemovedTitle: readString(ui?.cartItemRemovedTitle, defaults.cartItemRemovedTitle),
    cartItemRemovedMessage: readString(ui?.cartItemRemovedMessage, defaults.cartItemRemovedMessage),
    cartClearedTitle: readString(ui?.cartClearedTitle, defaults.cartClearedTitle),
    cartClearedMessage: readString(ui?.cartClearedMessage, defaults.cartClearedMessage),
    cartDrawerSubtotalLabel: readString(ui?.cartDrawerSubtotalLabel, defaults.cartDrawerSubtotalLabel),
    cartDrawerTotalLabel: readString(ui?.cartDrawerTotalLabel, defaults.cartDrawerTotalLabel),
    // Product card notifications
    productOutOfStockNotifTitle: readString(ui?.productOutOfStockNotifTitle, defaults.productOutOfStockNotifTitle),
    productOutOfStockNotifMessage: readString(ui?.productOutOfStockNotifMessage, defaults.productOutOfStockNotifMessage),
    productAddedToFavoritesTitle: readString(ui?.productAddedToFavoritesTitle, defaults.productAddedToFavoritesTitle),
    productAddedToFavoritesMessage: readString(ui?.productAddedToFavoritesMessage, defaults.productAddedToFavoritesMessage),
    productRemovedFromFavoritesTitle: readString(ui?.productRemovedFromFavoritesTitle, defaults.productRemovedFromFavoritesTitle),
    productRemovedFromFavoritesMessage: readString(ui?.productRemovedFromFavoritesMessage, defaults.productRemovedFromFavoritesMessage),
    productLoginForFavoritesTitle: readString(ui?.productLoginForFavoritesTitle, defaults.productLoginForFavoritesTitle),
    productLoginForFavoritesMessage: readString(ui?.productLoginForFavoritesMessage, defaults.productLoginForFavoritesMessage),
    // Product detail notifications
    productVariantRequiredTitle: readString(ui?.productVariantRequiredTitle, defaults.productVariantRequiredTitle),
    productVariantRequiredMessage: readString(ui?.productVariantRequiredMessage, defaults.productVariantRequiredMessage),
    productVariantOutOfStockMessage: readString(ui?.productVariantOutOfStockMessage, defaults.productVariantOutOfStockMessage),
    productSubtotalLabel: readString(ui?.productSubtotalLabel, defaults.productSubtotalLabel),
    productWithVariantsLabel: readString(ui?.productWithVariantsLabel, defaults.productWithVariantsLabel),
    productAvailableUnitsLabel: readString(ui?.productAvailableUnitsLabel, defaults.productAvailableUnitsLabel),
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

function mergeStringMap<T extends Record<string, string>>(raw: unknown, fallback: T): T {
  if (typeof raw !== 'object' || raw === null) return { ...fallback };
  const result: any = { ...fallback };
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === 'string') result[k] = v;
  }
  return result as T;
}

export const getValidationConfig = (): ValidationConfig => {
  const raw = (getConfigRoot() as any).validation || {};
  const dflt = DEFAULT_RUNTIME_CONFIG.validation;
  return {
    passwordMinLength: readNumber(raw.passwordMinLength, dflt.passwordMinLength),
    passwordRequireUppercase: readBoolean(raw.passwordRequireUppercase, dflt.passwordRequireUppercase),
    passwordRequireLowercase: readBoolean(raw.passwordRequireLowercase, dflt.passwordRequireLowercase),
    passwordRequireNumber: readBoolean(raw.passwordRequireNumber, dflt.passwordRequireNumber),
    passwordRequireSymbol: readBoolean(raw.passwordRequireSymbol, dflt.passwordRequireSymbol),
    emailRegex: readString(raw.emailRegex, dflt.emailRegex),
    phoneRegex: readString(raw.phoneRegex, dflt.phoneRegex),
    zipRegex: readString(raw.zipRegex, dflt.zipRegex),
    messages: mergeStringMap(raw.messages, dflt.messages),
  };
};

export const getSeoConfig = (): SeoConfig => {
  const raw = (getConfigRoot() as any).seo || {};
  const dflt = DEFAULT_RUNTIME_CONFIG.seo;
  const org = raw.organization || {};
  const routes: Record<string, SeoMeta> = {};
  if (raw.routes && typeof raw.routes === 'object') {
    for (const [path, meta] of Object.entries(raw.routes as Record<string, any>)) {
      if (meta && typeof meta === 'object') routes[path] = meta as SeoMeta;
    }
  }
  return {
    defaultTitle: readString(raw.defaultTitle, dflt.defaultTitle),
    titleTemplate: readString(raw.titleTemplate, dflt.titleTemplate),
    defaultDescription: readString(raw.defaultDescription, dflt.defaultDescription),
    defaultKeywords: readString(raw.defaultKeywords, dflt.defaultKeywords),
    defaultOgImage: readString(raw.defaultOgImage, dflt.defaultOgImage),
    twitterHandle: readString(raw.twitterHandle, dflt.twitterHandle),
    organization: {
      name: readString(org.name, dflt.organization.name),
      url: readString(org.url, dflt.organization.url),
      logo: readString(org.logo, dflt.organization.logo),
      sameAs: Array.isArray(org.sameAs) ? org.sameAs.filter((s: any) => typeof s === 'string') : dflt.organization.sameAs,
    },
    routes,
    enableJsonLd: readBoolean(raw.enableJsonLd, dflt.enableJsonLd),
    enableProductJsonLd: readBoolean(raw.enableProductJsonLd, dflt.enableProductJsonLd),
  };
};

export const getPagesConfig = (): PagesConfig => {
  const raw = (getConfigRoot() as any).pages;
  if (typeof raw !== 'object' || raw === null) return {};
  const out: PagesConfig = {};
  for (const [key, value] of Object.entries(raw as Record<string, any>)) {
    if (value && typeof value === 'object') (out as any)[key] = value as PageContent;
  }
  return out;
};

export const getPageContent = (key: keyof PagesConfig): PageContent | undefined => {
  return getPagesConfig()[key];
};

export const getAnalyticsConfig = (): AnalyticsConfig => {
  const raw = (getConfigRoot() as any).analytics || {};
  const dflt = DEFAULT_RUNTIME_CONFIG.analytics;
  return {
    enabled: readBoolean(raw.enabled, dflt.enabled),
    ga4MeasurementId: readString(raw.ga4MeasurementId, dflt.ga4MeasurementId),
    gtmContainerId: readString(raw.gtmContainerId, dflt.gtmContainerId),
    facebookPixelId: readString(raw.facebookPixelId, dflt.facebookPixelId),
    hotjarId: readString(raw.hotjarId, dflt.hotjarId),
    clarityId: readString(raw.clarityId, dflt.clarityId),
    anonymizeIp: readBoolean(raw.anonymizeIp, dflt.anonymizeIp),
    trackPageViews: readBoolean(raw.trackPageViews, dflt.trackPageViews),
    trackEcommerce: readBoolean(raw.trackEcommerce, dflt.trackEcommerce),
  };
};

export const getConsentConfig = (): ConsentConfig => {
  const raw = (getConfigRoot() as any).consent || {};
  const dflt = DEFAULT_RUNTIME_CONFIG.consent;
  return {
    enabled: readBoolean(raw.enabled, dflt.enabled),
    title: readString(raw.title, dflt.title),
    body: readString(raw.body, dflt.body),
    acceptLabel: readString(raw.acceptLabel, dflt.acceptLabel),
    rejectLabel: readString(raw.rejectLabel, dflt.rejectLabel),
    preferencesLabel: readString(raw.preferencesLabel, dflt.preferencesLabel),
    learnMoreLabel: readString(raw.learnMoreLabel, dflt.learnMoreLabel),
    learnMoreHref: readString(raw.learnMoreHref, dflt.learnMoreHref),
    storageKey: readString(raw.storageKey, dflt.storageKey),
    blockAnalyticsUntilConsent: readBoolean(raw.blockAnalyticsUntilConsent, dflt.blockAnalyticsUntilConsent),
  };
};

function normalizeMenu(items: any): HeaderMenuItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((it) => {
      if (!it || typeof it !== 'object') return null;
      return {
        label: typeof it.label === 'string' ? it.label : '',
        href: typeof it.href === 'string' ? it.href : '',
        external: !!it.external,
        icon: typeof it.icon === 'string' ? it.icon : undefined,
        children: normalizeMenu(it.children),
      } as HeaderMenuItem;
    })
    .filter(Boolean) as HeaderMenuItem[];
}

export const getHeaderConfig = (): HeaderConfig => {
  const raw = (getConfigRoot() as any).header || {};
  const dflt = DEFAULT_RUNTIME_CONFIG.header;
  return {
    showSearch: readBoolean(raw.showSearch, dflt.showSearch),
    showCategoriesMenu: readBoolean(raw.showCategoriesMenu, dflt.showCategoriesMenu),
    showFavorites: readBoolean(raw.showFavorites, dflt.showFavorites),
    showOrders: readBoolean(raw.showOrders, dflt.showOrders),
    showAccount: readBoolean(raw.showAccount, dflt.showAccount),
    showCart: readBoolean(raw.showCart, dflt.showCart),
    topBarMessage: readString(raw.topBarMessage, dflt.topBarMessage),
    topBarHref: readString(raw.topBarHref, dflt.topBarHref),
    menu: normalizeMenu(raw.menu),
  };
};

function normalizeFooterSections(raw: any): FooterSectionConfig[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) => {
      if (!s || typeof s !== 'object') return null;
      const links = Array.isArray(s.links)
        ? s.links
            .map((l: any) => {
              if (!l || typeof l !== 'object') return null;
              return {
                label: typeof l.label === 'string' ? l.label : '',
                href: typeof l.href === 'string' ? l.href : '',
                external: !!l.external,
              } as FooterLinkItem;
            })
            .filter(Boolean)
        : [];
      return {
        id: typeof s.id === 'string' ? s.id : '',
        title: typeof s.title === 'string' ? s.title : '',
        links: links as FooterLinkItem[],
        fromCategories: !!s.fromCategories,
      } as FooterSectionConfig;
    })
    .filter(Boolean) as FooterSectionConfig[];
}

export const getFooterConfig = (): FooterConfig => {
  const raw = (getConfigRoot() as any).footer || {};
  const dflt = DEFAULT_RUNTIME_CONFIG.footer;
  return {
    sections: normalizeFooterSections(raw.sections),
    showWhatsappCapture: readBoolean(raw.showWhatsappCapture, dflt.showWhatsappCapture),
    whatsappOptInMessage: readString(raw.whatsappOptInMessage, dflt.whatsappOptInMessage),
    whatsappOptInSuccessMessage: readString(raw.whatsappOptInSuccessMessage, dflt.whatsappOptInSuccessMessage),
    withdrawalWhatsappMessage: readString(raw.withdrawalWhatsappMessage, dflt.withdrawalWhatsappMessage),
    paymentMethods: Array.isArray(raw.paymentMethods)
      ? raw.paymentMethods.filter((m: any) => typeof m === 'string' && m.trim().length > 0)
      : [...dflt.paymentMethods],
    showSocial: readBoolean(raw.showSocial, dflt.showSocial),
    showPaymentBadges: readBoolean(raw.showPaymentBadges, dflt.showPaymentBadges),
  };
};

export const getCheckoutConfig = (): CheckoutConfig => {
  const raw = (getConfigRoot() as any).checkout || {};
  const dflt = DEFAULT_RUNTIME_CONFIG.checkout;
  const steps = Array.isArray(raw.steps) && raw.steps.length > 0
    ? (raw.steps.filter((s: any) => s === 'shipping' || s === 'payment' || s === 'review') as Array<'shipping' | 'payment' | 'review'>)
    : [...dflt.steps];
  const fields = Array.isArray(raw.fields)
    ? raw.fields
        .filter((f: any) => f && typeof f.name === 'string')
        .map((f: any) => ({
          name: f.name,
          label: typeof f.label === 'string' ? f.label : f.name,
          placeholder: typeof f.placeholder === 'string' ? f.placeholder : '',
          required: typeof f.required === 'boolean' ? f.required : false,
          visible: typeof f.visible === 'boolean' ? f.visible : true,
          type: typeof f.type === 'string' ? f.type : 'text',
          step: f.step === 'payment' || f.step === 'review' ? f.step : 'shipping',
          group: typeof f.group === 'string' ? f.group : undefined,
          pattern: typeof f.pattern === 'string' ? f.pattern : undefined,
          minLength: typeof f.minLength === 'number' ? f.minLength : undefined,
          maxLength: typeof f.maxLength === 'number' ? f.maxLength : undefined,
          options: Array.isArray(f.options) ? f.options : undefined,
        })) as CheckoutFieldConfig[]
    : [...dflt.fields];
  return {
    steps,
    guestCheckoutEnabled: readBoolean(raw.guestCheckoutEnabled, dflt.guestCheckoutEnabled),
    fields,
    showOrderNotes: readBoolean(raw.showOrderNotes, dflt.showOrderNotes),
    orderNotesLabel: readString(raw.orderNotesLabel, dflt.orderNotesLabel),
    orderNotesPlaceholder: readString(raw.orderNotesPlaceholder, dflt.orderNotesPlaceholder),
    showCouponInput: readBoolean(raw.showCouponInput, dflt.showCouponInput),
    couponPlaceholder: readString(raw.couponPlaceholder, dflt.couponPlaceholder),
    couponApplyLabel: readString(raw.couponApplyLabel, dflt.couponApplyLabel),
  };
};

export const getWishlistConfig = (): WishlistConfig => {
  const raw = (getConfigRoot() as any).wishlist || {};
  const dflt = DEFAULT_RUNTIME_CONFIG.wishlist;
  return {
    enabled: readBoolean(raw.enabled, dflt.enabled),
    storageKey: readString(raw.storageKey, dflt.storageKey),
    requireAuth: readBoolean(raw.requireAuth, dflt.requireAuth),
  };
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
    shipping: getShippingConfig(),
    newsletter: getNewsletterConfig(),
    filters: getFiltersConfig(),
    paymentMethods: getPaymentMethodsConfig(),
    payment: getPaymentConfig(),
    registration: getRegistrationConfig(),
    observability: getObservabilityConfig(),
    validation: getValidationConfig(),
    seo: getSeoConfig(),
    pages: getPagesConfig(),
    analytics: getAnalyticsConfig(),
    consent: getConsentConfig(),
    header: getHeaderConfig(),
    footer: getFooterConfig(),
    checkout: getCheckoutConfig(),
    wishlist: getWishlistConfig(),
    images: getImagesConfig(),
    ui: getUIConfig(),
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
