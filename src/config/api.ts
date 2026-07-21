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

  // Registro de clientes y proveedores
  SIMPLE: {
    REGISTER_CUSTOMER: '/api/simple/register-customer',
    REGISTER_SUPPLIER: '/api/simple/register-supplier',
  },

  // Productos
  PRODUCTS: (accountId: string) => `/api/accounts/${accountId}/products`,
  PRODUCT: (accountId: string, productId: string) => `/api/accounts/${accountId}/products/${productId}`,
  PRODUCTS_PUBLIC: (accountId: string) => `/api/accounts/${accountId}/products/public`,
  PRODUCT_REVIEWS: (accountId: string, productId: string) =>
    `/api/accounts/${accountId}/products/${productId}/reviews`,
  PRODUCT_REVIEW_SUMMARY: (accountId: string, productId: string) =>
    `/api/accounts/${accountId}/products/${productId}/reviews/summary`,

  // Órdenes de Venta
  SALES_ORDERS: (accountId: string) => `/api/accounts/${accountId}/sales-orders`,
  SALES_ORDER: (accountId: string, orderId: string) => `/api/accounts/${accountId}/sales-orders/${orderId}`,
  VALIDATE_STOCK: (accountId: string) => `/api/accounts/${accountId}/sales-orders/validate-stock`,
  SUBMIT_ORDER: (accountId: string, orderId: string) => `/api/accounts/${accountId}/sales-orders/${orderId}/submit`,
  CANCEL_ORDER: (accountId: string, orderId: string) => `/api/accounts/${accountId}/sales-orders/${orderId}/cancel-v2`,
  RETURN_ORDER: (accountId: string, orderId: string) => `/api/accounts/${accountId}/sales-orders/${orderId}/return`,
  ORDER_STOREFRONT_STATUS: (accountId: string, orderId: string) => `/api/accounts/${accountId}/sales-orders/${orderId}/storefront-status`,
  SUPPLIER_RESPOND_ORDER: (accountId: string, orderId: string) =>
    `/api/accounts/${accountId}/sales-orders/${orderId}/supplier-respond`,
  QUALITY_OK_ORDER: (accountId: string, orderId: string) =>
    `/api/accounts/${accountId}/sales-orders/${orderId}/quality-ok`,
  STATUS_HISTORY: (accountId: string, orderId: string) => `/api/accounts/${accountId}/sales-orders/${orderId}/status-history`,
  VALID_TRANSITIONS: (accountId: string, orderId: string) => `/api/accounts/${accountId}/sales-orders/${orderId}/valid-transitions`,

  // Préstamos storefront
  LOANS: (accountId: string) => `/api/accounts/${accountId}/loans`,
  LOAN: (accountId: string, loanId: string) => `/api/accounts/${accountId}/loans/${loanId}`,
  LOAN_PAYMENTS: (accountId: string, loanId: string) => `/api/accounts/${accountId}/loans/${loanId}/payments`,

  // Ecommerce Config (tenant)
  ECOMMERCE_CONFIG: (accountId: string) => `/api/accounts/${accountId}/ecommerce-config`,
  FRONTEND_EVENTS: (accountId: string) => `/api/accounts/${accountId}/frontend-events`,

  // Favoritos del cliente
  FAVORITES: (accountId: string, businessPartnerId: string) =>
    `/api/accounts/${accountId}/customers/${businessPartnerId}/favorites`,
  FAVORITE: (accountId: string, businessPartnerId: string, productId: string) =>
    `/api/accounts/${accountId}/customers/${businessPartnerId}/favorites/${productId}`,

  // Carrito del cliente (snapshot persistente por business partner)
  CART: (accountId: string, businessPartnerId: string) =>
    `/api/accounts/${accountId}/customers/${businessPartnerId}/cart`,

  // Direcciones
  ADDRESSES: (accountId: string) => `/api/accounts/${accountId}/addresses`,
  ADDRESS: (accountId: string, addressId: string) => `/api/accounts/${accountId}/addresses/${addressId}`,

  // Business Partners (solo lectura/actualización del propio partner del cliente)
  BUSINESS_PARTNER: (accountId: string, businessPartnerId: string) =>
    `/api/accounts/${accountId}/business-partners/${businessPartnerId}`,

  // Capacitaciones del proveedor (tareas asignadas)
  TASKS_MINE: (accountId: string) => `/api/accounts/${accountId}/tasks/mine`,
  TASK: (accountId: string, taskId: string) => `/api/accounts/${accountId}/tasks/${taskId}`,

  // Capacitaciones (gestión plataforma — API nueva)
  CAPACITACIONES: (accountId: string) => `/api/accounts/${accountId}/capacitaciones`,
  CAPACITACION: (accountId: string, id: string) => `/api/accounts/${accountId}/capacitaciones/${id}`,
  CAPACITACION_PROVIDERS: (accountId: string) =>
    `/api/accounts/${accountId}/capacitaciones/providers`,

  // Chat intermediado (APIs nuevas)
  CONVERSATIONS: (accountId: string) => `/api/accounts/${accountId}/conversations`,
  CONVERSATION: (accountId: string, conversationId: string) =>
    `/api/accounts/${accountId}/conversations/${conversationId}`,
  CONVERSATION_FROM_ORDER: (accountId: string, orderId: string) =>
    `/api/accounts/${accountId}/conversations/from-order/${orderId}`,
  CONVERSATION_MESSAGES: (accountId: string, conversationId: string) =>
    `/api/accounts/${accountId}/conversations/${conversationId}/messages`,
  CONVERSATION_CLOSE: (accountId: string, conversationId: string) =>
    `/api/accounts/${accountId}/conversations/${conversationId}/close`,
  CONVERSATION_MODERATE: (accountId: string, conversationId: string) =>
    `/api/accounts/${accountId}/conversations/${conversationId}/moderate`,
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
