import { beforeEach, describe, expect, it, vi } from 'vitest';
import { orderService } from './orderService';
import { httpClient } from './httpClient';

vi.mock('./httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('@/config/runtime', () => ({
  getApiConfig: () => ({
    accountId: 'account-1',
    accountSlug: '',
    channel: 'ecommerce',
    url: 'https://api.example.com',
    extraHeaders: {},
  }),
}));

vi.mock('@/features/auth/session', () => ({
  extractCustomerIdFromPersistedSession: () => 'customer-1',
}));

describe('orderService storefront status contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hydrates order detail with payment and delivery status from storefront-status', async () => {
    vi.mocked(httpClient.get).mockImplementation(async (url: string) => {
      if (url.endsWith('/storefront-status')) {
        return {
          success: true,
          data: {
            order: {
              id: 'order-1',
              order_number: 'SO-1',
              customer_id: 'customer-1',
              currency: 'ARS',
              status: 'pending_payment',
              total: 100,
              items: [],
              metadata: { payment_method: 'transfer' },
              created_at: '2026-05-03T12:00:00Z',
            },
            payment: {
              status: 'paid',
              method: 'transfer',
              amount_applied: 100,
              currency: 'ARS',
            },
            delivery: {
              status: 'in_transit',
              delivery_count: 1,
              carrier_name: 'Andreani',
              tracking_reference: 'TRK-1',
            },
          },
        };
      }

      if (url.endsWith('/status-history')) {
        return {
          success: true,
          data: {
            order_id: 'order-1',
            current_status: 'pending_payment',
            history: [],
          },
        };
      }

      return {
        success: true,
        data: {
          id: 'order-1',
          order_number: 'SO-1',
          customer_id: 'customer-1',
          currency: 'ARS',
          status: 'pending_payment',
          total: 100,
          items: [],
          metadata: { payment_method: 'transfer' },
          created_at: '2026-05-03T12:00:00Z',
        },
      };
    });

    const detail = await orderService.getOrderDetail('order-1');

    expect(httpClient.get).toHaveBeenCalledWith('/api/accounts/account-1/sales-orders/order-1/storefront-status');
    expect(detail.storefront_status?.payment.status).toBe('paid');
    expect(detail.storefront_status?.delivery.tracking_reference).toBe('TRK-1');
  });
});
