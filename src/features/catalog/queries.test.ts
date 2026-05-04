import { describe, expect, it, vi } from 'vitest';
import { categoryListingQueryOptions } from './queries';
import { productService } from '@/services/productService';

vi.mock('@/features/auth/session', () => ({
  hasPersistedAuthToken: () => false,
}));

vi.mock('@/services/productService', () => ({
  productService: {
    getProducts: vi.fn(),
  },
}));

describe('catalog queries', () => {
  it('envia filtros y paginacion contractuales al backend para categorias', async () => {
    vi.mocked(productService.getProducts).mockResolvedValue({
      data: [],
      pagination: {
        page: 2,
        per_page: 24,
        total: 0,
        total_pages: 0,
      },
    });

    const options = categoryListingQueryOptions({
      category: 'memorias',
      search: 'ddr4',
      page: 2,
      perPage: 24,
      inStock: true,
      sortBy: 'price',
      sortOrder: 'desc',
    });

    await (options.queryFn as () => Promise<unknown>)();

    expect(productService.getProducts).toHaveBeenCalledWith({
      family: undefined,
      category: 'memorias',
      subcategory: undefined,
      search: 'ddr4',
      is_active: true,
      in_stock: true,
      page: 2,
      per_page: 24,
      sort_by: 'price',
      sort_order: 'desc',
    });
  });
});
