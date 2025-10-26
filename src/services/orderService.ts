/**
 * Servicio para manejo de órdenes de venta y pagos
 */

import { httpClient } from './httpClient';
import { API_ENDPOINTS, ACCOUNT_ID, DEFAULT_HEADERS } from '@/config/api';

interface SalesOrderItem {
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

interface CreateSalesOrderRequest {
  order_number: string;
  customer_id: string;
  currency: string;
  status: 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  items: SalesOrderItem[];
  notes?: string;
  metadata?: {
    channel: string;
    [key: string]: any;
  };
}

interface CreateSalesOrderResponse {
  id: string;
  order_number: string;
  customer_id: string;
  currency: string;
  status: string;
  total_amount: number;
  items: SalesOrderItem[];
  created_at: string;
  updated_at: string;
}

interface SalesOrder {
  id: string;
  order_number: string;
  customer_id: string;
  currency: string;
  status: 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_amount: number;
  items: SalesOrderItem[];
  notes?: string;
  metadata?: {
    channel?: string;
    shipping_info?: any;
    payment_method?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

interface GetOrdersParams {
  customer_id?: string;
  status?: string;
  page?: number;
  per_page?: number;
  order_by?: string;
  direction?: 'asc' | 'desc';
}

interface OrdersResponse {
  data: SalesOrder[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

interface CreatePaymentRequest {
  payment_number: string;
  source_type: 'customer' | 'supplier' | 'employee' | 'other';
  partner_id: string;
  currency: string;
  amount: number;
  method: 'cash' | 'bank_transfer' | 'wire_transfer' | 'credit_card' | 'debit_card' | 'check' | 'other';
  reference?: string;
  status: 'pending' | 'received' | 'rejected' | 'cancelled';
  metadata?: {
    [key: string]: any;
  };
}

interface CreatePaymentResponse {
  id: string;
  payment_number: string;
  source_type: string;
  partner_id: string;
  currency: string;
  amount: number;
  method: string;
  status: string;
  created_at: string;
  updated_at: string;
}

class OrderService {
  private getHeaders() {
    return {
      ...DEFAULT_HEADERS,
      'X-Account-ID': ACCOUNT_ID,
    };
  }

  /**
   * Obtiene todas las órdenes de venta
   */
  async getOrders(params?: GetOrdersParams): Promise<OrdersResponse> {
    try {
      const response = await httpClient.get<OrdersResponse>(
        API_ENDPOINTS.SALES_ORDERS(ACCOUNT_ID),
        {
          headers: this.getHeaders(),
          params: params
        }
      );

      // Si la respuesta es un array directo (sin paginación)
      if (Array.isArray(response)) {
        return {
          data: response,
          pagination: {
            page: 1,
            per_page: response.length,
            total: response.length,
            total_pages: 1,
          }
        };
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene una orden específica por ID
   */
  async getOrder(orderId: string): Promise<SalesOrder> {
    try {
      const response = await httpClient.get<SalesOrder>(
        API_ENDPOINTS.SALES_ORDER(ACCOUNT_ID, orderId),
        {
          headers: this.getHeaders(),
        }
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene los pedidos de un usuario específico
   */
  async getUserOrders(customerId: string, params?: Omit<GetOrdersParams, 'customer_id'>): Promise<OrdersResponse> {
    return this.getOrders({
      ...params,
      customer_id: customerId,
      order_by: 'created_at',
      direction: 'desc'
    });
  }

  /**
   * Convierte el estado de la API al formato del frontend
   */
  mapOrderStatus(apiStatus: string): 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' {
    const statusMap: Record<string, 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'> = {
      'draft': 'pending',
      'pending': 'pending',
      'confirmed': 'processing',
      'completed': 'delivered',
      'cancelled': 'cancelled',
      'shipped': 'shipped', // Si la API soporta este estado
    };
    
    return statusMap[apiStatus] || 'pending';
  }

  /**
   * Crea una orden de venta
   */
  async createSalesOrder(orderData: CreateSalesOrderRequest): Promise<CreateSalesOrderResponse> {
    try {
      const response = await httpClient.post<CreateSalesOrderResponse>(
        API_ENDPOINTS.SALES_ORDERS(ACCOUNT_ID),
        orderData,
        {
          headers: this.getHeaders(),
        }
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crea un pago
   */
  async createPayment(paymentData: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      const response = await httpClient.post<CreatePaymentResponse>(
        API_ENDPOINTS.PAYMENTS(ACCOUNT_ID),
        paymentData,
        {
          headers: this.getHeaders(),
        }
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Genera un número de orden único
   */
  generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `SO-${timestamp}${random}`;
  }

  /**
   * Genera un número de pago único
   */
  generatePaymentNumber(orderNumber: string): string {
    return `RCPT-${orderNumber.replace('SO-', '')}`;
  }

  /**
   * Convierte método de pago del frontend al formato de la API
   */
  mapPaymentMethod(frontendMethod: string): CreatePaymentRequest['method'] {
    const methodMap: Record<string, CreatePaymentRequest['method']> = {
      'credit': 'credit_card',
      'debit': 'debit_card',
      'mercadopago': 'other',
      'transferencia': 'wire_transfer',
    };
    
    return methodMap[frontendMethod] || 'other';
  }

  /**
   * Procesa una compra completa: orden + pago
   */
  async processCheckout(orderData: CreateSalesOrderRequest, paymentData: Omit<CreatePaymentRequest, 'partner_id'>) {
    let salesOrder: CreateSalesOrderResponse | null = null;
    let payment: CreatePaymentResponse | null = null;
    
    try {
      // 1. Crear orden de venta
      salesOrder = await this.createSalesOrder(orderData);
      
      // 2. Crear pago asociado
      payment = await this.createPayment({
        ...paymentData,
        partner_id: orderData.customer_id,
      });

      return {
        salesOrder,
        payment,
        success: true,
        message: 'Checkout procesado exitosamente',
      };
      
    } catch (error: any) {
      // Si la orden se creó pero falló el pago
      if (salesOrder && !payment) {
        return {
          salesOrder,
          payment: null,
          success: false,
          message: 'La orden fue creada pero el pago falló',
          error: {
            step: 'payment',
            details: error.response?.data || error.message,
            orderNumber: salesOrder.order_number,
          }
        };
      }
      
      // Si falló la creación de la orden
      if (!salesOrder) {
        return {
          salesOrder: null,
          payment: null,
          success: false,
          message: 'Error al crear la orden de venta',
          error: {
            step: 'order',
            details: error.response?.data || error.message,
          }
        };
      }
      
      // Error general
      throw error;
    }
  }
}

export const orderService = new OrderService();
export type { 
  CreateSalesOrderRequest, 
  CreateSalesOrderResponse, 
  CreatePaymentRequest, 
  CreatePaymentResponse,
  SalesOrderItem,
  SalesOrder,
  GetOrdersParams,
  OrdersResponse
};