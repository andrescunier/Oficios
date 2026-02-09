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

// Estado completo de la máquina de estados (Order State Machine v2)
export type OrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'payment_review'
  | 'confirmed'
  | 'preparing'
  | 'ready_to_ship'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'return_requested'
  | 'return_in_transit'
  | 'returned'
  | 'refunded';

export type ReturnCondition = 'sellable' | 'damaged' | 'defective';

interface CreateSalesOrderRequest {
  order_number: string;
  customer_id: string;
  currency: string;
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
  status: OrderStatus;
  total_amount: number;
  items: SalesOrderItem[];
  notes?: string;
  metadata?: {
    channel?: string;
    shipping_info?: any;
    payment_method?: string;
    tracking_number?: string;
    carrier?: string;
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
  source_type: 'customer' | 'supplier' | 'other';
  partner_id?: string;
  currency: string;
  amount: number;
  method: 'cash' | 'transfer' | 'credit_card' | 'debit_card' | 'check' | 'card' | 'mercadopago' | 'stripe' | 'other';
  reference?: string;
  received_at?: string;
  status: 'pending' | 'received' | 'rejected';
  metadata?: {
    [key: string]: any;
  };
}

// Interface para aplicar pago a factura/orden
interface ApplyPaymentRequest {
  invoice_id?: string;
  sales_order_id?: string;
  amount_applied: number;
}

interface ApplyPaymentResponse {
  id: string;
  payment_id: string;
  invoice_id?: string;
  sales_order_id?: string;
  amount_applied: number;
  created_at: string;
}

// Interface para generar factura desde orden
interface GenerateInvoiceRequest {
  invoice_number: string;
  due_at?: string;
  status?: 'draft' | 'sent';
  metadata?: Record<string, any>;
}

interface GenerateInvoiceResponse {
  id: string;
  invoice_number: string;
  customer_id: string;
  sales_order_id: string;
  currency: string;
  status: string;
  total_amount: number;
  created_at: string;
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

// Interface para cancelar orden (State Machine v2 - cancel-v2)
interface CancelOrderRequest {
  reason: string;
  event_id?: string;
  restore_stock?: boolean;
}

interface CancelOrderResponse {
  success: boolean;
  message?: string;
  data?: {
    order_id: string;
    from_status: OrderStatus;
    to_status: OrderStatus;
    stock_operations?: number;
    event_id?: string;
  };
}

// Interfaces para State Machine v2
interface OrderSubmitRequest {
  validate_stock?: boolean;
  reservation_ttl_hours?: number;
  event_id?: string;
  notes?: string;
}

interface OrderSubmitResponse {
  success: boolean;
  message?: string;
  data?: {
    order_id: string;
    from_status: OrderStatus;
    to_status: OrderStatus;
    reservations_created?: number;
    event_id?: string;
  };
}

interface OrderConfirmPaymentRequest {
  payment_reference?: string;
  event_id?: string;
  notes?: string;
}

interface OrderConfirmPaymentResponse {
  success: boolean;
  message?: string;
  data?: {
    order_id: string;
    from_status: OrderStatus;
    to_status: OrderStatus;
    items_deducted?: number;
    event_id?: string;
  };
}

interface StateTransitionResponse {
  success: boolean;
  message?: string;
  data?: {
    order_id: string;
    from_status: OrderStatus;
    to_status: OrderStatus;
    event_id?: string;
  };
}

interface ValidTransitionsResponse {
  success: boolean;
  message?: string;
  data?: {
    order_id: string;
    current_status: OrderStatus;
    valid_transitions: OrderStatus[];
    can_cancel: boolean;
    can_return: boolean;
  };
}

interface StatusHistoryEntry {
  id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  reason: string | null;
  event_id: string | null;
  user_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface StatusHistoryResponse {
  success: boolean;
  message?: string;
  data?: {
    order_id: string;
    current_status: OrderStatus;
    history: StatusHistoryEntry[];
  };
}

interface ReturnItemRequest {
  order_item_id: string;
  quantity: number;
  condition: ReturnCondition;
  reason?: string;
}

interface OrderReturnRequest {
  items: ReturnItemRequest[];
  refund_amount?: number;
  event_id?: string;
}

interface OrderReturnResponse {
  success: boolean;
  message?: string;
  data?: {
    order_id: string;
    items: Array<{
      order_item_id: string;
      success: boolean;
      restocked: boolean;
      quantity: number;
      condition: ReturnCondition;
      error?: string;
    }>;
  };
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
        {
          items: items.map(item => ({
            product_id: item.product_id,
            description: '',
            quantity: item.quantity,
            unit_price: 0,
            tax_rate: 0
          }))
        },
        { headers: this.getHeaders() }
      );
      
