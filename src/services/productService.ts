/**
 * Servicio para gestión de productos
 */

import { httpClient } from './httpClient';
import { API_ENDPOINTS, getActiveAccountId, getActiveChannel } from '@/config/api';
import type { 
  Product, 
  ProductVariant,
  ProductVariantOption,
  CreateProductRequest, 
  PaginatedResponse,
  ApiResponse 
} from '@/types/api';
import log from '@/lib/logger';

export class ProductService {
  /**
   * Obtener todos los productos
   * Soporta todos los parámetros de la API v1.2.1
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
    const url = API_ENDPOINTS.PRODUCTS(getActiveAccountId());
    const channel = params?.channel || getActiveChannel();
    const response: any = await httpClient.get(url, {
      params: {
        ...params,
        channels: params?.channels || channel,
      }
    });

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

    if (response?.data && Array.isArray(response.data)) {
      return response;
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
  }

  /**
   * Obtener un producto por ID
   */
  async getProduct(productId: string): Promise<Product> {
    log.products.debug('getProduct', productId);
    const url = API_ENDPOINTS.PRODUCT(getActiveAccountId(), productId);
    const response: any = await httpClient.get(url);
    
    // La API puede devolver { success, data: {...} } o directamente el producto
    if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      return response.data;
    }
    
    // Si la respuesta es directamente el producto
    if (response?.id) {
      return response;
    }
    
    // Si viene en success/data wrapper
    if (response?.success && response?.data) {
      return response.data;
    }
    
    throw new Error('Producto no encontrado');
  }

  async getProductVariants(productId: string, params?: { status?: string }): Promise<ProductVariant[]> {
    const url = API_ENDPOINTS.PRODUCT_VARIANTS(getActiveAccountId(), productId);
    const response: any = await httpClient.get(url, { params });
    const data = response?.data ?? response;
    return Array.isArray(data) ? data : [];
  }

  async getProductVariantOptions(productId: string): Promise<ProductVariantOption[]> {
    const url = API_ENDPOINTS.PRODUCT_VARIANT_OPTIONS(getActiveAccountId(), productId);
    const response: any = await httpClient.get(url);
    const data = response?.data ?? response;
    return Array.isArray(data) ? data : [];
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
   * Crear un nuevo producto
   */
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    const url = API_ENDPOINTS.PRODUCTS(getActiveAccountId());
    const response = await httpClient.post<ApiResponse<Product>>(url, productData);
    return response.data;
  }

  /**
   * Actualizar un producto
   */
  async updateProduct(productId: string, productData: Partial<CreateProductRequest>): Promise<Product> {
    const url = API_ENDPOINTS.PRODUCT(getActiveAccountId(), productId);
    const response = await httpClient.put<ApiResponse<Product>>(url, productData);
    return response.data;
  }

  /**
   * Eliminar un producto
   */
  async deleteProduct(productId: string): Promise<void> {
    const url = API_ENDPOINTS.PRODUCT(getActiveAccountId(), productId);
    await httpClient.delete(url);
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
   * Obtener productos con stock bajo
   * GET /accounts/{account_id}/products/low-stock
   */
  async getLowStockProducts(params?: {
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<{
    product_id: string;
    sku: string;
    name: string;
    current_stock: number;
    min_stock: number;
    stock_unit: string;
    deficit: number;
  }>> {
    const url = API_ENDPOINTS.PRODUCTS_LOW_STOCK(getActiveAccountId());
    const response: any = await httpClient.get(url, { params });
    
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
    
    return response;
  }

  /**
   * Actualizar stock de un producto
   * PATCH /accounts/{account_id}/products/{product_id}/stock
   */
  async updateStock(productId: string, data: {
    quantity: number;
    operation: 'set' | 'add' | 'subtract';
    reason: string;
    reference?: string;
  }): Promise<Product> {
    const url = API_ENDPOINTS.PRODUCT_STOCK(getActiveAccountId(), productId);
    const response = await httpClient.patch<ApiResponse<Product>>(url, data);
    return response.data;
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
