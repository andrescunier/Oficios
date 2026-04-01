/**
 * Servicio para manejo de órdenes de venta del storefront.
 * El frontend informa intención y método de pago, pero no crea ni confirma pagos.
 */

import { httpClient } from './httpClient';
import { API_ENDPOINTS, getActiveAccountId, getActiveChannel, getDefaultHeaders } from '@/config/api';
import log from '@/lib/logger';
import { extractCustomerIdFromPersistedSession } from '@/features/auth/session';

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

interface CheckoutProcessError {
  step: 'authentication' | 'order' | 'submit' | 'payment' | 'business_partner' | 'stock_validation' | 'unknown';
  details?: unknown;
  orderNumber?: string;
}

interface CheckoutProcessResult {
  customerId?: string;
  salesOrder: CreateSalesOrderResponse | null;
  success: boolean;
  message: string;
  orderNumber?: string;
  paymentMethod?: string;
  error?: CheckoutProcessError;
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
      if (error.code === 'E3001' || error.response?.status === 404) {
        log.orders.error('Validación de stock ausente pese a ser parte del contrato storefront', error);
        throw new Error('El backend no expone la validación de stock requerida por el storefront.');
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
      if (error.code === 'E3001' || error.response?.status === 404) {
        log.orders.error('Cancelación de orden ausente pese a ser parte del contrato storefront', error);
        return {
          success: false,
          message: 'El backend no expone la cancelación de órdenes requerida por el storefront. Contactá a soporte.'
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
   * Genera una factura desde una orden de venta
   * POST /accounts/{account_id}/sales-orders/{order_id}/invoice
   */
  async generateInvoice(orderId: string, invoiceData: GenerateInvoiceRequest): Promise<GenerateInvoiceResponse> {
    try {
      const response = await httpClient.post<any>(
        API_ENDPOINTS.ORDER_INVOICE(this.getAccountId(), orderId),
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
   * Procesa una compra del storefront:
   * 1. Obtener customer_id
   * 2. Crear la orden de venta en draft
   * 3. Submit: draft -> pending_payment
   * 4. Informar método de pago y datos de entrega en metadata para validación backend
   */
  async processCheckout(checkoutData: CheckoutData, businessPartnerId?: string): Promise<CheckoutProcessResult> {
    let salesOrder: CreateSalesOrderResponse | null = null;
    let submitted = false;
    
    try {
      const { shippingInfo, items, lineItemsMetadata, currency, totalAmount, paymentMethod, notes } = checkoutData;
      const activeChannel = getActiveChannel();
      
      // 1. Obtener customer_id canónico del storefront: business_partner_id
      let customerId = businessPartnerId || extractCustomerIdFromPersistedSession();
      
      if (!customerId) {
        log.checkout.error('No se encontró customer_id - el usuario debe estar logueado');
        return {
          salesOrder: null,
          success: false,
          message: 'Debes iniciar sesión para realizar una compra. Si ya iniciaste sesión, intenta cerrar sesión y volver a entrar.',
          error: {
            step: 'authentication',
            details: 'No se encontró business_partner_id'
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
          payment_intent: {
            method: paymentMethod,
            amount: totalAmount,
            currency,
            informed_at: new Date().toISOString(),
          },
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
          success: false,
          message: submitResult.message || 'Error al enviar el pedido. Puede haber stock insuficiente.',
          error: {
            step: 'submit',
            details: submitResult,
            orderNumber: salesOrder.order_number,
          }
        };
      }
      
      submitted = true;
      log.checkout.info('Pedido enviado - stock reservado');
      
      log.checkout.info('Paso 3: Pago informado al backend. La validación y aprobación quedan del lado backend.');

      return {
        customerId: customerId,
        salesOrder,
        success: true,
        message: 'Pedido creado y enviado. El pago queda pendiente de validación por el backend.',
        orderNumber: salesOrder.order_number,
        paymentMethod,
      };
      
    } catch (error: any) {
      log.checkout.error('Error en checkout:', error);
      
      // Error al crear orden
      if (!salesOrder) {
        return {
          salesOrder: null,
          success: false,
          message: 'Error al crear la orden de venta',
          error: {
            step: 'order',
            details: error,
          }
        };
      }
      
      // Error al submit (orden creada pero no enviada)
      if (salesOrder && !submitted) {
        return {
          salesOrder,
          success: false,
          message: 'La orden fue creada pero no se pudo enviar. Puede haber stock insuficiente.',
          error: {
            step: 'submit',
            details: error,
            orderNumber: salesOrder.order_number,
          }
        };
      }
      
      // Error general
      return {
        salesOrder,
        success: false,
        message: 'La orden fue creada pero hubo un problema posterior al envío. No repitas la compra hasta revisar el estado.',
        orderNumber: salesOrder.order_number,
        error: {
          step: 'submit',
          details: error,
          orderNumber: salesOrder.order_number,
        }
      };
    }
  }
}

export const orderService = new OrderService();
export type { 
  CreateSalesOrderRequest, 
  CreateSalesOrderResponse, 
  SalesOrderItem,
  SalesOrder,
  GetOrdersParams,
  OrdersResponse,
  CheckoutData,
  ValidateStockRequest,
  ValidateStockResponse,
  CancelOrderRequest,
  CancelOrderResponse,
  OrderSubmitRequest,
  OrderSubmitResponse,
  StateTransitionResponse,
  ValidTransitionsResponse,
  StatusHistoryEntry,
  StatusHistoryResponse,
  ReturnItemRequest,
  OrderReturnRequest,
  OrderReturnResponse,
  CheckoutProcessError,
  CheckoutProcessResult,
};
