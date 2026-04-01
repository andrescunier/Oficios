import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { hasPersistedAuthToken } from '@/features/auth/session';
import type { PaginatedResponse, Product, ProductVariant, ProductVariantOption } from '@/types/api';
import { withProductImage, withProductImages } from './productImages';

type ProductQueryParams = Parameters<typeof productService.getProducts>[0];

interface ProductWithVariantsPayload {
  product: Product;
  variants: ProductVariant[];
  variantOptions: ProductVariantOption[];
}

const normalizePaginatedProducts = (response: PaginatedResponse<Product>): PaginatedResponse<Product> => ({
  ...response,
  data: withProductImages(response.data),
});

export const catalogQueryKeys = {
  all: ['catalog'] as const,
  authMode: () => (hasPersistedAuthToken() ? 'authenticated' : 'public'),
  products: (params?: ProductQueryParams) => [...catalogQueryKeys.all, 'products', catalogQueryKeys.authMode(), params ?? {}] as const,
  featured: (limit: number) => [...catalogQueryKeys.all, 'featured', catalogQueryKeys.authMode(), limit] as const,
  productDetail: (productId: string) => [...catalogQueryKeys.all, 'product-detail', catalogQueryKeys.authMode(), productId] as const,
};

export const productsQueryOptions = (params?: ProductQueryParams) =>
  queryOptions({
    queryKey: catalogQueryKeys.products(params),
    queryFn: async () => normalizePaginatedProducts(await productService.getProducts(params)),
    placeholderData: keepPreviousData,
  });

export const featuredProductsQueryOptions = (limit: number) =>
  queryOptions({
    queryKey: catalogQueryKeys.featured(limit),
    queryFn: async () => withProductImages(await productService.getFeaturedProducts(limit)),
  });

export const productDetailQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: catalogQueryKeys.productDetail(productId),
    queryFn: async (): Promise<ProductWithVariantsPayload> => {
      const response = await productService.getProductWithVariants(productId);
      return {
        ...response,
        product: withProductImage(response.product),
        variants: response.variants.map((variant) => ({
          ...variant,
          image_url: variant.image_url || response.product.image_url || '/placeholder-product.svg',
        })),
      };
    },
    enabled: Boolean(productId),
  });
