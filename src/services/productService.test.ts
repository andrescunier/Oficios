import { beforeEach, describe, expect, it, vi } from 'vitest';
import { productService } from './productService';
import { httpClient } from './httpClient';

vi.mock('./httpClient', () => ({
  httpClient: {
    get: vi.fn(),
  },
}));

vi.mock('@/config/runtime', () => ({
  getApiConfig: () => ({
    accountId: 'account-1',
    accountSlug: '',
    channel: 'ecommerce',
    url: 'https://api.example.com',
    extraHeaders: {},
  }),
}));

vi.mock('@/features/auth/session', () => ({
  hasPersistedAuthToken: () => true,
}));

describe('productService variants contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads variants embedded in the product detail response', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      id: 'product-1',
      sku: 'PARENT',
      name: 'Parent product',
      unit_price: 100,
      currency: 'ARS',
      tax_rate: 21,
      status: 'active',
      stock_quantity: 0,
      has_variants: true,
      variants: [
        {
          id: 'variant-1',
          product_id: 'product-1',
          sku: 'PARENT-RED',
          name: 'Red',
          option_values: { Color: 'red' },
          unit_price: 120,
          effective_price: 120,
          stock_quantity: 3,
          stock_min: 0,
          track_inventory: true,
          allow_backorders: false,
          status: 'active',
          position: 1,
          version: 1,
        },
      ],
      variant_options: [
        {
          id: 'option-1',
          product_id: 'product-1',
          name: 'Color',
          position: 1,
          values: [{ value: 'red', label: 'Rojo', position: 1 }],
        },
      ],
    });

    const result = await productService.getProductWithVariants('product-1');

    expect(httpClient.get).toHaveBeenCalledWith('/api/accounts/account-1/products/product-1');
    expect(result.product.has_variants).toBe(true);
    expect(result.variants).toHaveLength(1);
    expect(result.variants[0].sku).toBe('PARENT-RED');
    expect(result.variantOptions[0].name).toBe('Color');
  });
});
