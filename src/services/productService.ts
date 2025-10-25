/**
 * Servicio para gestión de productos
 */

import { httpClient } from './httpClient';
import { API_ENDPOINTS, ACCOUNT_ID } from '@/config/api';
import type { 
  Product, 
  CreateProductRequest, 
  PaginatedResponse,
  ApiResponse 
} from '@/types/api';

export class ProductService {
  /**
   * Obtener todos los productos
   */
  async getProducts(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    category?: string;
    is_active?: boolean;
    is_featured?: boolean;
  }): Promise<PaginatedResponse<Product>> {
    const url = API_ENDPOINTS.PRODUCTS(ACCOUNT_ID);
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
    const url = API_ENDPOINTS.PRODUCT(ACCOUNT_ID, productId);
    const response = await httpClient.get<ApiResponse<Product>>(url);
    return response.data;
  }

  /**
   * Crear un nuevo producto
   */
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    const url = API_ENDPOINTS.PRODUCTS(ACCOUNT_ID);
    const response = await httpClient.post<ApiResponse<Product>>(url, productData);
    return response.data;
  }

  /**
   * Actualizar un producto
   */
  async updateProduct(productId: string, productData: Partial<CreateProductRequest>): Promise<Product> {
    const url = API_ENDPOINTS.PRODUCT(ACCOUNT_ID, productId);
    const response = await httpClient.put<ApiResponse<Product>>(url, productData);
    return response.data;
  }

  /**
   * Eliminar un producto
   */
  async deleteProduct(productId: string): Promise<void> {
    const url = API_ENDPOINTS.PRODUCT(ACCOUNT_ID, productId);
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
