import { z } from 'zod';
import type { RuntimeConfig } from './runtime';

const heroSlideSchema = z.object({
  image: z.string().optional(),
  mobileImage: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  cta: z.string().optional(),
  link: z.string().optional(),
});

const baseCategorySchema = z.object({
  name: z.string().optional(),
  image: z.string().optional(),
  link: z.string().optional(),
  description: z.string().optional(),
  slug: z.string().optional(),
  group: z.string().optional(),
  searchTerms: z.array(z.string()).optional(),
  productCategories: z.array(z.string()).optional(),
});

const categorySchema: z.ZodType<z.infer<typeof baseCategorySchema> & { subcategories?: z.infer<typeof baseCategorySchema>[] }> = baseCategorySchema.extend({
  subcategories: z.lazy(() => z.array(categorySchema)).optional(),
});

const featureBenefitSchema = z.object({
  icon: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
});

const displayStringSchema = z.preprocess((value) => {
  if (typeof value === 'number') {
    return `${value} dias`;
  }
  return value;
}, z.string().optional());

const shippingSchema = z.object({
  enabled: z.boolean().optional(),
  mode: z.enum(['free', 'flat_rate']).optional(),
  bannerText: z.string().optional(),
  label: z.string().optional(),
  freeLabel: z.string().optional(),
  pendingLabel: z.string().optional(),
  drawerMessage: z.string().optional(),
  chargedMessage: z.string().optional(),
  productBadgeTitle: z.string().optional(),
  productBadgeDescription: z.string().optional(),
  chargeAmount: z.number().optional(),
  chargeProductId: z.string().optional(),
  chargeProductSku: z.string().optional(),
  chargeProductDescription: z.string().optional(),
  taxRate: z.number().optional(),
});

const newsletterSchema = z.object({
  enabled: z.boolean().optional(),
  endpoint: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  buttonLabel: z.string().optional(),
  successMessage: z.string().optional(),
  errorMessage: z.string().optional(),
});

const namedStringMapSchema = z.record(z.string(), z.string()).optional();

const apiSchema = z.object({
  url: z.string().optional(),
  accountId: z.string().optional(),
  accountSlug: z.string().optional(),
  channel: z.string().optional(),
  extraHeaders: z.record(z.string(), z.string()).optional(),
});

const appSchema = z.object({
  name: z.string().optional(),
  companyName: z.string().optional(),
  slogan: z.string().optional(),
  description: z.string().optional(),
  url: z.string().optional(),
  hidePricesForGuests: z.boolean().optional(),
  requireAuthForCart: z.boolean().optional(),
  loginMessage: z.string().optional(),
  loginCta: z.string().optional(),
});

const contactSchema = z.object({
  email: z.string().optional(),
  salesEmail: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
});

const legalSchema = z.object({
  companyName: z.string().optional(),
  cuit: z.string().optional(),
  address: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const businessSchema = z.object({
  defaultTaxRate: z.number().optional(),
  maxQuantityPerProduct: z.number().optional(),
  defaultCurrency: z.string().optional(),
  defaultCountry: z.string().optional(),
  businessHours: z.string().optional(),
  returnPolicyDays: displayStringSchema,
  refundProcessingTime: z.string().optional(),
  productsPerPage: z.number().optional(),
  featuredProductsCount: z.number().optional(),
  heroSliderInterval: z.number().optional(),
  invoiceNote: z.string().optional(),
  freeShippingThreshold: z.number().optional(),
  locale: z.string().optional(),
});

const brandingSchema = z.object({
  logo: z.string().optional(),
  headerLogo: z.string().optional(),
  footerLogo: z.string().optional(),
  logoDark: z.string().optional(),
  favicon: z.string().optional(),
  banner: z.string().optional(),
  ogImage: z.string().optional(),
});

const themeSchema = z.object({
  colorPrimary: z.string().optional(),
  colorPrimaryHover: z.string().optional(),
  colorPrimaryForeground: z.string().optional(),
  colorSecondary: z.string().optional(),
  colorSecondaryForeground: z.string().optional(),
  colorBackground: z.string().optional(),
  colorForeground: z.string().optional(),
  colorSurface: z.string().optional(),
  colorSurfaceForeground: z.string().optional(),
  colorMuted: z.string().optional(),
  colorMutedForeground: z.string().optional(),
  colorBorder: z.string().optional(),
  colorInput: z.string().optional(),
  colorRing: z.string().optional(),
  colorSuccess: z.string().optional(),
  colorWarning: z.string().optional(),
  colorError: z.string().optional(),
  colorAccent: z.string().optional(),
  colorAccentForeground: z.string().optional(),
  fontFamily: z.string().optional(),
  fontUrl: z.string().optional(),
});

const socialSchema = z.object({
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
});

const featuresSchema = z.object({
  notifications: z.boolean().optional(),
  analytics: z.boolean().optional(),
  realPayments: z.boolean().optional(),
  benefits: z.array(featureBenefitSchema).optional(),
});

const registrationFieldSchema = z.object({
  name: z.string(),
  label: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  visible: z.boolean().optional(),
  type: z.string().optional(),
});

const registrationSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  submitLabel: z.string().optional(),
  successMessage: z.string().optional(),
  acceptTermsLabel: z.string().optional(),
  alreadyHaveAccountText: z.string().optional(),
  alreadyHaveAccountLinkText: z.string().optional(),
  fields: z.array(registrationFieldSchema).optional(),
});

