/**
 * Servicio para manejo de órdenes de venta y pagos
 */

import { httpClient } from './httpClient';
import { API_ENDPOINTS, getActiveAccountId, getActiveChannel, getDefaultHeaders } from '@/config/api';
import log from '@/lib/logger';

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
  subtotal?: number;
  tax_total?: number;
  total?: number;
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
  subtotal?: number;
  tax_total?: number;
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
  payments?: PaymentSummary[];
  payment_summary?: {
    total: number;
    count: number;
    last_payment_at?: string;
  };
  status_history?: StatusHistoryEntry[];
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
  partner_id: string | null;
  currency: string;
  amount: number;
  method: string;
  status: string;
  reference?: string | null;
  received_at?: string | null;
  metadata?: Record<string, any>;
  account_id?: string;
  created_at: string;
  updated_at?: string;
}

interface PaymentSummary extends CreatePaymentResponse {
  applications?: ApplyPaymentResponse[];
  linked_order_ids?: string[];
}

interface GetPaymentsParams {
  partner_id?: string;
  status_filter?: string;
}

interface UserOrdersWithPaymentsResponse extends OrdersResponse {
  payments: PaymentSummary[];
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
  lineItemsMetadata?: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    description: string;
    variant_id?: string;
    variant_sku?: string;
    option_values?: Record<string, string>;
  }>;
  currency: string;
  totalAmount: number;
  paymentMethod: string;
  notes?: string;
}

/**
 * Desenvuelve la respuesta de la API si viene en formato { success, data: {...} }
 * La API envuelve todas las respuestas en SuccessResponse, pero httpClient ya extrae Axios .data,
 * quedando { success, message, data: { ...campos_reales } }. Este helper extrae .data.
 */
function unwrapApiResponse<T>(response: any): T {
  if (response && typeof response === 'object' && 'success' in response && 'data' in response && response.data) {
    return response.data as T;
  }
  return response as T;
}

function normalizeSalesOrder(raw: any): SalesOrder {
  const items = Array.isArray(raw?.items)
    ? raw.items.map((item: any) => ({
        ...item,
        quantity: typeof item.quantity === 'number' ? item.quantity : Number(item.quantity || 0),
        unit_price: typeof item.unit_price === 'number' ? item.unit_price : Number(item.unit_price || 0),
        tax_rate: typeof item.tax_rate === 'number' ? item.tax_rate : Number(item.tax_rate || 0),
      }))
    : [];

  const totalAmount = raw?.total_amount ?? raw?.total ?? 0;

  return {
    ...raw,
    subtotal: typeof raw?.subtotal === 'number' ? raw.subtotal : Number(raw?.subtotal || 0),
    tax_total: typeof raw?.tax_total === 'number' ? raw.tax_total : Number(raw?.tax_total || 0),
    total_amount: typeof totalAmount === 'number' ? totalAmount : Number(totalAmount || 0),
    items,
    metadata: raw?.metadata && typeof raw.metadata === 'object' ? raw.metadata : {},
    created_at: raw?.created_at || raw?.issued_at || new Date().toISOString(),
    updated_at: raw?.updated_at || raw?.created_at || raw?.issued_at || new Date().toISOString(),
  };
}

function normalizePayment(raw: any): PaymentSummary {
  return {
    ...raw,
    partner_id: raw?.partner_id ?? null,
    amount: typeof raw?.amount === 'number' ? raw.amount : Number(raw?.amount || 0),
    metadata: raw?.metadata && typeof raw.metadata === 'object' ? raw.metadata : {},
    created_at: raw?.created_at || raw?.received_at || new Date().toISOString(),
    updated_at: raw?.updated_at || raw?.received_at || raw?.created_at || new Date().toISOString(),
    applications: Array.isArray(raw?.applications) ? raw.applications : [],
    linked_order_ids: Array.isArray(raw?.linked_order_ids) ? raw.linked_order_ids : [],
  };
}

function normalizeOrderToken(value: unknown): string | null {
  if (!value) {
    return null;
  }

  const normalized = String(value).toUpperCase().replace(/^(SO-|RCPT-|TRX)/, '').replace(/[^A-Z0-9]/g, '');
  return normalized || null;
}

