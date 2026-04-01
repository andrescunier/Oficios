import type { ApiError } from '@/types/api';
import type { CheckoutProcessResult } from '@/services/orderService';

export interface CheckoutFailureDescriptor {
  code:
    | 'session_expired'
    | 'stock_conflict'
    | 'payment_failed'
    | 'duplicate_order'
    | 'validation_error'
    | 'network_error'
    | 'server_error'
    | 'order_failed'
    | 'unknown';
  title: string;
  message: string;
  action: 'login' | 'review_cart' | 'retry' | 'contact_support' | 'stay';
  redirectTo?: string;
  shouldInvalidateSession?: boolean;
  orderNumber?: string;
  status?: number;
  supportCode: string;
}

const hasText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const toLowerText = (value: unknown) => (hasText(value) ? value.toLowerCase() : '');

const extractStatus = (value: unknown): number | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const maybeStatus = (value as { status?: unknown }).status;
  return typeof maybeStatus === 'number' ? maybeStatus : undefined;
};

const extractMessage = (value: unknown): string => {
  if (hasText(value)) {
    return value;
  }

  if (value && typeof value === 'object') {
    const message = (value as { message?: unknown }).message;
    if (hasText(message)) {
      return message;
    }

    const details = (value as { details?: unknown }).details;
    if (details && typeof details === 'object') {
      const nestedMessage = (details as { message?: unknown }).message;
      if (hasText(nestedMessage)) {
        return nestedMessage;
      }
    }
  }

  return 'unknown_error';
};

const buildSupportCode = (step: string, status?: number, orderNumber?: string) =>
  [step || 'unknown', status || 'na', orderNumber || 'na'].join(':').toUpperCase();

const includesAny = (text: string, terms: string[]) => terms.some((term) => text.includes(term));

const looksLikeStockIssue = (message: string) =>
  includesAny(message, ['stock', 'sin stock', 'inventory', 'reserva', 'reservation', 'insuficiente']);

const looksLikeDuplicateOrder = (message: string) =>
  includesAny(message, ['duplic', 'already processed', 'ya fue procesada', 'ya fue creada']);

const isCheckoutProcessResult = (value: unknown): value is CheckoutProcessResult =>
  Boolean(value && typeof value === 'object' && 'success' in value && 'salesOrder' in value);

export const isCheckoutSuccess = (
  value: CheckoutProcessResult
): value is CheckoutProcessResult & { success: true; salesOrder: NonNullable<CheckoutProcessResult['salesOrder']> } =>
  Boolean(value.success && value.salesOrder);

export const normalizeCheckoutFailure = (source: CheckoutProcessResult | ApiError | unknown): CheckoutFailureDescriptor => {
  let step = 'unknown';
  let status: number | undefined;
  let message = 'unknown_error';
  let orderNumber: string | undefined;

  if (isCheckoutProcessResult(source) && !source.success) {
    step = source.error?.step || 'unknown';
    orderNumber = source.error?.orderNumber || source.orderNumber;
    status = extractStatus(source.error?.details);
    message = extractMessage(source.error?.details);

    if (message === 'unknown_error' && hasText(source.message)) {
      message = source.message;
    }
  } else {
    const apiError = source as ApiError | undefined;
    step = 'unknown';
    status = apiError?.status;
    message = extractMessage(apiError);
  }

  const lowerMessage = toLowerText(message);
  const supportCode = buildSupportCode(step, status, orderNumber);

  if (step === 'authentication' || status === 401) {
    return {
      code: 'session_expired',
      title: 'Sesión expirada',
      message: 'Tu sesión ya no es válida. Volvé a iniciar sesión para terminar la compra.',
      action: 'login',
      redirectTo: '/login?session=expired',
      shouldInvalidateSession: true,
      status,
      orderNumber,
      supportCode,
    };
  }

  if (looksLikeStockIssue(lowerMessage) || step === 'stock_validation' || (step === 'submit' && status === 409)) {
    return {
      code: 'stock_conflict',
      title: 'Stock insuficiente',
      message: 'No hay stock suficiente para uno o más productos. Revisá tu carrito antes de volver a intentar.',
      action: 'review_cart',
      redirectTo: '/carrito',
      status,
      orderNumber,
      supportCode,
    };
  }

  if (looksLikeDuplicateOrder(lowerMessage) || status === 409) {
    return {
      code: 'duplicate_order',
      title: 'Orden duplicada',
      message: 'Esta compra ya fue procesada o quedó en curso. Revisá tus pedidos antes de intentar nuevamente.',
      action: 'stay',
      status,
      orderNumber,
      supportCode,
    };
  }

  if (step === 'payment' || status === 402) {
    return {
      code: 'payment_failed',
      title: 'Pago no validado',
      message: orderNumber
        ? `La orden ${orderNumber} fue creada, pero el backend no pudo validar el pago informado. No repitas la compra y contactá a soporte si no recibís novedades.`
        : 'El backend no pudo validar el pago informado. No repitas la compra hasta verificar el estado de la orden.',
      action: 'contact_support',
      status,
      orderNumber,
      supportCode,
    };
  }

  if (status === 400) {
    return {
      code: 'validation_error',
      title: 'Datos inválidos',
      message: 'Revisá la información ingresada y volvé a intentar.',
      action: 'stay',
      status,
      orderNumber,
      supportCode,
    };
  }

  if (status !== undefined && status >= 500) {
    return {
      code: 'server_error',
      title: 'Error del servidor',
      message: 'El servidor no pudo completar la operación. Intentá nuevamente en unos minutos.',
      action: 'retry',
      status,
      orderNumber,
      supportCode,
    };
  }

  if (includesAny(lowerMessage, ['network', 'timeout', 'failed to fetch', 'conexion', 'conexión'])) {
    return {
      code: 'network_error',
      title: 'Error de conexión',
      message: 'Se perdió la conexión con el servidor. Verificá tu red y volvé a intentar.',
      action: 'retry',
      status,
      orderNumber,
      supportCode,
    };
  }

  if (step === 'order' || step === 'submit') {
    return {
      code: 'order_failed',
      title: 'No se pudo procesar la orden',
      message: 'No pudimos completar la orden. Revisá el carrito o intentá nuevamente más tarde.',
      action: step === 'submit' ? 'review_cart' : 'retry',
      redirectTo: step === 'submit' ? '/carrito' : undefined,
      status,
      orderNumber,
      supportCode,
    };
  }

  return {
    code: 'unknown',
    title: 'Error al procesar el pedido',
    message: 'Ocurrió un problema inesperado. Si persiste, contactá a soporte con el código indicado.',
    action: 'stay',
    status,
    orderNumber,
    supportCode,
  };
};
