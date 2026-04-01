import type { Product } from '@/types/api';
import { getProductImage, withProductImages } from './productImages';

const baseProduct: Product = {
  id: '1',
  created_at: '',
  updated_at: '',
  sku: 'SKU-1',
  name: 'SSD NVME 1TB',
  unit_price: 100,
  currency: 'ARS',
  tax_rate: 0.21,
};

describe('productImages', () => {
  beforeEach(() => {
    window.__APP_CONFIG__ = {
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
        productFallbacks: {
          default: '/fallback-default.png',
          'ssd-m2': '/fallback-ssd-m2.png',
          gaming: '/fallback-gaming.png',
        },
      },
    };
  });

  it('prioriza image_url cuando existe', () => {
    expect(getProductImage({ ...baseProduct, image_url: '/direct.png' })).toBe('/direct.png');
  });

  it('resuelve fallback específico por tipo de producto', () => {
    expect(getProductImage(baseProduct)).toBe('/fallback-ssd-m2.png');
  });

  it('mapea arrays completos preservando cantidad', () => {
    const products = withProductImages([
      baseProduct,
      { ...baseProduct, id: '2', name: 'Mouse gaming pro' },
    ]);

    expect(products).toHaveLength(2);
    expect(products[0].image_url).toBe('/fallback-ssd-m2.png');
    expect(products[1].image_url).toBe('/fallback-gaming.png');
  });
});
