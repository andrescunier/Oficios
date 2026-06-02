import type { CartItem } from '@/types/api';

const normalizeTaxRate = (taxRate: unknown): number => {
  if (typeof taxRate !== 'number' || !Number.isFinite(taxRate) || taxRate <= 0) {
    return 0;
  }

  return taxRate > 1 ? taxRate / 100 : taxRate;
};

export const calculateIncludedTax = (items: CartItem[]): number => {
  return items.reduce((sum, item) => {
    const taxRate = normalizeTaxRate(item.product?.tax_rate);
    if (taxRate <= 0) return sum;

    const lineTotal = item.unit_price * item.quantity;
    return sum + (lineTotal * taxRate) / (1 + taxRate);
  }, 0);
};