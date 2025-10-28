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

type CartFeature = 
  | 'sync'
  | 'server_cart'
  | 'verify'
  | 'quotes'
  | 'save'
  | 'saved_list';

export class CartService {
  private disabledFeatures = new Set<CartFeature>();

  private isFeatureDisabled(feature: CartFeature) {
    return this.disabledFeatures.has(feature);
  }

  private markFeatureUnavailable(feature: CartFeature) {
    this.disabledFeatures.add(feature);
    if (import.meta.env.DEV) {
      console.info(`[cartService] Feature "${feature}" no disponible en la API actual. Se continuará en modo local.`);
    }
  }

  private isFeatureUnsupported(error: any) {
    const status = error?.response?.status;
    return status === 404 || status === 405 || status === 501;
  }

  /**
   * Sincronizar carrito local con el servidor
   */
  async syncCart(items: CartItem[], currency: string = 'ARS'): Promise<CartSyncResponse | null> {
    if (this.isFeatureDisabled('sync')) {
      return null;
    }

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
      if (this.isFeatureUnsupported(error)) {
        this.markFeatureUnavailable('sync');
        return null;
      }
      throw new Error(error.response?.data?.message || 'Error al sincronizar carrito');
    }
  }

  /**
   * Obtener carrito guardado del servidor
   */
  async getServerCart(): Promise<CartSyncResponse | null> {
    if (this.isFeatureDisabled('server_cart')) {
      return null;
    }

    try {
      const response = await httpClient.get<CartSyncResponse>(
        `/api/accounts/${ACCOUNT_ID}/cart`
      );

      if (response.success) {
        return response;
      }
      
      return null;
    } catch (error) {
      if (this.isFeatureUnsupported(error)) {
        this.markFeatureUnavailable('server_cart');
        return null;
      }
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
    if (this.isFeatureDisabled('verify')) {
      return {
        valid: true,
        updated_items: items,
        warnings: [],
      };
    }

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
      if (this.isFeatureUnsupported(error)) {
        this.markFeatureUnavailable('verify');
        return {
          valid: true,
          updated_items: items,
          warnings: [],
        };
      }
      throw new Error(error.response?.data?.message || 'Error al verificar carrito');
    }
  }

  /**
   * Crear cotización B2B
   */
  async createQuote(customerId: string, items: CartItem[], currency: string = 'ARS'): Promise<QuoteResponse> {
    if (this.isFeatureDisabled('quotes')) {
      throw new Error('La creación de cotizaciones no está habilitada en esta instancia');
    }

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
      if (this.isFeatureUnsupported(error)) {
        this.markFeatureUnavailable('quotes');
        throw new Error('La API no soporta la creación de cotizaciones');
      }
      throw new Error(error.response?.data?.message || 'Error al crear cotización');
    }
  }

  /**
   * Guardar carrito para más tarde
   */
  async saveCartForLater(items: CartItem[], currency: string = 'ARS'): Promise<void> {
    if (this.isFeatureDisabled('save')) {
      return;
    }

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
      if (this.isFeatureUnsupported(error)) {
        this.markFeatureUnavailable('save');
        return;
      }
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
    if (this.isFeatureDisabled('saved_list')) {
      return { carts: [] };
    }

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
      if (this.isFeatureUnsupported(error)) {
        this.markFeatureUnavailable('saved_list');
        return { carts: [] };
      }
      throw new Error(error.response?.data?.message || 'Error al obtener carritos guardados');
    }
  }

  /**
   * Eliminar carrito guardado
   */
  async deleteSavedCart(cartId: string): Promise<void> {
    if (this.isFeatureDisabled('saved_list')) {
      return;
    }

    try {
      await httpClient.delete(`/api/accounts/${ACCOUNT_ID}/cart/saved/${cartId}`);
    } catch (error: any) {
      if (this.isFeatureUnsupported(error)) {
        this.markFeatureUnavailable('saved_list');
        return;
      }
      throw new Error(error.response?.data?.message || 'Error al eliminar carrito guardado');
    }
  }
}

export const cartService = new CartService();
