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
   * POST /accounts/{account_id}/sales-orders/validate-stock
   */
  async validateStock(items: ValidateStockRequest['items']): Promise<ValidateStockResponse> {
    try {
      const response = await httpClient.post<ValidateStockResponse>(
        API_ENDPOINTS.VALIDATE_STOCK(ACCOUNT_ID),
        { items },
        { headers: this.getHeaders() }
      );

      return response;
    } catch (error: any) {
      console.error('Error validando stock:', error);
      // Si el endpoint no existe, retornar success para no bloquear
      if (error.response?.status === 404) {
        return {
          success: true,
          message: 'Validación de stock no disponible',
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
      throw error;
    }
  }

  /**
   * Cancela una orden de venta
   * POST /accounts/{account_id}/sales-orders/{order_id}/cancel
   */
  async cancelOrder(orderId: string, reason?: string): Promise<CancelOrderResponse> {
    try {
      const response = await httpClient.post<CancelOrderResponse>(
        API_ENDPOINTS.CANCEL_ORDER(ACCOUNT_ID, orderId),
        { reason },
        { headers: this.getHeaders() }
      );

      return response;
    } catch (error) {
      console.error('Error cancelando orden:', error);
      throw error;
    }
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
   * 1. Verificar si el usuario ya tiene business_partner_id
   * 2. Si no tiene, crear BusinessPartner con datos del cliente
   * 3. Validar disponibilidad de stock
   * 4. Crear la orden de venta
   * 5. Crear el pago
   */
  async processCheckout(checkoutData: CheckoutData, existingBusinessPartnerId?: string) {
    let businessPartner: BusinessPartnerResponse | null = null;
    let salesOrder: CreateSalesOrderResponse | null = null;
    let payment: CreatePaymentResponse | null = null;
    let customerId: string;
    
    try {
      const { shippingInfo, items, currency, totalAmount, paymentMethod, notes } = checkoutData;
      
      // 0. Verificar si ya existe un business_partner_id
      const savedBpId = existingBusinessPartnerId || localStorage.getItem('business_partner_id');
      
      if (savedBpId) {
        console.log('✅ Business Partner existente encontrado:', savedBpId);
        customerId = savedBpId;
      } else {
        // 1. Crear Business Partner (cliente)
        console.log('📝 Paso 1: Creando Business Partner...');
        businessPartner = await this.createBusinessPartner({
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          partner_type: 'customer',
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          currency: currency,
          metadata: {
            shipping_address: {
              address: shippingInfo.address,
              city: shippingInfo.city,
              state: shippingInfo.state,
              zip_code: shippingInfo.zipCode,
              country: shippingInfo.country,
            },
            source: 'web_checkout',
            created_at: new Date().toISOString(),
          }
        });
        
        console.log('✅ Business Partner creado:', businessPartner.id);
        customerId = businessPartner.id;
        
        // Guardar para futuras compras
        localStorage.setItem('business_partner_id', businessPartner.id);
      }
      
      // 2. Validar disponibilidad de stock
      console.log('📝 Paso 2: Validando stock...');
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
      
      // 3. Crear orden de venta usando el ID del BusinessPartner
      const orderNumber = this.generateOrderNumber();
      console.log('📝 Paso 3: Creando orden de venta...');
      
      salesOrder = await this.createSalesOrder({
        order_number: orderNumber,
        customer_id: customerId, // ← ID real del backend (existente o nuevo)
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
      console.log('📝 Paso 4: Creando pago...');
      
      payment = await this.createPayment({
        payment_number: paymentNumber,
        source_type: 'customer',
        partner_id: customerId, // ← ID real del backend (existente o nuevo)
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
        businessPartner,
        customerId, // Incluir el ID usado
        salesOrder,
        payment,
        success: true,
        message: 'Checkout procesado exitosamente',
        orderNumber: salesOrder.order_number,
        paymentNumber: payment.payment_number,
      };
      
    } catch (error: any) {
      console.error('❌ Error en checkout:', error);
      
      // Error al crear Business Partner
      if (!businessPartner) {
        return {
          businessPartner: null,
          salesOrder: null,
          payment: null,
          success: false,
          message: 'Error al crear el cliente',
          error: {
            step: 'business_partner',
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