function paymentMatchesOrder(payment: PaymentSummary, order: SalesOrder): boolean {
  const metadata = payment.metadata || {};
  const linkedOrderIds = new Set([
    ...(payment.linked_order_ids || []),
    ...((payment.applications || []).map((app) => app.sales_order_id).filter(Boolean) as string[]),
    metadata.sales_order_id,
    metadata.order_id,
  ].filter(Boolean));

  if (linkedOrderIds.has(order.id)) {
    return true;
  }

  const orderNumbers = new Set([
    payment.payment_number,
    metadata.order_number,
    metadata.sales_order_number,
    payment.reference,
  ].filter(Boolean));

  for (const value of orderNumbers) {
    if (String(value).includes(order.order_number)) {
      return true;
    }
  }

  const normalizedOrderNumber = normalizeOrderToken(order.order_number);
  if (!normalizedOrderNumber) {
    return false;
  }

  for (const value of orderNumbers) {
    const normalizedValue = normalizeOrderToken(value);
    if (normalizedValue && normalizedValue.includes(normalizedOrderNumber)) {
      return true;
    }
  }

  return false;
}

class OrderService {
  private getHeaders() {
    return getDefaultHeaders();
  }

  private getAccountId() {
    return getActiveAccountId();
  }

  /**
   * Valida disponibilidad de stock antes de crear orden
   * POST /accounts/{account_id}/sales-orders/validate-stock
   */
  async validateStock(items: ValidateStockRequest['items']): Promise<ValidateStockResponse> {
    try {
      const response = await httpClient.post<ValidateStockResponse>(
        API_ENDPOINTS.VALIDATE_STOCK(this.getAccountId()),
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
        log.orders.info('Validación de stock omitida - endpoint no disponible');
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
        API_ENDPOINTS.CANCEL_ORDER(this.getAccountId(), orderId),
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
        log.orders.info('Cancelación de orden no disponible - endpoint no existe');
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
        API_ENDPOINTS.SUBMIT_ORDER(this.getAccountId(), orderId),
        {
          validate_stock: options?.validateStock ?? true,
          reservation_ttl_hours: options?.reservationTtlHours ?? 48,
          event_id: eventId
        },
        { headers: this.getHeaders() }
      );

      return response;
    } catch (error) {
      log.orders.error('Error enviando orden:', error);
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
        API_ENDPOINTS.CONFIRM_PAYMENT(this.getAccountId(), orderId),
        {
          payment_reference: paymentReference,
          event_id: eventId,
          notes: notes
        },
        { headers: this.getHeaders() }
      );

      return response;
    } catch (error) {
      log.orders.error('Error confirmando pago:', error);
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
      log.orders.error('Error confirmando orden:', error);
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
        `${API_ENDPOINTS.TRANSITION_ORDER(this.getAccountId(), orderId)}?to_status=${toStatus}`,
        {
          reason: reason,
          event_id: eventId
        },
        { headers: this.getHeaders() }
      );

