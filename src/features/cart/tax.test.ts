import { calculateCartTaxSummary, isProductTaxIncluded } from './tax';
import type { CartItem } from '@/types/api';

const buildItem = (args: {
  unitPrice: number;
  quantity: number;
  taxRate?: number;
  metadata?: Record<string, unknown>;
}): CartItem => ({
  line_id: 'line-1',
  product: {
    id: 'product-1',
    sku: 'SKU-1',
    name: 'Producto',
    unit_price: args.unitPrice,
    currency: 'ARS',
    tax_rate: args.taxRate ?? 0,
    metadata: args.metadata,
  } as any,
  quantity: args.quantity,
  unit_price: args.unitPrice,
  selected_options: {},
} as CartItem);

describe('cart tax helpers', () => {
  it('calcula IVA incluido sin sumarlo al total', () => {
    const item = buildItem({
      unitPrice: 121,
      quantity: 1,
      taxRate: 0.21,
      metadata: { tax_included: true },
    });

    const summary = calculateCartTaxSummary([item], 0, false);

    expect(isProductTaxIncluded(item)).toBe(true);
    expect(summary.includedTaxAmount).toBeCloseTo(21, 2);
    expect(summary.addedTaxAmount).toBe(0);
  });

  it('calcula IVA a sumar cuando no está incluido en el precio', () => {
    const item = buildItem({
      unitPrice: 100,
      quantity: 2,
      taxRate: 0.21,
      metadata: { tax_included: false },
    });

    const summary = calculateCartTaxSummary([item], 0, false);

    expect(isProductTaxIncluded(item)).toBe(false);
    expect(summary.includedTaxAmount).toBe(0);
    expect(summary.addedTaxAmount).toBeCloseTo(42, 2);
    expect(summary.taxableSubtotal).toBe(200);
  });

  it('usa defaultTaxRate como fallback cuando el producto no trae tax_rate', () => {
    const item = buildItem({
      unitPrice: 100,
      quantity: 1,
      metadata: { tax_included: false },
    });

    const summary = calculateCartTaxSummary([item], 0.21, false);

    expect(summary.addedTaxAmount).toBeCloseTo(21, 2);
  });
});
