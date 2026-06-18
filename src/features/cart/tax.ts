import type { CartItem } from '@/types/api';

const normalizeTaxRate = (taxRate: unknown): number => {
  if (typeof taxRate !== 'number' || !Number.isFinite(taxRate) || taxRate <= 0) {
    return 0;
  }

  return taxRate > 1 ? taxRate / 100 : taxRate;
};

const readBooleanFlag = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'si', 'sí'].includes(normalized)) return true;
    if (['false', '0', 'no'].includes(normalized)) return false;
  }
  return null;
};

export const isProductTaxIncluded = (item: CartItem, defaultTaxIncluded = false): boolean => {
  const metadata = item.product?.metadata || {};

  return (
    readBooleanFlag(metadata.tax_included) ??
    readBooleanFlag(metadata.taxIncluded) ??
    readBooleanFlag(metadata.price_includes_tax) ??
    readBooleanFlag(metadata.priceIncludesTax) ??
    defaultTaxIncluded
  );
};

export interface CartTaxSummary {
  includedTaxAmount: number;
  addedTaxAmount: number;
  taxableSubtotal: number;
}

export const calculateCartTaxSummary = (
  items: CartItem[],
  fallbackTaxRate = 0,
  defaultTaxIncluded = false,
): CartTaxSummary => {
  const normalizedFallbackTaxRate = normalizeTaxRate(fallbackTaxRate);

  return items.reduce<CartTaxSummary>((summary, item) => {
    const taxRate = normalizeTaxRate(item.product?.tax_rate) || normalizedFallbackTaxRate;
    const lineTotal = item.unit_price * item.quantity;

    if (taxRate <= 0 || lineTotal <= 0) {
      return summary;
    }

    if (isProductTaxIncluded(item, defaultTaxIncluded)) {
      return {
        ...summary,
        includedTaxAmount: summary.includedTaxAmount + (lineTotal * taxRate) / (1 + taxRate),
      };
    }

    return {
      ...summary,
      taxableSubtotal: summary.taxableSubtotal + lineTotal,
      addedTaxAmount: summary.addedTaxAmount + (lineTotal * taxRate),
    };
  }, {
    includedTaxAmount: 0,
    addedTaxAmount: 0,
    taxableSubtotal: 0,
  });
};

export const calculateIncludedTax = (items: CartItem[]): number => {
  return calculateCartTaxSummary(items, 0, true).includedTaxAmount;
};