      return response;
    } catch (error) {
      log.orders.error('Error en transición de orden:', error);
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
        API_ENDPOINTS.VALID_TRANSITIONS(this.getAccountId(), orderId),
        { headers: this.getHeaders() }
      );
      return response;
    } catch (error) {
      log.orders.error('Error obteniendo transiciones válidas:', error);
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
        API_ENDPOINTS.STATUS_HISTORY(this.getAccountId(), orderId),
        { headers: this.getHeaders() }
      );
      return response;
    } catch (error) {
      log.orders.error('Error obteniendo historial de estados:', error);
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
        API_ENDPOINTS.RETURN_ORDER(this.getAccountId(), orderId),
        {
          ...data,
          event_id: data.event_id || eventId
        },
        { headers: this.getHeaders() }
      );

      return response;
    } catch (error) {
      log.orders.error('Error procesando devolución:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las órdenes de venta
   */
  async getOrders(params?: GetOrdersParams): Promise<OrdersResponse> {
    try {
      const response = await httpClient.get<any>(
        API_ENDPOINTS.SALES_ORDERS(this.getAccountId()),
        {
          headers: this.getHeaders(),
          params: params
        }
      );

      if (Array.isArray(response)) {
        return {
          data: response.map(normalizeSalesOrder),
          pagination: {
            page: 1,
            per_page: response.length,
            total: response.length,
            total_pages: 1,
          }
        };
      }

      // Si viene paginado, normalizar cada orden dentro de response.data
      if (response && Array.isArray(response.data)) {
        return {
          data: response.data.map(normalizeSalesOrder),
          pagination: {
            page: response.page ?? params?.page ?? 1,
            per_page: response.per_page ?? params?.per_page ?? response.data.length,
            total: response.total ?? response.data.length,
            total_pages: response.total_pages ?? 1,
          },
        };
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
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene una orden específica por ID
   */
  async getOrder(orderId: string): Promise<SalesOrder> {
    try {
      const response = await httpClient.get<any>(
        API_ENDPOINTS.SALES_ORDER(this.getAccountId(), orderId),
        {
          headers: this.getHeaders(),
        }
      );

      // La API devuelve { success, data: { id, order_number, ... } }
      return normalizeSalesOrder(unwrapApiResponse<any>(response));
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

  async getPayments(params?: GetPaymentsParams): Promise<PaymentSummary[]> {
    try {
      const response = await httpClient.get<any>(
        API_ENDPOINTS.PAYMENTS(this.getAccountId()),
        {
          headers: this.getHeaders(),
          params,
        }
      );

      const items = Array.isArray(response) ? response : unwrapApiResponse<any[]>(response);
      return Array.isArray(items) ? items.map(normalizePayment) : [];
    } catch (error) {
      log.orders.error('Error obteniendo pagos:', error);
      throw error;
    }
  }

  async getPaymentApplications(paymentId: string): Promise<ApplyPaymentResponse[]> {
    try {
      const response = await httpClient.get<any>(
        API_ENDPOINTS.PAYMENT_APPLICATIONS(this.getAccountId(), paymentId),
        { headers: this.getHeaders() }
      );
      const items = Array.isArray(response) ? response : unwrapApiResponse<any[]>(response);
      return Array.isArray(items) ? items : [];
    } catch (error) {
      log.orders.warn('No se pudieron obtener aplicaciones de pago:', { paymentId, error });
      return [];
    }
  }

  async getUserPayments(customerId: string): Promise<PaymentSummary[]> {
    const payments = await this.getPayments({ partner_id: customerId });
    const applicationsByPayment = await Promise.all(
      payments.map(async (payment) => ({
        paymentId: payment.id,
        applications: await this.getPaymentApplications(payment.id),
      }))
    );

    return payments.map((payment) => {
      const applications = applicationsByPayment.find((entry) => entry.paymentId === payment.id)?.applications || [];
      return {
        ...payment,
        applications,
        linked_order_ids: applications
          .map((application) => application.sales_order_id)
          .filter(Boolean) as string[],
      };
    });
  }

  async getUserOrdersWithPayments(
    customerId: string,
    params?: Omit<GetOrdersParams, 'customer_id'>
  ): Promise<UserOrdersWithPaymentsResponse> {
    const [ordersResponse, payments] = await Promise.all([
      this.getUserOrders(customerId, params),
      this.getUserPayments(customerId),
    ]);

    const orders = ordersResponse.data.map((order) => {
      const orderPayments = payments.filter((payment) => paymentMatchesOrder(payment, order));
      const lastPaymentAt = orderPayments
        .map((payment) => payment.received_at || payment.updated_at || payment.created_at)
        .filter(Boolean)
        .sort()
        .at(-1);

      return {
        ...order,
        payments: orderPayments,
        payment_summary: {
          total: orderPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
          count: orderPayments.length,
          last_payment_at: lastPaymentAt,
        },
      };
    });

    return {
      data: orders,
      pagination: ordersResponse.pagination,
      payments,
    };
  }

  async getOrderDetail(orderId: string): Promise<SalesOrder> {
    const [order, statusHistoryResponse] = await Promise.all([
      this.getOrder(orderId),
      this.getStatusHistory(orderId).catch(() => null),
    ]);

    return {
      ...order,
      status_history: statusHistoryResponse?.data?.history || [],
    };
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
      const response = await httpClient.post<any>(
        API_ENDPOINTS.SALES_ORDERS(this.getAccountId()),
        orderData,
        {
          headers: this.getHeaders(),
        }
      );

      // La API devuelve { success, data: { id, order_number, ... } }
      const order = normalizeSalesOrder(unwrapApiResponse<any>(response)) as CreateSalesOrderResponse;
      log.orders.debug('createSalesOrder unwrapped:', { id: order.id, order_number: order.order_number });
      return order;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crea un pago
   */
  async createPayment(paymentData: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      const response = await httpClient.post<any>(
        API_ENDPOINTS.PAYMENTS(this.getAccountId()),
        paymentData,
        {
          headers: this.getHeaders(),
        }
      );

      // La API devuelve { success, data: { id, payment_number, ... } }
      const payment = normalizePayment(unwrapApiResponse<any>(response));
      log.orders.debug('createPayment unwrapped:', { id: payment.id, payment_number: payment.payment_number });
      return payment;
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
      const response = await httpClient.post<any>(
        API_ENDPOINTS.PAYMENT_APPLICATIONS(this.getAccountId(), paymentId),
        application,
        { headers: this.getHeaders() }
      );
      return unwrapApiResponse<ApplyPaymentResponse>(response);
    } catch (error) {
      log.orders.error('Error aplicando pago:', error);
      throw error;
    }
  }

  /**
   * Genera una factura desde una orden de venta
   * POST /accounts/{account_id}/sales-orders/{order_id}/invoice
   */
  async generateInvoice(orderId: string, invoiceData: GenerateInvoiceRequest): Promise<GenerateInvoiceResponse> {
    try {
      const response = await httpClient.post<any>(
        API_ENDPOINTS.GENERATE_INVOICE(this.getAccountId(), orderId),
        invoiceData,
        { headers: this.getHeaders() }
      );
      return unwrapApiResponse<GenerateInvoiceResponse>(response);
    } catch (error) {
      log.orders.error('Error generando factura:', error);
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
      const response = await httpClient.post<any>(
        API_ENDPOINTS.BUSINESS_PARTNERS(this.getAccountId()),
        data,
        {
          headers: this.getHeaders(),
        }
      );

      // La API devuelve { success, data: { id, name, ... } }
      return unwrapApiResponse<BusinessPartnerResponse>(response);
    } catch (error) {
      log.orders.error('Error creating business partner:', error);
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
      const { shippingInfo, items, lineItemsMetadata, currency, totalAmount, paymentMethod, notes } = checkoutData;
      const activeChannel = getActiveChannel();
      
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
              log.checkout.warn('Usando user.id como customer_id (fallback):', customerId);
            }
          }
        } catch (e) {
          log.checkout.error('Error obteniendo user.id del store:', e);
        }
      }
      
      if (!customerId) {
        log.checkout.error('No se encontró customer_id - el usuario debe estar logueado');
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
      
      log.checkout.info('Business Partner ID:', customerId);
      
      // 2. Crear orden de venta (siempre se crea en draft)
      const orderNumber = this.generateOrderNumber();
      log.checkout.info('Paso 1: Creando orden de venta (draft)...');
      
      salesOrder = await this.createSalesOrder({
        order_number: orderNumber,
        customer_id: customerId,
        currency: currency,
        items: items,
        notes: notes || `Entrega a: ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}. Tel: ${shippingInfo.phone}`,
        metadata: {
          channel: activeChannel,
          shipping_info: shippingInfo,
          payment_method: paymentMethod,
          line_items_variant_info: Array.isArray(lineItemsMetadata)
            ? lineItemsMetadata.filter((item) => item.variant_id)
            : []
        }
      });
      
      log.checkout.info('Orden creada (draft):', salesOrder.order_number);
      
      // 3. Submit: draft → pending_payment (reserva stock)
      log.checkout.info('Paso 2: Enviando pedido (submit → pending_payment)...');
      
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
      log.checkout.info('Pedido enviado - stock reservado');
      
      // 4. Crear pago asociado
      const paymentNumber = this.generatePaymentNumber(orderNumber);
      log.checkout.info('Paso 3: Creando pago...');
      
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
          channel: activeChannel,
          sales_order_id: salesOrder.id,
          order_number: salesOrder.order_number,
          payment_method_details: paymentMethod,
          customer_info: {
            name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
            email: shippingInfo.email
          }
        }
      });
      
      log.checkout.info('Pago creado:', payment.payment_number);

      try {
        await this.applyPayment(payment.id, {
          sales_order_id: salesOrder.id,
          amount_applied: totalAmount,
        });
      } catch (applicationError) {
        log.checkout.warn('No se pudo vincular el pago con la orden mediante applications:', applicationError);
      }
      
      // 5. Confirm Payment: pending_payment → confirmed (deduce stock)
      log.checkout.info('Paso 4: Confirmando pago (confirm-payment → confirmed)...');
      
      const confirmResult = await this.confirmPayment(
        salesOrder.id,
        payment.payment_number,
        `Pago ${paymentMethod} - ${payment.payment_number}`
      );
      
      if (!confirmResult.success) {
        log.checkout.warn('Pago creado pero confirmación falló:', confirmResult.message);
        // La orden queda en pending_payment, no es un error fatal
      } else {
        log.checkout.info('Pago confirmado - stock deducido');
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
      log.checkout.error('Error en checkout:', error);
      
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
  PaymentSummary,
  GetPaymentsParams,
  UserOrdersWithPaymentsResponse,
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
