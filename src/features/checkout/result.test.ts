import { isCheckoutSuccess, normalizeCheckoutFailure } from './result';
import type { CheckoutProcessResult } from '@/services/orderService';

describe('checkout result', () => {
  it('detects successful checkout results', () => {
    const result = {
      success: true,
      message: 'ok',
      salesOrder: { id: 'so-1' },
    } as unknown as CheckoutProcessResult;

    expect(isCheckoutSuccess(result)).toBe(true);
  });

  it('normalizes session expiration failures', () => {
    const failure = normalizeCheckoutFailure({
      success: false,
      message: 'expired',
      salesOrder: null,
      error: {
        step: 'authentication',
        details: { status: 401, message: 'unauthorized' },
      },
    } as CheckoutProcessResult);

    expect(failure).toMatchObject({
      code: 'session_expired',
      shouldInvalidateSession: true,
      redirectTo: '/login?session=expired',
    });
  });

  it('normalizes stock conflicts from submit step', () => {
    const failure = normalizeCheckoutFailure({
      success: false,
      message: 'stock',
      salesOrder: { id: 'so-1', order_number: 'SO-1' },
      error: {
        step: 'submit',
        orderNumber: 'SO-1',
        details: { message: 'Stock insuficiente para continuar' },
      },
    } as unknown as CheckoutProcessResult);

    expect(failure).toMatchObject({
      code: 'stock_conflict',
      redirectTo: '/carrito',
      orderNumber: 'SO-1',
    });
  });

  it('normalizes payment failures preserving order number', () => {
    const failure = normalizeCheckoutFailure({
      success: false,
      message: 'payment failed',
      salesOrder: { id: 'so-1', order_number: 'SO-1' },
      error: {
        step: 'submit',
        orderNumber: 'SO-1',
        details: { status: 402, message: 'Backend rejected informed payment' },
      },
    } as unknown as CheckoutProcessResult);

    expect(failure.code).toBe('payment_failed');
    expect(failure.message).toContain('backend');
    expect(failure.message).toContain('SO-1');
  });
});
