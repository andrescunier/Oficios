/**
 * Servicio de carrito para DIAP - Integración con API real
 */

import type { CartItem, Product } from '@/types/api';
import { httpClient } from './httpClient';
import { API_ENDPOINTS, ACCOUNT_ID } from '@/config/api';

export interface CartSyncRequest {
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
  currency: string;
}

export interface CartSyncResponse {
  success: boolean;
  message: string;
  data: {
    cart_id: string;
    items: CartItem[];
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    currency: string;
    updated_at: string;
  };
  error_details?: any;
}

export interface QuoteRequest {
  customer_id: string;
  items: {
    product_id: string;
    quantity: number;
  }[];
  currency: string;
}

export interface QuoteResponse {
  success: boolean;
  message: string;
  data: {
    quote_id: string;
    items: {
      product_id: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      availability: boolean;
      estimated_delivery?: string;
    }[];
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    currency: string;
    valid_until: string;
  };
  error_details?: any;
}

export class CartService {
  /**
   * Sincronizar carrito local con el servidor
   */
  async syncCart(items: CartItem[], currency: string = 'ARS'): Promise<CartSyncResponse> {
    try {
      const cartData: CartSyncRequest = {
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unit_price
        })),
        currency
      };

      const response = await httpClient.post<CartSyncResponse>(
        `/api/accounts/${ACCOUNT_ID}/cart/sync`,
        cartData
      );

      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al sincronizar carrito');
    }
  }

  /**
   * Obtener carrito guardado del servidor
   */
  async getServerCart(): Promise<CartSyncResponse | null> {
    try {
      const response = await httpClient.get<CartSyncResponse>(
        `/api/accounts/${ACCOUNT_ID}/cart`
      );

      if (response.success) {
        return response;
      }
      
      return null;
    } catch (error) {
      // Si no hay carrito en el servidor, no es un error
      return null;
    }
  }

  /**
   * Verificar disponibilidad y precios actualizados
   */
  async verifyCartItems(items: CartItem[]): Promise<{
    valid: boolean;
    updated_items: CartItem[];
    warnings: string[];
  }> {
    try {
      const response = await httpClient.post<{
        success: boolean;
        data: {
          items: {
            product_id: string;
            available: boolean;
            current_price: number;
            stock_quantity: number;
            price_changed: boolean;
          }[];
        };
      }>(`/api/accounts/${ACCOUNT_ID}/cart/verify`, {
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          expected_price: item.unit_price
        }))
      });

      const warnings: string[] = [];
      const updated_items: CartItem[] = [];
      let valid = true;

      for (const item of items) {
        const serverItem = response.data.items.find(si => si.product_id === item.product.id);
        
        if (!serverItem) {
          warnings.push(`Producto ${item.product.name} no encontrado`);
          valid = false;
          continue;
        }

        if (!serverItem.available) {
          warnings.push(`Producto ${item.product.name} no disponible`);
          valid = false;
          continue;
        }

        if (serverItem.stock_quantity < item.quantity) {
          warnings.push(`Stock insuficiente para ${item.product.name}. Stock disponible: ${serverItem.stock_quantity}`);
          valid = false;
        }

        const updatedItem: CartItem = {
          ...item,
          unit_price: serverItem.current_price
        };

        if (serverItem.price_changed) {
          warnings.push(`El precio de ${item.product.name} ha cambiado`);
        }

        updated_items.push(updatedItem);
      }

      return {
        valid,
        updated_items,
        warnings
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al verificar carrito');
    }
  }

  /**
   * Crear cotización B2B
   */
  async createQuote(customerId: string, items: CartItem[], currency: string = 'ARS'): Promise<QuoteResponse> {
    try {
      const quoteData: QuoteRequest = {
        customer_id: customerId,
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        currency
      };

      const response = await httpClient.post<QuoteResponse>(
        `/api/accounts/${ACCOUNT_ID}/quotes`,
        quoteData
      );

      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear cotización');
    }
  }

  /**
   * Guardar carrito para más tarde
   */
  async saveCartForLater(items: CartItem[], currency: string = 'ARS'): Promise<void> {
    try {
      await httpClient.post(`/api/accounts/${ACCOUNT_ID}/cart/save`, {
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unit_price
        })),
        currency,
        saved_at: new Date().toISOString()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al guardar carrito');
    }
  }

  /**
   * Obtener carritos guardados
   */
  async getSavedCarts(): Promise<{
    carts: {
      id: string;
      items: CartItem[];
      saved_at: string;
      total_amount: number;
      currency: string;
    }[];
  }> {
    try {
      const response = await httpClient.get<{
        success: boolean;
        data: {
          carts: {
            id: string;
            items: CartItem[];
            saved_at: string;
            total_amount: number;
            currency: string;
          }[];
        };
      }>(`/api/accounts/${ACCOUNT_ID}/cart/saved`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener carritos guardados');
    }
  }

  /**
   * Eliminar carrito guardado
   */
  async deleteSavedCart(cartId: string): Promise<void> {
    try {
      await httpClient.delete(`/api/accounts/${ACCOUNT_ID}/cart/saved/${cartId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar carrito guardado');
    }
  }
}

export const cartService = new CartService();