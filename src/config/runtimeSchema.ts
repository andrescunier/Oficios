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

const categorySchema = z.object({
  name: z.string().optional(),
  image: z.string().optional(),
  link: z.string().optional(),
  description: z.string().optional(),
  slug: z.string().optional(),
  group: z.string().optional(),
  searchTerms: z.array(z.string()).optional(),
});

const featureBenefitSchema = z.object({
  icon: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
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
  returnPolicyDays: z.string().optional(),
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
  filters: filtersSchema.optional(),
  paymentMethods: paymentMethodsSchema.optional(),
  payment: paymentSchema.optional(),
  observability: observabilitySchema.optional(),
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
