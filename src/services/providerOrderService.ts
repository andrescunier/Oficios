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

export const providerOrderService = {
  async listMine(): Promise<ProviderOrder[]> {
    const response = await orderService.getOrders({ page: 1, per_page: 50 });
    return (response.data || []) as unknown as ProviderOrder[];
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
      let paymentStatus = order.status;
      let paidAmount = 0;
      try {
        const status = await this.getStorefrontStatus(order.id);
        paymentStatus = status.payment?.status || order.status;
        paidAmount = Number(status.payment?.amount_paid || 0);
      } catch {
        if (PAID_LIKE.has(String(order.status || '').toLowerCase())) {
          paidAmount = Number(order.total || 0);
          paymentStatus = 'pending_backend_validation';
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
