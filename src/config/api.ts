/**
 * Configuración de API para storefront.
 * Fuente de verdad: docs/BACKEND_CONTRACT.md
 */

import { getApiConfig } from './runtime';

/**
 * Devuelve el accountId vigente leyendo SIEMPRE el runtime config actual
 * desde runtime config.
 */
export const getActiveAccountId = (): string => {
  return getApiConfig().accountId;
};

export const getActiveAccountSlug = (): string => {
  return getApiConfig().accountSlug;
};

export const getActiveChannel = (): string => {
  return getApiConfig().channel || 'ecommerce';
};

// Configuración de headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

export const getDefaultHeaders = () => ({
  ...DEFAULT_HEADERS,
  ...getApiConfig().extraHeaders,
  'X-Account-ID': getActiveAccountId(),
});

// Endpoints aprobados para storefront
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },

  // Registro de clientes
  SIMPLE: {
    REGISTER_CUSTOMER: '/api/simple/register-customer',
  },

  // Productos
  PRODUCTS: (accountId: string) => `/api/accounts/${accountId}/products`,
  PRODUCT: (accountId: string, productId: string) => `/api/accounts/${accountId}/products/${productId}`,
  PRODUCTS_PUBLIC: (accountId: string) => `/api/accounts/${accountId}/products/public`,

  // Órdenes de Venta
  SALES_ORDERS: (accountId: string) => `/api/accounts/${accountId}/sales-orders`,
  SALES_ORDER: (accountId: string, orderId: string) => `/api/accounts/${accountId}/sales-orders/${orderId}`,
  VALIDATE_STOCK: (accountId: string) => `/api/accounts/${accountId}/sales-orders/validate-stock`,
  ORDER_INVOICE: (accountId: string, orderId: string) => `/api/accounts/${accountId}/sales-orders/${orderId}/invoice`,
  SUBMIT_ORDER: (accountId: string, orderId: string) => `/api/accounts/${accountId}/sales-orders/${orderId}/submit`,
  SHIP_ORDER: (accountId: string, orderId: string) => `/api/accounts/${accountId}/sales-orders/${orderId}/ship`,
  DELIVER_ORDER: (accountId: string, orderId: string) => `/api/accounts/${accountId}/sales-orders/${orderId}/deliver`,
  COMPLETE_ORDER: (accountId: string, orderId: string) => `/api/accounts/${accountId}/sales-orders/${orderId}/complete`,
  CANCEL_ORDER: (accountId: string, orderId: string) => `/api/accounts/${accountId}/sales-orders/${orderId}/cancel-v2`,
  RETURN_ORDER: (accountId: string, orderId: string) => `/api/accounts/${accountId}/sales-orders/${orderId}/return`,
  TRANSITION_ORDER: (accountId: string, orderId: string) => `/api/accounts/${accountId}/sales-orders/${orderId}/transition`,
  STATUS_HISTORY: (accountId: string, orderId: string) => `/api/accounts/${accountId}/sales-orders/${orderId}/status-history`,
  VALID_TRANSITIONS: (accountId: string, orderId: string) => `/api/accounts/${accountId}/sales-orders/${orderId}/valid-transitions`,

  // Ecommerce Config (tenant)
  ECOMMERCE_CONFIG: (accountId: string) => `/api/accounts/${accountId}/ecommerce-config`,
  FRONTEND_EVENTS: (accountId: string) => `/api/accounts/${accountId}/frontend-events`,
} as const;

// Configuración de timeouts
export const API_TIMEOUT = 30000; // 30 segundos

// Configuración de retry
export const RETRY_CONFIG = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error: any) => {
    return error.response?.status >= 500 || error.code === 'NETWORK_ERROR';
  }
};

// Configuración de React Query
export const QUERY_CONFIG = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
};

// Configuración de desarrollo
export const IS_DEVELOPMENT = import.meta.env.DEV;
export const IS_PRODUCTION = import.meta.env.PROD;

// Logging (obsoleto - ahora se usa src/lib/logger.ts con VITE_DEBUG)
// Se mantiene por si algún componente externo lo importa
export const enableApiLogging = false;