      return response;
    } catch (error: any) {
      // Si el endpoint no existe (404), retornar success para no bloquear
      if (error.code === 'E3001' || error.response?.status === 404) {
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
      throw error;
    }
  }

  /**
   * Cancela una orden de venta (State Machine v2)
   * POST /accounts/{account_id}/sales-orders/{order_id}/cancel-v2
   * Solo disponible para estados pre-envío: draft, pending_payment, confirmed, preparing, ready_to_ship
   */
  async cancelOrder(orderId: string, reason?: string, restoreStock: boolean = true): Promise<CancelOrderResponse> {
    try {
      const eventId = `cancel-${orderId}-${Date.now()}`;
      
      const response = await httpClient.post<CancelOrderResponse>(
        API_ENDPOINTS.CANCEL_ORDER(ACCOUNT_ID, orderId),
        {
          reason: reason || 'Cancelado por el cliente',
          event_id: eventId,
          restore_stock: restoreStock
        },
        { headers: this.getHeaders() }
      );
      
      return response;
    } catch (error: any) {
      // Si el endpoint no existe (404)
      if (error.code === 'E3001' || error.response?.status === 404) {
        console.log('⚠️ Cancelación de orden no disponible - endpoint no existe');
        return {
          success: false,
          message: 'La cancelación de órdenes no está disponible. Contacte a soporte.'
        };
      }
      // Si la orden no se puede cancelar (ya fue enviada)
      if (error.response?.status === 400) {
        return {
          success: false,
          message: error.response?.data?.error?.message || 'Esta orden no se puede cancelar en su estado actual.'
        };
      }
      throw error;
    }
  }

  /**
   * Enviar pedido: Draft → Pending Payment (reserva stock)
   * POST /accounts/{account_id}/sales-orders/{order_id}/submit
   */
  async submitOrder(orderId: string, options?: { validateStock?: boolean; reservationTtlHours?: number }): Promise<OrderSubmitResponse> {
    try {
      const eventId = `submit-${orderId}-${Date.now()}`;
      
      const response = await httpClient.post<OrderSubmitResponse>(
        API_ENDPOINTS.SUBMIT_ORDER(ACCOUNT_ID, orderId),
        {
          validate_stock: options?.validateStock ?? true,
          reservation_ttl_hours: options?.reservationTtlHours ?? 48,
          event_id: eventId
        },
        { headers: this.getHeaders() }
      );

      return response;
    } catch (error) {
      console.error('Error enviando orden:', error);
      throw error;
    }
  }

  /**
   * Confirmar pago: Pending Payment → Confirmed (deduce stock)
   * POST /accounts/{account_id}/sales-orders/{order_id}/confirm-payment
   */
  async confirmPayment(orderId: string, paymentReference?: string, notes?: string): Promise<OrderConfirmPaymentResponse> {
    try {
      const eventId = `confirm-${orderId}-${Date.now()}`;
      
      const response = await httpClient.post<OrderConfirmPaymentResponse>(
        API_ENDPOINTS.CONFIRM_PAYMENT(ACCOUNT_ID, orderId),
        {
          payment_reference: paymentReference,
          event_id: eventId,
          notes: notes
        },
        { headers: this.getHeaders() }
      );

      return response;
    } catch (error) {
      console.error('Error confirmando pago:', error);
      throw error;
    }
  }