const filtersSchema = z.object({
  enabled: z.boolean().optional(),
  capacidad: z.boolean().optional(),
  velocidad: z.boolean().optional(),
  capacidadOptions: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  velocidadOptions: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
});

const paymentMethodsSchema = z.object({
  transferencia: z.boolean().optional(),
  efectivo: z.boolean().optional(),
  mercadopago: z.boolean().optional(),
  tarjeta: z.boolean().optional(),
});

const paymentSchema = z.object({
  bankName: z.string().optional(),
  accountHolder: z.string().optional(),
  cbu: z.string().optional(),
  alias: z.string().optional(),
  whatsappVerification: z.string().optional(),
});

const observabilitySchema = z.object({
  enabled: z.boolean().optional(),
  endpoint: z.string().optional(),
  flushIntervalMs: z.number().optional(),
  maxQueueSize: z.number().optional(),
  useBeacon: z.boolean().optional(),
});

const imagesSchema = z.object({
  heroSlides: z.array(z.union([z.string(), heroSlideSchema])).optional(),
  categories: z.array(categorySchema).optional(),
  placeholders: z.object({
    product: z.string().optional(),
    category: z.string().optional(),
    user: z.string().optional(),
  }).partial().optional(),
  backgrounds: z.object({
    hero: z.string().optional(),
    features: z.string().optional(),
    testimonials: z.string().optional(),
  }).partial().optional(),
  banners: z.object({
    main: z.string().optional(),
    secondary: z.string().optional(),
    seasonal: z.string().optional(),
    sale: z.string().optional(),
  }).partial().optional(),
  productFallbacks: namedStringMapSchema,
});

const validationSchema = z.object({
  passwordMinLength: z.number().optional(),
  passwordRequireUppercase: z.boolean().optional(),
  passwordRequireLowercase: z.boolean().optional(),
  passwordRequireNumber: z.boolean().optional(),
  passwordRequireSymbol: z.boolean().optional(),
  emailRegex: z.string().optional(),
  phoneRegex: z.string().optional(),
  zipRegex: z.string().optional(),
  messages: z.object({
    emailRequired: z.string().optional(),
    emailInvalid: z.string().optional(),
    passwordRequired: z.string().optional(),
    passwordMinLength: z.string().optional(),
    passwordUppercase: z.string().optional(),
    passwordLowercase: z.string().optional(),
    passwordNumber: z.string().optional(),
    passwordSymbol: z.string().optional(),
    passwordsDontMatch: z.string().optional(),
    fieldRequired: z.string().optional(),
    acceptTermsRequired: z.string().optional(),
    phoneInvalid: z.string().optional(),
    zipInvalid: z.string().optional(),
    sessionCleanedTitle: z.string().optional(),
    sessionCleanedMessage: z.string().optional(),
    loginGreeting: z.string().optional(),
    registerSuccessMessage: z.string().optional(),
    loginGenericError: z.string().optional(),
    registerGenericError: z.string().optional(),
    checkoutAuthRequiredMessage: z.string().optional(),
    checkoutFieldRequiredTitle: z.string().optional(),
    checkoutFieldRequiredTemplate: z.string().optional(),
  }).partial().optional(),
});

const seoMetaSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  ogType: z.string().optional(),
  twitterCard: z.string().optional(),
  canonical: z.string().optional(),
  noindex: z.boolean().optional(),
}).partial();

