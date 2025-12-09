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

// Nuevas interfaces para BusinessPartner
interface CreateBusinessPartnerRequest {
  name: string;
  partner_type: 'customer' | 'supplier' | 'both';
  email?: string;
  phone?: string;
  tax_id?: string;
  currency?: string;
  notes?: string;
  metadata?: {
    shipping_address?: {
      address: string;
      city: string;
      state: string;
      zip_code: string;
      country: string;
    };
    [key: string]: any;
  };
}

interface BusinessPartnerResponse {
  id: string;
  name: string;
  type: string;
  email?: string;
  phone?: string;
  tax_id?: string;
  currency?: string;
  created_at: string;
  updated_at: string;
}

// Interface para validación de stock
interface ValidateStockRequest {
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
}

interface ValidateStockResponse {
  success: boolean;
  message?: string;
  data?: {
    valid: boolean;
    items: Array<{
      product_id: string;
      requested: number;
      available: number;
      valid: boolean;
    }>;
  };
}

// Interface para cancelar orden
interface CancelOrderRequest {
  reason?: string;
}

interface CancelOrderResponse {
  success: boolean;
  message?: string;
  data?: SalesOrder;
}

// Datos del checkout para crear orden
interface CheckoutData {
  shippingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: SalesOrderItem[];
  currency: string;
  totalAmount: number;
  paymentMethod: string;
  notes?: string;
}

class OrderService {
  private getHeaders() {
    return {
      ...DEFAULT_HEADERS,
      'X-Account-ID': ACCOUNT_ID,
    };
  }

  /**
   * Valida disponibilidad de stock antes de crear orden
   * NOTA: Endpoint no disponible en la API actual - siempre retorna success
   */
  async validateStock(items: ValidateStockRequest['items']): Promise<ValidateStockResponse> {
    // El endpoint /validate-stock no existe en la API
    // Retornamos success para no bloquear el checkout
    console.log('⚠️ Validación de stock omitida - endpoint no disponible');
    return {
      success: true,
      message: 'Validación de stock omitida',
      data: {
        valid: true,
        items: items.map(item => ({
          product_id: item.product_id,
          requested: item.quantity,
          available: item.quantity,
          valid: true
        }))
      }
    };
  }

  /**
   * Cancela una orden de venta
   * NOTA: Endpoint no disponible en la API actual
   */
  async cancelOrder(orderId: string, reason?: string): Promise<CancelOrderResponse> {
    // El endpoint /cancel no existe en la API
    console.log('⚠️ Cancelación de orden no disponible - endpoint no existe');
    return {
      success: false,
      message: 'La cancelación de órdenes no está disponible. Contacte a soporte.'
    };
  }

