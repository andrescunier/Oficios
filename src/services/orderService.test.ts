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
  getLoanConfig: () => ({
    enabled: true,
    providerName: 'Prestameya',
    monthlyRate: 0.035,
    terms: [{ months: 6, label: '6 pagos', monthlyRate: 0.035 }],
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

  it('creates a loan after submitting a loan checkout', async () => {
    vi.mocked(httpClient.post).mockImplementation(async (url: string, body?: any) => {
      if (url === '/api/accounts/account-1/sales-orders') {
        return {
          success: true,
          data: {
            id: 'order-1',
            order_number: 'SO-1',
            customer_id: 'customer-1',
            currency: 'ARS',
            status: 'draft',
            total_amount: 1000,
            items: body.items,
            created_at: '2026-05-18T12:00:00Z',
            updated_at: '2026-05-18T12:00:00Z',
          },
        };
      }

      if (url === '/api/accounts/account-1/sales-orders/order-1/submit') {
        return {
          success: true,
          data: { order_id: 'order-1', from_status: 'draft', to_status: 'pending_payment' },
        };
      }

      if (url === '/api/accounts/account-1/loans') {
        return {
          success: true,
          data: {
            id: 'loan-1',
            account_id: 'account-1',
            borrower_id: body.borrower_id,
            loan_number: body.loan_number,
            currency: body.currency,
            principal_amount: body.principal_amount,
            outstanding_balance: body.principal_amount,
            interest_rate: body.interest_rate,
            issued_at: body.issued_at,
            due_at: body.due_at,
            status: 'active',
            metadata: body.metadata,
            created_at: '2026-05-18T12:00:00Z',
            updated_at: '2026-05-18T12:00:00Z',
          },
        };
      }

      throw new Error(`Unexpected POST ${url}`);
    });

    const result = await orderService.processCheckout({
      shippingInfo: {
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@example.com',
        phone: '123',
        address: 'Street 123',
        city: 'Buenos Aires',
        state: 'BA',
        zipCode: '1000',
        country: 'AR',
      },
      items: [{ product_id: 'product-1', description: 'Producto', quantity: 1, unit_price: 1000, tax_rate: 0.21 }],
      lineItemsMetadata: [],
      currency: 'ARS',
      totalAmount: 1000,
      paymentMethod: 'prestamo',
    });

    expect(result.success).toBe(true);
    expect(result.loan?.loan_number).toBe('LN-SO-1');
    expect(httpClient.post).toHaveBeenCalledWith('/api/accounts/account-1/loans', expect.objectContaining({
      borrower_id: 'customer-1',
      principal_amount: 1000,
      metadata: expect.objectContaining({
        sales_order_id: 'order-1',
        sales_order_number: 'SO-1',
      }),
    }));
  });

  it('hydrates loan status and payments for loan order detail', async () => {
    vi.mocked(httpClient.get).mockImplementation(async (url: string) => {
      if (url === '/api/accounts/account-1/sales-orders/order-1') {
        return {
          success: true,
          data: {
            id: 'order-1',
            order_number: 'SO-1',
            customer_id: 'customer-1',
            currency: 'ARS',
            status: 'pending_payment',
            total_amount: 1000,
            items: [],
            metadata: { payment_method: 'prestamo' },
            created_at: '2026-05-18T12:00:00Z',
            updated_at: '2026-05-18T12:00:00Z',
          },
        };
      }

      if (url === '/api/accounts/account-1/sales-orders/order-1/status-history') {
        return {
          success: true,
          data: { order_id: 'order-1', current_status: 'pending_payment', history: [] },
        };
      }

      if (url === '/api/accounts/account-1/sales-orders/order-1/storefront-status') {
        return {
          success: true,
          data: {
            order: {
              id: 'order-1',
              order_number: 'SO-1',
              customer_id: 'customer-1',
              currency: 'ARS',
              status: 'pending_payment',
              total_amount: 1000,
              items: [],
              metadata: { payment_method: 'prestamo' },
              created_at: '2026-05-18T12:00:00Z',
              updated_at: '2026-05-18T12:00:00Z',
            },
            payment: { status: 'pending_backend_validation', amount_applied: 0, currency: 'ARS' },
            delivery: { status: 'not_created', delivery_count: 0 },
          },
        };
      }

      if (url === '/api/accounts/account-1/loans') {
        return {
          data: [{
            id: 'loan-1',
            account_id: 'account-1',
            borrower_id: 'customer-1',
            loan_number: 'LN-SO-1',
            currency: 'ARS',
            principal_amount: 1000,
            outstanding_balance: 700,
            interest_rate: 21,
            issued_at: '2026-05-18',
            due_at: '2026-11-18',
            status: 'active',
            metadata: { sales_order_id: 'order-1', sales_order_number: 'SO-1' },
            created_at: '2026-05-18T12:00:00Z',
            updated_at: '2026-05-18T12:00:00Z',
          }],
          pagination: { page: 1, per_page: 100, total: 1, total_pages: 1 },
        };
      }

      if (url === '/api/accounts/account-1/loans/loan-1/payments') {
        return {
          data: [{
            id: 'payment-1',
            loan_id: 'loan-1',
            amount: 300,
            paid_at: '2026-06-18',
            balance_before: 1000,
            balance_after: 700,
            created_at: '2026-06-18T12:00:00Z',
          }],
          pagination: { page: 1, per_page: 100, total: 1, total_pages: 1 },
        };
      }

      throw new Error(`Unexpected GET ${url}`);
    });

    const detail = await orderService.getOrderDetail('order-1');

    expect(detail.related_loan?.loan_number).toBe('LN-SO-1');
    expect(detail.related_loan?.outstanding_balance).toBe(700);
    expect(detail.related_loan_payments).toHaveLength(1);
    expect(detail.related_loan_payments?.[0].balance_after).toBe(700);
  });
});