const seoSchema = z.object({
  defaultTitle: z.string().optional(),
  titleTemplate: z.string().optional(),
  defaultDescription: z.string().optional(),
  defaultKeywords: z.string().optional(),
  defaultOgImage: z.string().optional(),
  twitterHandle: z.string().optional(),
  organization: z.object({
    name: z.string().optional(),
    url: z.string().optional(),
    logo: z.string().optional(),
    sameAs: z.array(z.string()).optional(),
  }).partial().optional(),
  routes: z.record(z.string(), seoMetaSchema).optional(),
  enableJsonLd: z.boolean().optional(),
  enableProductJsonLd: z.boolean().optional(),
});

const pageBlockSchema = z.object({
  type: z.string().optional(),
  variant: z.string().optional(),
  icon: z.string().optional(),
  iconColor: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  html: z.string().optional(),
  items: z.array(z.any()).optional(),
  href: z.string().optional(),
  label: z.string().optional(),
  image: z.string().optional(),
}).partial();

const pageContentSchema = z.object({
  enabled: z.boolean().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  heroVariant: z.string().optional(),
  heroImage: z.string().optional(),
  blocks: z.array(pageBlockSchema).optional(),
  ctaPrimaryLabel: z.string().optional(),
  ctaPrimaryHref: z.string().optional(),
  ctaSecondaryLabel: z.string().optional(),
  ctaSecondaryHref: z.string().optional(),
  ctaTitle: z.string().optional(),
  ctaSubtitle: z.string().optional(),
  lastUpdated: z.string().optional(),
}).partial();

const pagesSchema = z.object({
  about: pageContentSchema.optional(),
  contact: pageContentSchema.optional(),
  cookies: pageContentSchema.optional(),
  terms: pageContentSchema.optional(),
  privacy: pageContentSchema.optional(),
  returns: pageContentSchema.optional(),
  warranty: pageContentSchema.optional(),
  legalNotice: pageContentSchema.optional(),
  notFound: pageContentSchema.optional(),
}).partial();

const analyticsSchema = z.object({
  enabled: z.boolean().optional(),
  ga4MeasurementId: z.string().optional(),
  gtmContainerId: z.string().optional(),
  facebookPixelId: z.string().optional(),
  hotjarId: z.string().optional(),
  clarityId: z.string().optional(),
  anonymizeIp: z.boolean().optional(),
  trackPageViews: z.boolean().optional(),
  trackEcommerce: z.boolean().optional(),
});

const consentSchema = z.object({
  enabled: z.boolean().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  acceptLabel: z.string().optional(),
  rejectLabel: z.string().optional(),
  preferencesLabel: z.string().optional(),
  learnMoreLabel: z.string().optional(),
  learnMoreHref: z.string().optional(),
  storageKey: z.string().optional(),
  blockAnalyticsUntilConsent: z.boolean().optional(),
});

const headerMenuItemSchema: z.ZodType<{ label?: string; href?: string; external?: boolean; icon?: string; children?: any[] }> = z.lazy(() =>
  z.object({
    label: z.string().optional(),
    href: z.string().optional(),
    external: z.boolean().optional(),
    icon: z.string().optional(),
    children: z.array(headerMenuItemSchema).optional(),
  }).partial(),
);

const headerSchema = z.object({
  showSearch: z.boolean().optional(),
  showCategoriesMenu: z.boolean().optional(),
  showFavorites: z.boolean().optional(),
  showOrders: z.boolean().optional(),
  showAccount: z.boolean().optional(),
  showCart: z.boolean().optional(),
  topBarMessage: z.string().optional(),
  topBarHref: z.string().optional(),
  menu: z.array(headerMenuItemSchema).optional(),
}).partial();

const footerLinkSchema = z.object({
  label: z.string().optional(),
  href: z.string().optional(),
  external: z.boolean().optional(),
}).partial();

const footerSectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  links: z.array(footerLinkSchema).optional(),
  fromCategories: z.boolean().optional(),
}).partial();

const footerSchema = z.object({
  sections: z.array(footerSectionSchema).optional(),
  showWhatsappCapture: z.boolean().optional(),
  whatsappOptInMessage: z.string().optional(),
  whatsappOptInSuccessMessage: z.string().optional(),
  withdrawalWhatsappMessage: z.string().optional(),
  paymentMethods: z.array(z.string()).optional(),
  showSocial: z.boolean().optional(),
  showPaymentBadges: z.boolean().optional(),
}).partial();

const checkoutFieldSchema = z.object({
  name: z.string(),
  label: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  visible: z.boolean().optional(),
  type: z.string().optional(),
  step: z.enum(['shipping', 'payment', 'review']).optional(),
  group: z.string().optional(),
  pattern: z.string().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
});

