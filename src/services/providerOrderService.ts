import { httpClient } from './httpClient';
import { API_ENDPOINTS, getActiveAccountId } from '@/config/api';
import { orderService } from './orderService';

export interface ProviderOrderItem {
  id?: string;
  product_id?: string;
  description?: string;
  quantity?: number;
  unit_price?: number;
  line_total?: number;
}

export interface ProviderOrder {
  id: string;
  order_number: string;
  status: string;
  currency?: string;
  total?: number;
  subtotal?: number;
  notes?: string | null;
  created_at?: string;
  issued_at?: string | null;
  due_at?: string | null;
  customer?: {
    id?: string;
    name?: string;
    email?: string | null;
    phone?: string | null;
  } | null;
  shipping_address?: {
    line1?: string;
    line2?: string | null;
    city?: string;
    state?: string | null;
  } | null;
  items?: ProviderOrderItem[];
  metadata?: Record<string, unknown>;
}

export interface ProviderCobro {
  orderId: string;
  orderNumber: string;
  status: string;
  grossTotal: number;
  currency: string;
  paymentStatus: string;
  paidAmount: number;
  createdAt?: string;
  serviceName: string;
}

const PAID_LIKE = new Set([
  'paid',
  'validated',
  'partially_paid',
  'confirmed',
  'preparing',
  'ready_to_ship',
  'shipped',
  'delivered',
  'completed',
]);

const extractOrder = (response: unknown): ProviderOrder => {
  if (response && typeof response === 'object') {
    if ('id' in response) return response as ProviderOrder;
    const envelope = response as { data?: ProviderOrder };
    if (envelope.data && typeof envelope.data === 'object') {
      return envelope.data;
    }
  }
  throw new Error('No se pudo procesar la respuesta de la reserva');
};

export const getServiceReservation = (order: ProviderOrder) => {
  const meta = (order.metadata || {}) as Record<string, unknown>;
  const reservation = (meta.service_reservation || {}) as Record<string, unknown>;
  return {
    providerStatus: String(reservation.provider_status || 'pending_accept'),
    qualityOk: reservation.quality_ok === true,
    barrio: (reservation.barrio || reservation.locality || null) as string | null,
    serviceDate: (reservation.service_date || null) as string | null,
    serviceTime: (reservation.service_time || null) as string | null,
    scheduledAt: (reservation.scheduled_at || null) as string | null,
    workDetail: (reservation.work_detail || null) as string | null,
  };
};

export const providerOrderService = {
  async listMine(): Promise<ProviderOrder[]> {
    const response = await orderService.getOrders({ page: 1, per_page: 50 });
    return (response.data || []) as unknown as ProviderOrder[];
  },

  async respond(orderId: string, action: 'accept' | 'reject', reason?: string): Promise<ProviderOrder> {
    const accountId = getActiveAccountId();
    const response = await httpClient.post(
      API_ENDPOINTS.SUPPLIER_RESPOND_ORDER(accountId, orderId),
      { action, reason: reason || null },
    );
    return extractOrder(response);
  },

  async getStorefrontStatus(orderId: string): Promise<{
    payment?: { status?: string; amount_paid?: number; amount_total?: number };
    order?: { status?: string; total?: number };
  }> {
    const accountId = getActiveAccountId();
    const response = await httpClient.get(API_ENDPOINTS.ORDER_STOREFRONT_STATUS(accountId, orderId));
    const body = response.data;
    if (body && typeof body === 'object' && 'data' in body) {
      return (body as { data: Record<string, unknown> }).data as {
        payment?: { status?: string; amount_paid?: number; amount_total?: number };
        order?: { status?: string; total?: number };
      };
    }
    return body as {
      payment?: { status?: string; amount_paid?: number; amount_total?: number };
      order?: { status?: string; total?: number };
    };
  },

  async listCobros(orders: ProviderOrder[]): Promise<ProviderCobro[]> {
    const cobros: ProviderCobro[] = [];
    for (const order of orders) {
      const reservation = getServiceReservation(order);
      let paymentStatus = order.status;
      let paidAmount = 0;
      const meta = (order.metadata || {}) as Record<string, unknown>;
      const paymentIntent = (meta.payment_intent || {}) as Record<string, unknown>;

      if (!reservation.qualityOk || paymentIntent.status === 'held_until_quality_ok') {
        paymentStatus = 'held_until_quality_ok';
        paidAmount = 0;
      } else {
        try {
          const status = await this.getStorefrontStatus(order.id);
          paymentStatus = status.payment?.status || String(paymentIntent.status || order.status);
          paidAmount = Number(status.payment?.amount_paid || 0);
        } catch {
          if (PAID_LIKE.has(String(order.status || '').toLowerCase())) {
            paidAmount = Number(order.total || 0);
            paymentStatus = 'pending_backend_validation';
          }
        }
      }
      const serviceName =
        order.items?.map((i) => i.description).filter(Boolean).join(', ')
        || 'Servicio';
      cobros.push({
        orderId: order.id,
        orderNumber: order.order_number,
        status: order.status,
        grossTotal: Number(order.total || 0),
        currency: order.currency || 'ARS',
        paymentStatus,
        paidAmount,
        createdAt: order.created_at,
        serviceName,
      });
    }
    return cobros;
  },
};