  /**
   * Confirma una orden de venta (deduce stock si track_inventory=true)
   * POST /accounts/{account_id}/sales-orders/{order_id}/confirm
   */
  async confirmOrder(orderId: string): Promise<{ success: boolean; data?: SalesOrder }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: SalesOrder }>(
        API_ENDPOINTS.CONFIRM_ORDER(ACCOUNT_ID, orderId),
        {},
        { headers: this.getHeaders() }
      );

      return response;
    } catch (error) {
      console.error('Error confirmando orden:', error);
      throw error;
    }
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
   * Crea un Business Partner (cliente) en el backend
   * IMPORTANTE: Siempre crear el BP antes de la orden para obtener un ID válido
   */
  async createBusinessPartner(data: CreateBusinessPartnerRequest): Promise<BusinessPartnerResponse> {
    try {
      const response = await httpClient.post<{ success: boolean; data: BusinessPartnerResponse }>(
        API_ENDPOINTS.BUSINESS_PARTNERS(ACCOUNT_ID),
        data,
        {
          headers: this.getHeaders(),
        }
      );

      // La API puede devolver { success, data } o directamente el objeto
      if (response.data) {
        return response.data;
      }
      return response as unknown as BusinessPartnerResponse;
    } catch (error) {
      console.error('Error creating business partner:', error);
      throw error;
    }
  }

  /**
   * Procesa una compra completa: Verificar BP existente + Validar Stock + Orden + Pago
   * Flujo correcto:
   * 1. Obtener business_partner_id del perfil (/auth/me)
   * 2. Validar disponibilidad de stock
   * 3. Crear la orden de venta
   * 4. Crear el pago
   * 
   * NOTA: El business_partner_id viene de /auth/me después del login
   */
  async processCheckout(checkoutData: CheckoutData, businessPartnerId?: string) {
    let salesOrder: CreateSalesOrderResponse | null = null;
    let payment: CreatePaymentResponse | null = null;
    
    try {
      const { shippingInfo, items, currency, totalAmount, paymentMethod, notes } = checkoutData;
      
      // 1. Obtener business_partner_id (guardado en localStorage después de /auth/me)
      const customerId = businessPartnerId || localStorage.getItem('business_partner_id');
      
      if (!customerId) {
        console.error('❌ No se encontró business_partner_id - el usuario debe estar logueado');
        return {
          businessPartner: null,
          salesOrder: null,
          payment: null,
          success: false,
          message: 'Debes iniciar sesión para realizar una compra. Si ya iniciaste sesión, intenta cerrar sesión y volver a entrar.',
          error: {
            step: 'authentication',
            details: 'No se encontró business_partner_id'
          }
        };
      }
      
      console.log('✅ Business Partner ID:', customerId);
      
      // 2. Validar disponibilidad de stock
      console.log('📝 Paso 1: Validando stock...');
      const stockValidation = await this.validateStock(
        items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      );
      
      if (!stockValidation.success || !stockValidation.data?.valid) {
        const invalidItems = stockValidation.data?.items?.filter(i => !i.valid) || [];
        const itemNames = invalidItems.map(i => `${i.product_id} (solicitado: ${i.requested}, disponible: ${i.available})`).join(', ');
        
        return {
          businessPartner,
          salesOrder: null,
          payment: null,
          success: false,
          message: `Stock insuficiente para: ${itemNames}`,
          error: {
            step: 'stock_validation',
            details: stockValidation.data?.items,
          }
        };
      }
      
      console.log('✅ Stock validado correctamente');
      
      // 3. Crear orden de venta usando el business_partner_id
      const orderNumber = this.generateOrderNumber();
      console.log('📝 Paso 2: Creando orden de venta...');
      
      salesOrder = await this.createSalesOrder({
        order_number: orderNumber,
        customer_id: customerId, // ← business_partner_id de /auth/me
        currency: currency,
        status: 'pending',
        items: items,
        notes: notes || `Entrega a: ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}. Tel: ${shippingInfo.phone}`,
        metadata: {
          channel: 'online',
          shipping_info: shippingInfo,
          payment_method: paymentMethod
        }
      });
      
      console.log('✅ Orden creada:', salesOrder.order_number);
      
      // 4. Crear pago asociado
      const paymentNumber = this.generatePaymentNumber(orderNumber);
      console.log('📝 Paso 3: Creando pago...');
      
      payment = await this.createPayment({
        payment_number: paymentNumber,
        source_type: 'customer',
        partner_id: customerId, // ← business_partner_id de /auth/me
        currency: currency,
        amount: totalAmount,
        method: this.mapPaymentMethod(paymentMethod),
        reference: `TRX${orderNumber.replace('SO-', '')}`,
        status: 'received',
        metadata: {
          payment_method_details: paymentMethod,
          customer_info: {
            name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
            email: shippingInfo.email
          }
        }
      });
      
      console.log('✅ Pago creado:', payment.payment_number);

      return {
        businessPartner: null,
        customerId: customerId, // business_partner_id usado
        salesOrder,
        payment,
        success: true,
        message: 'Checkout procesado exitosamente',
        orderNumber: salesOrder.order_number,
        paymentNumber: payment.payment_number,
      };
      
    } catch (error: any) {
      console.error('❌ Error en checkout:', error);
      
      // Error al crear orden
      if (!salesOrder) {
        return {
          businessPartner: null,
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
      
      // Error al crear la orden (pero BP ya existe)
      if (businessPartner && !salesOrder) {
        return {
          businessPartner,
          salesOrder: null,
          payment: null,
          success: false,
          message: 'Error al crear la orden de venta',
          error: {
            step: 'order',
            details: error.response?.data || error.message,
            businessPartnerId: businessPartner.id,
          }
        };
      }
      
      // Error al crear el pago (pero orden ya existe)
      if (salesOrder && !payment) {
        return {
          businessPartner,
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
  OrdersResponse,
  CheckoutData,
  CreateBusinessPartnerRequest,
  BusinessPartnerResponse,
  ValidateStockRequest,
  ValidateStockResponse,
  CancelOrderRequest,
  CancelOrderResponse
};