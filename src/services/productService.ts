/**
 * Servicio para gestión de productos
 */

import { httpClient } from './httpClient';
import { API_ENDPOINTS, getActiveAccountId, getActiveChannel } from '@/config/api';
import { hasPersistedAuthToken } from '@/features/auth/session';
import type { 
  Product, 
  ProductVariant,
  ProductVariantOption,
  PaginatedResponse,
} from '@/types/api';
import log from '@/lib/logger';

interface ProductsListEnvelope {
  data?: Product[];
  pagination?: PaginatedResponse<Product>['pagination'];
}

interface ProductEnvelope {
  success?: boolean;
  data?: Product;
}

const normalizePaginatedProducts = (
  response: unknown,
  params?: { page?: number; per_page?: number },
): PaginatedResponse<Product> => {
  if (Array.isArray(response)) {
    return {
      data: response,
      pagination: {
        page: params?.page ?? 1,
        per_page: params?.per_page ?? response.length,
        total: response.length,
        total_pages: 1,
      },
    };
  }

  if (response && typeof response === 'object') {
    const envelope = response as ProductsListEnvelope;
    if (Array.isArray(envelope.data)) {
      return {
        data: envelope.data,
        pagination: envelope.pagination || {
          page: params?.page ?? 1,
          per_page: params?.per_page ?? envelope.data.length,
          total: envelope.data.length,
          total_pages: 1,
        },
      };
    }
  }

  return {
    data: [],
    pagination: {
      page: params?.page ?? 1,
      per_page: params?.per_page ?? 0,
      total: 0,
      total_pages: 0,
    },
  };
};

const extractProduct = (response: unknown): Product | null => {
  if (response && typeof response === 'object') {
    if ('id' in response) {
      return response as Product;
    }

    const envelope = response as ProductEnvelope;
    if (envelope.data && typeof envelope.data === 'object') {
      return envelope.data;
    }
  }

  return null;
};

export class ProductService {
  private getProductsEndpoint() {
    const accountId = getActiveAccountId();
    return hasPersistedAuthToken()
      ? API_ENDPOINTS.PRODUCTS(accountId)
      : API_ENDPOINTS.PRODUCTS_PUBLIC(accountId);
  }

  /**
   * Obtener todos los productos
   * Usa /products para sesiones autenticadas y /products/public para catálogo anónimo.
   */
  async getProducts(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    category?: string;
    sku?: string;
    name?: string;
    is_active?: boolean;
    is_featured?: boolean;
    in_stock?: boolean;
    channel?: string;
    channels?: string | string[];
    min_price?: number;
    max_price?: number;
    sort_by?: 'name' | 'price' | 'stock' | 'created';
    sort_order?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Product>> {
    log.products.debug('getProducts', params);
    const url = this.getProductsEndpoint();
    const channel = params?.channel || getActiveChannel();
    const response = await httpClient.get<unknown>(url, {
      params: {
        ...params,
        channels: params?.channels || channel,
      }
    });

    return normalizePaginatedProducts(response, params);
  }

  /**
   * Obtener un producto por ID
   */
  async getProduct(productId: string): Promise<Product> {
    log.products.debug('getProduct', productId);
    const url = API_ENDPOINTS.PRODUCT(getActiveAccountId(), productId);
    const response = await httpClient.get<unknown>(url);
    const product = extractProduct(response);

    if (product) {
      return product;
    }

    throw new Error('Producto no encontrado');
  }

  async getProductVariants(productId: string, params?: { status?: string }): Promise<ProductVariant[]> {
    log.products.warn('getProductVariants no está soportado por el contrato activo', { productId, params });
    return [];
  }

  async getProductVariantOptions(productId: string): Promise<ProductVariantOption[]> {
    log.products.warn('getProductVariantOptions no está soportado por el contrato activo', { productId });
    return [];
  }

  async getProductWithVariants(productId: string): Promise<{
    product: Product;
    variants: ProductVariant[];
    variantOptions: ProductVariantOption[];
  }> {
    const product = await this.getProduct(productId);

    if (!product.has_variants) {
      return {
        product,
        variants: [],
        variantOptions: [],
      };
    }

    const [variants, variantOptions] = await Promise.all([
      this.getProductVariants(productId, { status: 'active' }).catch(() => []),
      this.getProductVariantOptions(productId).catch(() => []),
    ]);

    return {
      product,
      variants,
      variantOptions,
    };
  }

  /**
   * Obtener productos destacados
   */
  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    const response = await this.getProducts({
      is_featured: true,
      is_active: true,
      per_page: limit
    });
    return response.data;
  }

  /**
   * Buscar productos
   */
  async searchProducts(query: string, params?: {
    page?: number;
    per_page?: number;
    category?: string;
  }): Promise<PaginatedResponse<Product>> {
    return this.getProducts({
      search: query,
      is_active: true,
      ...params
    });
  }

  /**
   * Obtener productos por categoría
   */
  async getProductsByCategory(category: string, params?: {
    page?: number;
    per_page?: number;
    sort_by?: 'name' | 'price' | 'stock' | 'created';
    sort_order?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Product>> {
    return this.getProducts({
      category,
      is_active: true,
      ...params
    });
  }

  /**
   * Verificar disponibilidad de stock
   */
  async checkStock(productId: string, quantity: number): Promise<boolean> {
    try {
      const product = await this.getProduct(productId);
      return (product.stock_quantity || 0) >= quantity;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener categorías disponibles (basado en metadata de productos)
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await this.getProducts({ per_page: 1000 });
      const categories = new Set<string>();
      
      response.data.forEach(product => {
        if (product.category) {
          categories.add(product.category);
        }
        if (product.metadata?.category) {
          categories.add(product.metadata.category);
        }
      });
      
      return Array.from(categories).sort();
    } catch (error) {
      return [];
    }
  }
}

// Instancia singleton del servicio
export const productService = new ProductService();