const checkoutSchema = z.object({
  steps: z.array(z.enum(['shipping', 'payment', 'review'])).optional(),
  guestCheckoutEnabled: z.boolean().optional(),
  fields: z.array(checkoutFieldSchema).optional(),
  showOrderNotes: z.boolean().optional(),
  orderNotesLabel: z.string().optional(),
  orderNotesPlaceholder: z.string().optional(),
  showCouponInput: z.boolean().optional(),
  couponPlaceholder: z.string().optional(),
  couponApplyLabel: z.string().optional(),
}).partial();

const wishlistSchema = z.object({
  enabled: z.boolean().optional(),
  storageKey: z.string().optional(),
  requireAuth: z.boolean().optional(),
}).partial();

const runtimeConfigSchema = z.object({
  api: apiSchema.optional(),
  cdnBaseUrl: z.string().optional(),
  app: appSchema.optional(),
  contact: contactSchema.optional(),
  legal: legalSchema.optional(),
  business: businessSchema.optional(),
  branding: brandingSchema.optional(),
  theme: themeSchema.optional(),
  social: socialSchema.optional(),
  features: featuresSchema.optional(),
  shipping: shippingSchema.optional(),
  newsletter: newsletterSchema.optional(),
  filters: filtersSchema.optional(),
  paymentMethods: paymentMethodsSchema.optional(),
  payment: paymentSchema.optional(),
  observability: observabilitySchema.optional(),
  registration: registrationSchema.optional(),
  validation: validationSchema.optional(),
  seo: seoSchema.optional(),
  pages: pagesSchema.optional(),
  analytics: analyticsSchema.optional(),
  consent: consentSchema.optional(),
  header: headerSchema.optional(),
  footer: footerSchema.optional(),
  checkout: checkoutSchema.optional(),
  wishlist: wishlistSchema.optional(),
  ui: z.object({
    // Search & product listing
    searchPlaceholder: z.string().optional(),
    noProductsTitle: z.string().optional(),
    noProductsMessage: z.string().optional(),
    alreadyHaveAccountText: z.string().optional(),

    // Home page sections
    homeCategoriesTitle: z.string().optional(),
    homeCategoriesSubtitle: z.string().optional(),
    showHomeCategoriesHeader: z.boolean().optional(),
    homeCategoriesPerView: z.number().optional(),
    homeCategoriesSidePadding: z.number().optional(),
    showHomeBenefits: z.boolean().optional(),
    homeFeaturedTitle: z.string().optional(),
    homeFeaturedSubtitle: z.string().optional(),
    homeNewTitle: z.string().optional(),
    homeNewSubtitle: z.string().optional(),
    homeSaleTitle: z.string().optional(),
    homeSaleSubtitle: z.string().optional(),
    homeViewAllLabel: z.string().optional(),

    // Header navigation
    headerCategoriesLabel: z.string().optional(),
    headerAllProductsLabel: z.string().optional(),
    headerLoginLabel: z.string().optional(),
    headerRegisterLabel: z.string().optional(),
    headerMyProfileLabel: z.string().optional(),
    headerMyOrdersLabel: z.string().optional(),
    headerFavoritesLabel: z.string().optional(),
    headerLogoutLabel: z.string().optional(),

    // Footer
    footerWhatsappTitle: z.string().optional(),
    footerWhatsappBody: z.string().optional(),
    footerWhatsappPlaceholder: z.string().optional(),
    footerWhatsappButton: z.string().optional(),
    footerCopyrightSuffix: z.string().optional(),
    footerPaymentMethodsLabel: z.string().optional(),

    // Cart drawer
    cartTitle: z.string().optional(),
    cartEmptyTitle: z.string().optional(),
    cartEmptyBody: z.string().optional(),
    cartEmptyExploreLabel: z.string().optional(),
    cartProceedAuthLabel: z.string().optional(),
    cartProceedGuestLabel: z.string().optional(),
    cartClearLabel: z.string().optional(),

    // Auth gates
    authRequiredTitle: z.string().optional(),
    authLoginButtonLabel: z.string().optional(),
    authRegisterButtonLabel: z.string().optional(),

    // Login page
    loginTitle: z.string().optional(),
    loginSubtitle: z.string().optional(),
    loginEmailLabel: z.string().optional(),
    loginEmailPlaceholder: z.string().optional(),
    loginPasswordLabel: z.string().optional(),
    loginPasswordPlaceholder: z.string().optional(),
    loginForgotPasswordLabel: z.string().optional(),
    loginForgotPasswordMessage: z.string().optional(),
    loginSubmitLabel: z.string().optional(),
    loginLoadingLabel: z.string().optional(),
    loginNoAccountText: z.string().optional(),
    loginNoAccountLinkText: z.string().optional(),
    loginClearSessionLabel: z.string().optional(),
    loginSuccessTitle: z.string().optional(),
    loginErrorTitle: z.string().optional(),
    loginSessionExpiredMessage: z.string().optional(),

    // Register page
    registerLoadingLabel: z.string().optional(),
    registerSuccessTitle: z.string().optional(),
    registerErrorTitle: z.string().optional(),
    passwordValidationLength: z.string().optional(),
    passwordValidationUppercase: z.string().optional(),
    passwordValidationLowercase: z.string().optional(),
    passwordValidationNumber: z.string().optional(),

    // Product detail page
    productNotFoundTitle: z.string().optional(),
    productNotFoundBody: z.string().optional(),
    productViewAllLabel: z.string().optional(),
    productBackLabel: z.string().optional(),
    productBreadcrumbHome: z.string().optional(),
    productBreadcrumbProducts: z.string().optional(),
    productDescriptionLabel: z.string().optional(),
    productVariantLabel: z.string().optional(),
    productNoVariantMessage: z.string().optional(),
    productAvailabilityLabel: z.string().optional(),
    productOutOfStockLabel: z.string().optional(),
    productAddToCartLabel: z.string().optional(),
    productSelectVariantLabel: z.string().optional(),
    productBuySecureTitle: z.string().optional(),
    productBuySecureDesc: z.string().optional(),
    productBuySecureIcon: z.string().optional(),
    productShippingBadgeIcon: z.string().optional(),
    productMultiplePaymentsTitle: z.string().optional(),
    productMultiplePaymentsDesc: z.string().optional(),
    productMultiplePaymentsIcon: z.string().optional(),
    headerPromoMessages: z.array(z.string()).optional(),

    // Cart page (full page)
    cartPageTitle: z.string().optional(),
    cartPageContinueShopping: z.string().optional(),
    cartPageItemsLabel: z.string().optional(),
    cartPageClearCartLabel: z.string().optional(),
    cartPageProductSingular: z.string().optional(),
    cartPageProductPlural: z.string().optional(),
    cartPageSubtotalLabel: z.string().optional(),
    cartPageShippingLabel: z.string().optional(),
    cartPageTotalLabel: z.string().optional(),
    cartPageCheckoutLabel: z.string().optional(),
    cartPageSSLBadge: z.string().optional(),
    cartPageSSLDesc: z.string().optional(),
    cartPageShippingBadge: z.string().optional(),
    cartPageShippingDesc: z.string().optional(),

    // Checkout page
    checkoutTitle: z.string().optional(),
    checkoutBackLabel: z.string().optional(),
    checkoutStepShipping: z.string().optional(),
    checkoutStepPayment: z.string().optional(),
    checkoutStepReview: z.string().optional(),
    checkoutShippingTitle: z.string().optional(),
    checkoutPaymentTitle: z.string().optional(),
    checkoutReviewTitle: z.string().optional(),
    checkoutAddressTitle: z.string().optional(),
    checkoutAccountDataTitle: z.string().optional(),
    checkoutFieldFirst: z.string().optional(),
    checkoutFieldLast: z.string().optional(),
    checkoutFieldEmail: z.string().optional(),
    checkoutFieldPhone: z.string().optional(),
    checkoutFieldAddress: z.string().optional(),
    checkoutFieldCity: z.string().optional(),
    checkoutFieldState: z.string().optional(),
    checkoutFieldZip: z.string().optional(),
    checkoutContinueToPayment: z.string().optional(),
    checkoutPaymentMethodLabel: z.string().optional(),
    checkoutTransferLabel: z.string().optional(),
    checkoutTransferDesc: z.string().optional(),
    checkoutTransferInfoTitle: z.string().optional(),
    checkoutEfectivoLabel: z.string().optional(),
    checkoutEfectivoDesc: z.string().optional(),
    checkoutEfectivoInfoTitle: z.string().optional(),
    checkoutFinalizeLabel: z.string().optional(),
    checkoutFinalizingLabel: z.string().optional(),
    checkoutBackButton: z.string().optional(),
    checkoutCartEmptyTitle: z.string().optional(),
    checkoutCartEmptyMsg: z.string().optional(),
    checkoutViewProductsLabel: z.string().optional(),
    checkoutSubtotalLabel: z.string().optional(),
    checkoutShippingLabel: z.string().optional(),
    checkoutTotalLabel: z.string().optional(),
    checkoutOrderTitle: z.string().optional(),
    checkoutBankLabel: z.string().optional(),
    checkoutHolderLabel: z.string().optional(),
    checkoutCbuLabel: z.string().optional(),
    checkoutAliasLabel: z.string().optional(),
    checkoutTransferImportantNote: z.string().optional(),
    checkoutEfectivoNote: z.string().optional(),

    // Footer sections
    footerCompanyTitle: z.string().optional(),
    footerCustomerServiceTitle: z.string().optional(),
    footerCategoriesTitle: z.string().optional(),
    footerLegalTitle: z.string().optional(),
    footerCompanyAboutLabel: z.string().optional(),
    footerCustomerHelpLabel: z.string().optional(),
    footerCustomerTrackingLabel: z.string().optional(),
    footerCustomerReturnsLabel: z.string().optional(),
    footerCustomerWarrantyLabel: z.string().optional(),
    footerLegalTermsLabel: z.string().optional(),
    footerLegalPrivacyLabel: z.string().optional(),
    footerLegalCookiesLabel: z.string().optional(),
    footerLegalNoticeLabel: z.string().optional(),
    footerLegalWithdrawalLabel: z.string().optional(),

    // Registration success page
    registrationSuccessTitle: z.string().optional(),
    registrationSuccessSubtitle: z.string().optional(),
    registrationSuccessReadyTitle: z.string().optional(),
    registrationSuccessBullet1: z.string().optional(),
    registrationSuccessBullet2: z.string().optional(),
    registrationSuccessBullet3: z.string().optional(),
    registrationSuccessBullet4: z.string().optional(),
    registrationSuccessViewProductsLabel: z.string().optional(),
    registrationSuccessHomeLabel: z.string().optional(),
    // Order success page
    orderSuccessTitle: z.string().optional(),
    orderSuccessSubtitle: z.string().optional(),
    orderSuccessOrderNumberLabel: z.string().optional(),
    orderSuccessPaymentMethodLabel: z.string().optional(),
    orderSuccessPaymentPendingLabel: z.string().optional(),
    orderSuccessEmailLabel: z.string().optional(),
    orderSuccessTotalLabel: z.string().optional(),
    orderSuccessNextTitle: z.string().optional(),
    orderSuccessNextBullet1: z.string().optional(),
    orderSuccessNextBullet2: z.string().optional(),
    orderSuccessNextBullet3: z.string().optional(),
    orderSuccessViewOrdersLabel: z.string().optional(),
    orderSuccessContinueLabel: z.string().optional(),
    orderSuccessBackHomeLabel: z.string().optional(),
    // Payment method labels
    paymentMethodCash: z.string().optional(),
    paymentMethodTransfer: z.string().optional(),
    paymentMethodCreditCard: z.string().optional(),
    paymentMethodDebitCard: z.string().optional(),
    paymentMethodMercadopago: z.string().optional(),
    paymentMethodCard: z.string().optional(),
    paymentMethodCheck: z.string().optional(),
    paymentMethodOther: z.string().optional(),
    paymentMethodPending: z.string().optional(),
    // Order status labels
    orderStatusDraft: z.string().optional(),
    orderStatusPendingPayment: z.string().optional(),
    orderStatusPaymentReview: z.string().optional(),
    orderStatusConfirmed: z.string().optional(),
    orderStatusPreparing: z.string().optional(),
    orderStatusReadyToShip: z.string().optional(),
    orderStatusShipped: z.string().optional(),
    orderStatusInTransit: z.string().optional(),
    orderStatusOutForDelivery: z.string().optional(),
    orderStatusDelivered: z.string().optional(),
    orderStatusCompleted: z.string().optional(),
    orderStatusCancelled: z.string().optional(),
    orderStatusReturnRequested: z.string().optional(),
    orderStatusReturnInTransit: z.string().optional(),
    orderStatusReturned: z.string().optional(),
    orderStatusRefunded: z.string().optional(),
    // Payment review status labels
    paymentReviewPendingSubmit: z.string().optional(),
    paymentReviewPendingValidation: z.string().optional(),
    paymentReviewInReview: z.string().optional(),
    paymentReviewValidated: z.string().optional(),
    paymentReviewCancelled: z.string().optional(),
    paymentReviewInReturn: z.string().optional(),
    paymentReviewReturned: z.string().optional(),
    paymentReviewRefunded: z.string().optional(),
    // Orders page
    ordersPageTitle: z.string().optional(),
    ordersAuthMessage: z.string().optional(),
    ordersBackToProfileLabel: z.string().optional(),
    ordersSearchPlaceholder: z.string().optional(),
    ordersFilterAllLabel: z.string().optional(),
    ordersFilterPendingLabel: z.string().optional(),
    ordersFilterProcessingLabel: z.string().optional(),
    ordersFilterShippedLabel: z.string().optional(),
    ordersFilterDeliveredLabel: z.string().optional(),
    ordersFilterCancelledLabel: z.string().optional(),
    ordersFilterReturnedLabel: z.string().optional(),
    ordersLoadingMessage: z.string().optional(),
    ordersEmptyTitle: z.string().optional(),
    ordersEmptyBody: z.string().optional(),
    ordersEmptyFilterTitle: z.string().optional(),
    ordersEmptyFilterBody: z.string().optional(),
    ordersEmptyExploreLabel: z.string().optional(),
    ordersViewDetailLabel: z.string().optional(),
    ordersCancelLabel: z.string().optional(),
    ordersCancellingLabel: z.string().optional(),
    ordersTrackingLabel: z.string().optional(),
    ordersPaymentInformedLabel: z.string().optional(),
    ordersPaymentInfoBody: z.string().optional(),
    ordersItemsCountLabel: z.string().optional(),
    ordersDetailTitle: z.string().optional(),
    ordersDetailStatusLabel: z.string().optional(),
    ordersDetailDateLabel: z.string().optional(),
    ordersDetailTotalLabel: z.string().optional(),
    ordersDetailChannelLabel: z.string().optional(),
    ordersDetailNoChannelLabel: z.string().optional(),
    ordersDetailNotesLabel: z.string().optional(),
    ordersDetailProductsLabel: z.string().optional(),
    ordersDetailQuantityLabel: z.string().optional(),
    ordersDetailEachLabel: z.string().optional(),
    ordersDetailPaymentStatusLabel: z.string().optional(),
    ordersDetailStatusHistoryLabel: z.string().optional(),
    ordersDetailNoHistoryMessage: z.string().optional(),
    ordersDetailStorefrontNote: z.string().optional(),
    // Profile page
    profilePageTitle: z.string().optional(),
    profileBackLabel: z.string().optional(),
    profileEditLabel: z.string().optional(),
    profileSaveLabel: z.string().optional(),
    profileSavingLabel: z.string().optional(),
    profileCancelLabel: z.string().optional(),
    profilePersonalInfoTitle: z.string().optional(),
    profileFirstNameLabel: z.string().optional(),
    profileLastNameLabel: z.string().optional(),
    profileEmailLabel: z.string().optional(),
    profilePhoneLabel: z.string().optional(),
    profileEmailReadOnly: z.string().optional(),
    profileNotSpecified: z.string().optional(),
    profileAccountInfoTitle: z.string().optional(),
    profileUsernameLabel: z.string().optional(),
    profileStatusLabel: z.string().optional(),
    profileStatusActive: z.string().optional(),
    profileMemberSinceLabel: z.string().optional(),
    profileActionsTitle: z.string().optional(),
    profileViewOrdersLabel: z.string().optional(),
    profileFavoritesLabel: z.string().optional(),
    profileLogoutLabel: z.string().optional(),
    profileAuthMessage: z.string().optional(),
    // Favorites page
    favoritesPageTitle: z.string().optional(),
    favoritesBackLabel: z.string().optional(),
    favoritesAuthMessage: z.string().optional(),
    favoritesAddAllLabel: z.string().optional(),
    favoritesLoadingMessage: z.string().optional(),
    favoritesEmptyTitle: z.string().optional(),
    favoritesEmptyBody: z.string().optional(),
    favoritesEmptyExploreLabel: z.string().optional(),
    favoritesSearchPlaceholder: z.string().optional(),
    favoritesNoResultsBody: z.string().optional(),
    favoritesVariantsLabel: z.string().optional(),
    favoritesCountSingular: z.string().optional(),
    favoritesCountPlural: z.string().optional(),
    // Order tracking page
    trackingPageTitle: z.string().optional(),
    trackingBackLabel: z.string().optional(),
    trackingSubtitle: z.string().optional(),
    trackingWhatsappTitle: z.string().optional(),
    trackingWhatsappBody: z.string().optional(),
    trackingWhatsappLabel: z.string().optional(),
    trackingHowTitle: z.string().optional(),
    trackingStep1Title: z.string().optional(),
    trackingStep1Body: z.string().optional(),
    trackingStep2Title: z.string().optional(),
    trackingStep2Body: z.string().optional(),
    trackingStep3Title: z.string().optional(),
    trackingStep3Body: z.string().optional(),
    trackingStatusSectionTitle: z.string().optional(),
    trackingStatus1Label: z.string().optional(),
    trackingStatus1Desc: z.string().optional(),
    trackingStatus2Label: z.string().optional(),
    trackingStatus2Desc: z.string().optional(),
    trackingStatus3Label: z.string().optional(),
    trackingStatus3Desc: z.string().optional(),
    trackingStatus4Label: z.string().optional(),
    trackingStatus4Desc: z.string().optional(),
    trackingFaqTitle: z.string().optional(),
    trackingFaq1Question: z.string().optional(),
    trackingFaq1Answer: z.string().optional(),
    trackingFaq2Question: z.string().optional(),
    trackingFaq2Answer: z.string().optional(),
    trackingFaq3Question: z.string().optional(),
    trackingFaq3Answer: z.string().optional(),
    trackingFaq4Question: z.string().optional(),
    trackingFaq4Answer: z.string().optional(),
    trackingHelpTitle: z.string().optional(),
    trackingHelpBody: z.string().optional(),
    trackingHelpCtaLabel: z.string().optional(),
    // Contact page
    contactPageTitle: z.string().optional(),
    contactBackLabel: z.string().optional(),
    contactSubtitle: z.string().optional(),
    contactOfficialChannelTitle: z.string().optional(),
    contactOfficialChannelBody: z.string().optional(),
    contactWhatsappLabel: z.string().optional(),
    contactHowHelpTitle: z.string().optional(),
    contactProductsTitle: z.string().optional(),
    contactProductsBody: z.string().optional(),
    contactProductsLabel: z.string().optional(),
    contactTrackingTitle: z.string().optional(),
    contactTrackingBody: z.string().optional(),
    contactTrackingLabel: z.string().optional(),
    contactB2bTitle: z.string().optional(),
    contactB2bBody: z.string().optional(),
    contactB2bLabel: z.string().optional(),
    contactSupportTitle: z.string().optional(),
    contactSupportBody: z.string().optional(),
    contactSupportLabel: z.string().optional(),
    contactReturnsTitle: z.string().optional(),
    contactReturnsBody: z.string().optional(),
    contactReturnsLabel: z.string().optional(),
    // Cart drawer
    cartDrawerEmptyDescription: z.string().optional(),
    cartDrawerCountSuffix: z.string().optional(),
    cartItemRemovedTitle: z.string().optional(),
    cartItemRemovedMessage: z.string().optional(),
    cartClearedTitle: z.string().optional(),
    cartClearedMessage: z.string().optional(),
    cartDrawerSubtotalLabel: z.string().optional(),
    cartDrawerTotalLabel: z.string().optional(),
    // Product card notifications
    productOutOfStockNotifTitle: z.string().optional(),
    productOutOfStockNotifMessage: z.string().optional(),
    productAddedToFavoritesTitle: z.string().optional(),
    productAddedToFavoritesMessage: z.string().optional(),
    productRemovedFromFavoritesTitle: z.string().optional(),
    productRemovedFromFavoritesMessage: z.string().optional(),
    productLoginForFavoritesTitle: z.string().optional(),
    productLoginForFavoritesMessage: z.string().optional(),
    // Product detail notifications
    productVariantRequiredTitle: z.string().optional(),
    productVariantRequiredMessage: z.string().optional(),
    productVariantOutOfStockMessage: z.string().optional(),
    productSubtotalLabel: z.string().optional(),
    productWithVariantsLabel: z.string().optional(),
    productAvailableUnitsLabel: z.string().optional(),
  }).optional(),
  images: imagesSchema.optional(),
});

export type RuntimeConfigPayload = Partial<RuntimeConfig>;

export function parseRuntimeConfigPayload(payload: unknown): RuntimeConfigPayload | null {
  const parsed = runtimeConfigSchema.safeParse(payload);
  if (!parsed.success) {
    return null;
  }

  return parsed.data as RuntimeConfigPayload;
}

export function getRuntimeConfigValidationErrors(payload: unknown): string[] {
  const parsed = runtimeConfigSchema.safeParse(payload);
  if (parsed.success) {
    return [];
  }

  return parsed.error.issues.map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`);
}