  /**
   * Confirma una orden de venta (legacy - redirige a confirm-payment)
   * @deprecated Usar confirmPayment() en su lugar
   */
  async confirmOrder(orderId: string, _deductStock: boolean = true): Promise<{ success: boolean; data?: SalesOrder }> {
    try {
      const result = await this.confirmPayment(orderId);
      return {
        success: result.success,
        data: result.data as unknown as SalesOrder
      };
    } catch (error) {
      console.error('Error confirmando orden:', error);
      throw error;
    }
  }

  /**
   * Transición genérica entre estados
   * POST /accounts/{account_id}/sales-orders/{order_id}/transition?to_status=X
   */
  async transitionOrder(orderId: string, toStatus: OrderStatus, reason?: string): Promise<StateTransitionResponse> {
    try {
      const eventId = `transition-${toStatus}-${orderId}-${Date.now()}`;
      
      const response = await httpClient.post<StateTransitionResponse>(
        `${API_ENDPOINTS.TRANSITION_ORDER(ACCOUNT_ID, orderId)}?to_status=${toStatus}`,
        {
          reason: reason,
          event_id: eventId
        },
        { headers: this.getHeaders() }
      );

      return response;
    } catch (error) {
      console.error('Error en transición de orden:', error);
      throw error;
    }
  }

