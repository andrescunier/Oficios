import { BUSINESS } from '@/config/branding';
import { getBusinessConfig, getPaymentMethodsConfig, getShippingConfig } from '@/config/runtime';
import type { CartItem } from '@/types/api';
import type { RegistrationDraft } from '@/features/auth/session';

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
  paymentMethod: 'credit' | 'debit' | 'mercadopago' | 'transferencia' | 'efectivo';
}

export interface CheckoutPayload {
  shippingInfo: ShippingInfo;
  items: Array<{
    product_id: string;
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    sku?: string;
  }>;
  lineItemsMetadata: Array<{
    product_id: string;
    description: string;
    quantity: number;
    unit_price: number;
    variant_id?: string;
    variant_sku?: string;
    product_sku?: string;
    option_values?: Record<string, string>;
    kind?: 'product' | 'shipping';
    hidden?: boolean;
  }>;
  currency: string;
  totalAmount: number;
  paymentMethod: PaymentInfo['paymentMethod'];
  notes: string;
}

interface ShippingChargeLine {
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  sku?: string;
}

interface ShippingChargeMetadata {
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  product_sku?: string;
  kind: 'shipping';
  hidden: true;
}

export const getDefaultPaymentMethod = (): PaymentInfo['paymentMethod'] => {
  const paymentMethods = getPaymentMethodsConfig();
  if (paymentMethods.transferencia) return 'transferencia';
  if (paymentMethods.efectivo) return 'efectivo';
  if (paymentMethods.mercadopago) return 'mercadopago';
  if (paymentMethods.tarjeta) return 'credit';
  return 'transferencia';
};

export const buildInitialShippingInfo = (args: {
  authUser?: { email?: string; person?: { first_name?: string; last_name?: string; phone?: string } } | null;
  registrationDraft?: RegistrationDraft | null;
}): ShippingInfo => ({
  firstName: args.authUser?.person?.first_name || args.registrationDraft?.first_name || '',
  lastName: args.authUser?.person?.last_name || args.registrationDraft?.last_name || '',
  email: args.authUser?.email || '',
  phone: args.authUser?.person?.phone || args.registrationDraft?.phone || '',
  address: args.registrationDraft?.address || '',
  city: args.registrationDraft?.city || '',
  state: args.registrationDraft?.state || '',
  zipCode: args.registrationDraft?.zipCode || '',
  country: BUSINESS.DEFAULT_COUNTRY,
});

export const validateShippingInfo = (shippingInfo: ShippingInfo): { valid: boolean; missingField?: string } => {
  const requiredFields: Array<keyof ShippingInfo> = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'zipCode'];
  const missingField = requiredFields.find((field) => !shippingInfo[field]);
  return {
    valid: !missingField,
    missingField,
  };
};

function resolveShippingCharge(cartSubtotal?: number): {
  lineItem: ShippingChargeLine;
  metadata: ShippingChargeMetadata;
} | null {
  const shipping = getShippingConfig();
  const chargeAmount = Math.max(shipping.chargeAmount, 0);

  if (
    !shipping.enabled ||
    shipping.mode !== 'flat_rate' ||
    chargeAmount <= 0 ||
    !shipping.chargeProductId.trim()
  ) {
    return null;
  }

  // Apply free shipping threshold: if cart subtotal meets or exceeds the threshold, no charge
  const threshold = getBusinessConfig().freeShippingThreshold;
  if (threshold > 0 && cartSubtotal !== undefined && cartSubtotal >= threshold) {
    return null;
  }

  const normalizedTaxRate = shipping.taxRate > 1 ? shipping.taxRate / 100 : shipping.taxRate;

  return {
    lineItem: {
      product_id: shipping.chargeProductId,
      description: shipping.chargeProductDescription,
      quantity: 1,
      unit_price: chargeAmount,
      tax_rate: normalizedTaxRate,
      sku: shipping.chargeProductSku || undefined,
    },
    metadata: {
      product_id: shipping.chargeProductId,
      description: shipping.chargeProductDescription,
      quantity: 1,
      unit_price: chargeAmount,
      product_sku: shipping.chargeProductSku || undefined,
      kind: 'shipping',
      hidden: true,
    },
  };
}

export const getCheckoutShippingCharge = (cartSubtotal?: number): number => {
  return resolveShippingCharge(cartSubtotal)?.lineItem.unit_price || 0;
};

export const buildCheckoutPayload = (args: {
  shippingInfo: ShippingInfo;
  items: CartItem[];
  currency: string;
  totalAmount: number;
  paymentMethod: PaymentInfo['paymentMethod'];
}): CheckoutPayload => {
  const shippingCharge = resolveShippingCharge(args.totalAmount);
  const baseItems = args.items.map((item) => ({
    product_id: item.product.id,
    description: item.variant
      ? `${item.product.name} - ${item.variant.name} (${Object.entries(item.selected_options || {}).map(([key, value]) => `${key}: ${value}`).join(', ')})`
      : item.product.name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    tax_rate: item.product.tax_rate && item.product.tax_rate > 1
      ? item.product.tax_rate / 100
      : (item.product.tax_rate || BUSINESS.DEFAULT_TAX_RATE),
    sku: item.variant?.sku || item.product.sku,
  }));
  const baseMetadata = args.items.map((item) => ({
    product_id: item.product.id,
    description: item.variant ? item.variant.name : item.product.name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    variant_id: item.variant?.id,
    variant_sku: item.variant?.sku,
    product_sku: item.product.sku,
    option_values: item.selected_options,
    kind: 'product' as const,
  }));

  return {
    shippingInfo: args.shippingInfo,
    items: shippingCharge ? [...baseItems, shippingCharge.lineItem] : baseItems,
    lineItemsMetadata: shippingCharge ? [...baseMetadata, shippingCharge.metadata] : baseMetadata,
    currency: args.currency || BUSINESS.DEFAULT_CURRENCY,
    totalAmount: args.totalAmount,
    paymentMethod: args.paymentMethod,
    notes: `Pedido web - ${args.shippingInfo.firstName} ${args.shippingInfo.lastName}`,
  };
};