  /**
   * Obtener transiciones válidas desde el estado actual
   * GET /accounts/{account_id}/sales-orders/{order_id}/valid-transitions
   */
  async getValidTransitions(orderId: string): Promise<ValidTransitionsResponse> {
    try {
      const response = await httpClient.get<ValidTransitionsResponse>(
        API_ENDPOINTS.VALID_TRANSITIONS(ACCOUNT_ID, orderId),
        { headers: this.getHeaders() }
      );
      return response;
    } catch (error) {
      console.error('Error obteniendo transiciones válidas:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de cambios de estado
   * GET /accounts/{account_id}/sales-orders/{order_id}/status-history
   */
  async getStatusHistory(orderId: string): Promise<StatusHistoryResponse> {
    try {
      const response = await httpClient.get<StatusHistoryResponse>(
        API_ENDPOINTS.STATUS_HISTORY(ACCOUNT_ID, orderId),
        { headers: this.getHeaders() }
      );
      return response;
    } catch (error) {
      console.error('Error obteniendo historial de estados:', error);
      throw error;
    }
  }

  /**
   * Procesar devolución
   * POST /accounts/{account_id}/sales-orders/{order_id}/return
   * Solo desde delivered o completed
   */
  async returnOrder(orderId: string, data: OrderReturnRequest): Promise<OrderReturnResponse> {
    try {
      const eventId = `return-${orderId}-${Date.now()}`;
      
      const response = await httpClient.post<OrderReturnResponse>(
        API_ENDPOINTS.RETURN_ORDER(ACCOUNT_ID, orderId),
        {
          ...data,
          event_id: data.event_id || eventId
        },
        { headers: this.getHeaders() }
      );

      return response;
    } catch (error) {
      console.error('Error procesando devolución:', error);
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
   * Convierte el estado de la API al formato simplificado del frontend
   */
  mapOrderStatus(apiStatus: string): 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' {
    const statusMap: Record<string, 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'> = {
      'draft': 'pending',
      'pending_payment': 'pending',
      'payment_review': 'pending',
      'confirmed': 'processing',
      'preparing': 'processing',
      'ready_to_ship': 'processing',
      'shipped': 'shipped',
      'in_transit': 'shipped',
      'out_for_delivery': 'shipped',
      'delivered': 'delivered',
      'completed': 'delivered',
      'cancelled': 'cancelled',
      'return_requested': 'returned',
      'return_in_transit': 'returned',
      'returned': 'returned',
      'refunded': 'returned',
    };
    
    return statusMap[apiStatus] || 'pending';
  }

  /**
   * Obtiene la etiqueta en español para un estado de la API
   */
  getStatusLabel(apiStatus: string): string {
    const labels: Record<string, string> = {
      'draft': 'Borrador',
      'pending_payment': 'Pago pendiente',
      'payment_review': 'Revisión de pago',
      'confirmed': 'Confirmado',
      'preparing': 'En preparación',
      'ready_to_ship': 'Listo para enviar',
      'shipped': 'Enviado',
      'in_transit': 'En tránsito',
      'out_for_delivery': 'En reparto',
      'delivered': 'Entregado',
      'completed': 'Completado',
      'cancelled': 'Cancelado',
      'return_requested': 'Devolución solicitada',
      'return_in_transit': 'Devolución en tránsito',
      'returned': 'Devuelto',
      'refunded': 'Reembolsado',
    };
    return labels[apiStatus] || apiStatus;
  }

  /**
   * Verifica si una orden puede ser cancelada según su estado
   */
  canCancelOrder(status: string): boolean {
    const cancellableStatuses = ['draft', 'pending_payment', 'payment_review', 'confirmed', 'preparing', 'ready_to_ship'];
    return cancellableStatuses.includes(status);
  }

  /**
   * Verifica si una orden puede solicitar devolución
   */
  canReturnOrder(status: string): boolean {
    return ['delivered', 'completed'].includes(status);
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
   * Aplica un pago a una factura u orden
   * POST /accounts/{account_id}/payments/{payment_id}/applications
   */
  async applyPayment(paymentId: string, application: ApplyPaymentRequest): Promise<ApplyPaymentResponse> {
    try {
      const response = await httpClient.post<ApplyPaymentResponse>(
        API_ENDPOINTS.PAYMENT_APPLICATIONS(ACCOUNT_ID, paymentId),
        application,
        { headers: this.getHeaders() }
      );
      return response;
    } catch (error) {
      console.error('Error aplicando pago:', error);
      throw error;
    }
  }

  /**
   * Genera una factura desde una orden de venta
   * POST /accounts/{account_id}/sales-orders/{order_id}/invoice
   */
  async generateInvoice(orderId: string, invoiceData: GenerateInvoiceRequest): Promise<GenerateInvoiceResponse> {
    try {
      const response = await httpClient.post<GenerateInvoiceResponse>(
        API_ENDPOINTS.GENERATE_INVOICE(ACCOUNT_ID, orderId),
        invoiceData,
        { headers: this.getHeaders() }
      );
      return response;
    } catch (error) {
      console.error('Error generando factura:', error);
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
      'mercadopago': 'mercadopago',
      'transferencia': 'transfer',
      'efectivo': 'cash',
      'tarjeta': 'credit_card',
      'transfer': 'transfer',
      'wire_transfer': 'transfer',
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
   * Procesa una compra completa siguiendo el Order State Machine v2:
   * 1. Obtener business_partner_id del perfil (/auth/me)
   * 2. Crear la orden de venta (status: draft)
   * 3. Submit: draft → pending_payment (reserva stock)
   * 4. Crear el pago
   * 5. Confirm Payment: pending_payment → confirmed (deduce stock)
   */
  async processCheckout(checkoutData: CheckoutData, businessPartnerId?: string) {
    let salesOrder: CreateSalesOrderResponse | null = null;
    let payment: CreatePaymentResponse | null = null;
    let submitted = false;
    
    try {
      const { shippingInfo, items, currency, totalAmount, paymentMethod, notes } = checkoutData;
      
      // 1. Obtener customer_id: puede ser business_partner_id o user_id
      // La API acepta ambos según la doc: "customer_id puede ser un User.id o un BusinessPartner.id"
      let customerId = businessPartnerId || localStorage.getItem('business_partner_id');
      
      if (!customerId) {
        // Fallback: usar el user_id del usuario autenticado
        try {
          const persistedState = localStorage.getItem('diapstore-store');
          if (persistedState) {
            const state = JSON.parse(persistedState);
            customerId = state?.state?.auth?.user?.id || null;
            if (customerId) {
              console.log('⚠️ Usando user.id como customer_id (fallback):', customerId);
            }
          }
        } catch (e) {
          console.error('Error obteniendo user.id del store:', e);
        }
      }
      
      if (!customerId) {
        console.error('❌ No se encontró customer_id - el usuario debe estar logueado');
        return {
          salesOrder: null,
          payment: null,
          success: false,
          message: 'Debes iniciar sesión para realizar una compra. Si ya iniciaste sesión, intenta cerrar sesión y volver a entrar.',
          error: {
            step: 'authentication',
            details: 'No se encontró business_partner_id ni user_id'
          }
        };
      }
      
      console.log('✅ Business Partner ID:', customerId);
      
      // 2. Crear orden de venta (siempre se crea en draft)
      const orderNumber = this.generateOrderNumber();
      console.log('📝 Paso 1: Creando orden de venta (draft)...');
      
      salesOrder = await this.createSalesOrder({
        order_number: orderNumber,
        customer_id: customerId,
        currency: currency,
        items: items,
        notes: notes || `Entrega a: ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}. Tel: ${shippingInfo.phone}`,
        metadata: {
          channel: 'online',
          shipping_info: shippingInfo,
          payment_method: paymentMethod
        }
      });
      
      console.log('✅ Orden creada (draft):', salesOrder.order_number);
      
      // 3. Submit: draft → pending_payment (reserva stock)
      console.log('📝 Paso 2: Enviando pedido (submit → pending_payment)...');
      
      const submitResult = await this.submitOrder(salesOrder.id, {
        validateStock: true,
        reservationTtlHours: 48
      });
      
      if (!submitResult.success) {
        return {
          salesOrder,
          payment: null,
          success: false,
          message: submitResult.message || 'Error al enviar el pedido. Puede haber stock insuficiente.',
          error: {
            step: 'submit',
            details: submitResult.data,
            orderNumber: salesOrder.order_number,
          }
        };
      }
      
      submitted = true;
      console.log('✅ Pedido enviado - stock reservado');
      
      // 4. Crear pago asociado
      const paymentNumber = this.generatePaymentNumber(orderNumber);
      console.log('📝 Paso 3: Creando pago...');
      
      payment = await this.createPayment({
        payment_number: paymentNumber,
        source_type: 'customer',
        partner_id: customerId,
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
      
      // 5. Confirm Payment: pending_payment → confirmed (deduce stock)
      console.log('📝 Paso 4: Confirmando pago (confirm-payment → confirmed)...');
      
      const confirmResult = await this.confirmPayment(
        salesOrder.id,
        payment.payment_number,
        `Pago ${paymentMethod} - ${payment.payment_number}`
      );
      
      if (!confirmResult.success) {
        console.warn('⚠️ Pago creado pero confirmación falló:', confirmResult.message);
        // La orden queda en pending_payment, no es un error fatal
      } else {
        console.log('✅ Pago confirmado - stock deducido');
      }

      return {
        customerId: customerId,
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
      
      // Error al submit (orden creada pero no enviada)
      if (salesOrder && !submitted) {
        return {
          salesOrder,
          payment: null,
          success: false,
          message: 'La orden fue creada pero no se pudo enviar. Puede haber stock insuficiente.',
          error: {
            step: 'submit',
            details: error.response?.data || error.message,
            orderNumber: salesOrder.order_number,
          }
        };
      }
      
      // Error al crear el pago (pero orden ya enviada)
      if (salesOrder && !payment) {
        return {
          salesOrder,
          payment: null,
          success: false,
          message: 'La orden fue creada pero el pago falló. Te contactaremos para resolverlo.',
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
  CancelOrderResponse,
  OrderSubmitRequest,
  OrderSubmitResponse,
  OrderConfirmPaymentRequest,
  OrderConfirmPaymentResponse,
  StateTransitionResponse,
  ValidTransitionsResponse,
  StatusHistoryEntry,
  StatusHistoryResponse,
  ReturnItemRequest,
  OrderReturnRequest,
  OrderReturnResponse,
  ReturnCondition,
  OrderStatus,
};