/**
 * Configuración de API
 * Integración con Simple Gestión API v1.1.1
 * Usa configuración runtime cuando está disponible
 */

import { getAPIHeaders } from './branding';
import { getApiConfig } from './runtime';

// Obtener configuración de API desde runtime config
const apiConfig = getApiConfig();

// Base URL desde runtime config con fallback a variable de entorno
export const API_BASE_URL = apiConfig.url;

// Account ID para multi-tenant
export const ACCOUNT_ID = apiConfig.accountId;

// Account Slug
export const ACCOUNT_SLUG = apiConfig.accountSlug;
export const CHANNEL = apiConfig.channel;

const readJsonStorage = (key: string) => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getActiveAccountId = (): string => {
  if (typeof window === 'undefined') {
    return ACCOUNT_ID;
  }

  const persistedStore = readJsonStorage('diapstore-store');
  const persistedAccountId = persistedStore?.state?.auth?.account?.id;
  const storedAccountId = window.localStorage.getItem('active_account_id');
  const accountInfo = readJsonStorage('account_info');

  return storedAccountId || persistedAccountId || accountInfo?.id || ACCOUNT_ID;
};

export const getActiveAccountSlug = (): string => {
  if (typeof window === 'undefined') {
    return ACCOUNT_SLUG;
  }

  const persistedStore = readJsonStorage('diapstore-store');
  const persistedAccountSlug = persistedStore?.state?.auth?.account?.slug;
  const accountInfo = readJsonStorage('account_info');

  return accountInfo?.slug || persistedAccountSlug || ACCOUNT_SLUG;
};

export const getActiveChannel = (): string => {
  if (typeof window === 'undefined') {
    return CHANNEL || 'ecommerce';
  }

  return window.localStorage.getItem('active_channel') || CHANNEL || 'ecommerce';
};

// Configuración de headers por defecto
export const DEFAULT_HEADERS = getAPIHeaders();

export const getDefaultHeaders = () => ({
  ...getAPIHeaders(),
  'X-Account-ID': getActiveAccountId(),
});

// Endpoints de la API Simple Gestión v1.1.1
export const API_ENDPOINTS = {
  // Health Check
  HEALTH: '/health',
  
  // Autenticación
  AUTH: {
    TOKEN: '/api/auth/token',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',  // Obtener perfil con business_partner_id
  },

  // Registro de clientes (endpoints públicos) - Simple Registration
  SIMPLE: {
    REGISTER_CUSTOMER: '/api/simple/register-customer',
    QUICK_REGISTER: '/api/simple/quick-register',
    CHECK_EMAIL: (email: string) => `/api/simple/check-email/${encodeURIComponent(email)}`,
    REGISTRATION_STATS: '/api/simple/registration-stats',
  },
  
  // Cuentas
  ACCOUNTS: '/api/accounts',
  
  // Personas (requieren account_id según API v1.2.1)
  PEOPLE: (accountId: string) => `/api/accounts/${accountId}/people`,
  PERSON: (accountId: string, personId: string) => `/api/accounts/${accountId}/people/${personId}`,
  PERSON_DOCUMENTS: (accountId: string, personId: string) => `/api/accounts/${accountId}/people/${personId}/documents`,
  
  // Usuarios (dentro de una cuenta)
  USERS: (accountId: string) => `/api/accounts/${accountId}/users`,
  USER: (accountId: string, userId: string) => `/api/accounts/${accountId}/users/${userId}`,
  
  // Business Partners (Clientes/Proveedores)
  BUSINESS_PARTNERS: (accountId: string) => `/api/accounts/${accountId}/business-partners`,
  BUSINESS_PARTNER: (accountId: string, partnerId: string) => 
    `/api/accounts/${accountId}/business-partners/${partnerId}`,
  
  // Productos (GET público sin auth = sin precios, con auth = con precios)
  PRODUCTS: (accountId: string) => `/api/accounts/${accountId}/products`,
  PRODUCT: (accountId: string, productId: string) => 
    `/api/accounts/${accountId}/products/${productId}`,
  PRODUCT_VARIANT_OPTIONS: (accountId: string, productId: string) =>
    `/api/accounts/${accountId}/products/${productId}/variant-options`,
  PRODUCT_VARIANTS: (accountId: string, productId: string) =>
    `/api/accounts/${accountId}/products/${productId}/variants`,
  PRODUCT_VARIANT: (accountId: string, productId: string, variantId: string) =>
    `/api/accounts/${accountId}/products/${productId}/variants/${variantId}`,
  PRODUCTS_LOW_STOCK: (accountId: string) => `/api/accounts/${accountId}/products/low-stock`,
  PRODUCT_STOCK: (accountId: string, productId: string) => 
    `/api/accounts/${accountId}/products/${productId}/stock`,
  
  // Órdenes de Venta
  SALES_ORDERS: (accountId: string) => `/api/accounts/${accountId}/sales-orders`,
  SALES_ORDER: (accountId: string, orderId: string) => 
    `/api/accounts/${accountId}/sales-orders/${orderId}`,
  SALES_ORDER_ITEMS: (accountId: string, orderId: string) => 
    `/api/accounts/${accountId}/sales-orders/${orderId}/items`,
  VALIDATE_STOCK: (accountId: string) => 
    `/api/accounts/${accountId}/sales-orders/validate-stock`,
  ORDER_INVOICE: (accountId: string, orderId: string) => 
    `/api/accounts/${accountId}/sales-orders/${orderId}/invoice`,
  GENERATE_INVOICE: (accountId: string, orderId: string) => 
    `/api/accounts/${accountId}/sales-orders/${orderId}/generate-invoice`,
  
  // State Machine endpoints (Order State Machine v2)
  SUBMIT_ORDER: (accountId: string, orderId: string) => 
    `/api/accounts/${accountId}/sales-orders/${orderId}/submit`,
  CONFIRM_PAYMENT: (accountId: string, orderId: string) => 
    `/api/accounts/${accountId}/sales-orders/${orderId}/confirm-payment`,
  SHIP_ORDER: (accountId: string, orderId: string) => 
    `/api/accounts/${accountId}/sales-orders/${orderId}/ship`,
  DELIVER_ORDER: (accountId: string, orderId: string) => 
    `/api/accounts/${accountId}/sales-orders/${orderId}/deliver`,
  COMPLETE_ORDER: (accountId: string, orderId: string) => 
    `/api/accounts/${accountId}/sales-orders/${orderId}/complete`,
  CANCEL_ORDER: (accountId: string, orderId: string) => 
    `/api/accounts/${accountId}/sales-orders/${orderId}/cancel-v2`,
  RETURN_ORDER: (accountId: string, orderId: string) => 
    `/api/accounts/${accountId}/sales-orders/${orderId}/return`,
  TRANSITION_ORDER: (accountId: string, orderId: string) => 
    `/api/accounts/${accountId}/sales-orders/${orderId}/transition`,
  STATUS_HISTORY: (accountId: string, orderId: string) => 
    `/api/accounts/${accountId}/sales-orders/${orderId}/status-history`,
  VALID_TRANSITIONS: (accountId: string, orderId: string) => 
    `/api/accounts/${accountId}/sales-orders/${orderId}/valid-transitions`,
  // Legacy confirm (deprecated - use CONFIRM_PAYMENT)
  CONFIRM_ORDER: (accountId: string, orderId: string) => 
    `/api/accounts/${accountId}/sales-orders/${orderId}/confirm-payment`,
  
  // Entregas
  DELIVERIES: (accountId: string) => `/api/accounts/${accountId}/deliveries`,
  DELIVERY: (accountId: string, deliveryId: string) => 
    `/api/accounts/${accountId}/deliveries/${deliveryId}`,
  SHIP_DELIVERY: (accountId: string, deliveryId: string) => 
    `/api/accounts/${accountId}/deliveries/${deliveryId}/ship`,
  DELIVER_DELIVERY: (accountId: string, deliveryId: string) => 
    `/api/accounts/${accountId}/deliveries/${deliveryId}/deliver`,
  COMPLETE_DELIVERY: (accountId: string, deliveryId: string) => 
    `/api/accounts/${accountId}/deliveries/${deliveryId}/complete`,
  CANCEL_DELIVERY: (accountId: string, deliveryId: string) => 
    `/api/accounts/${accountId}/deliveries/${deliveryId}/cancel`,
  
  // Facturas
  INVOICES: (accountId: string) => `/api/accounts/${accountId}/invoices`,
  INVOICE: (accountId: string, invoiceId: string) => 
    `/api/accounts/${accountId}/invoices/${invoiceId}`,
  INVOICE_ITEMS: (accountId: string, invoiceId: string) => 
    `/api/accounts/${accountId}/invoices/${invoiceId}/items`,
  SEND_INVOICE: (accountId: string, invoiceId: string) => 
    `/api/accounts/${accountId}/invoices/${invoiceId}/send`,
  VOID_INVOICE: (accountId: string, invoiceId: string) => 
    `/api/accounts/${accountId}/invoices/${invoiceId}/void`,
  
  // Pagos
  PAYMENTS: (accountId: string) => `/api/accounts/${accountId}/payments`,
  PAYMENT: (accountId: string, paymentId: string) => 
    `/api/accounts/${accountId}/payments/${paymentId}`,
  PAYMENT_APPLICATIONS: (accountId: string, paymentId: string) => 
    `/api/accounts/${accountId}/payments/${paymentId}/applications`,
  
  // Direcciones
  ADDRESSES: (accountId: string) => `/api/accounts/${accountId}/addresses`,
  ADDRESS: (accountId: string, addressId: string) => `/api/accounts/${accountId}/addresses/${addressId}`,
  
  // Inventario
  INVENTORY_MOVEMENTS: (accountId: string) => `/api/accounts/${accountId}/inventory/movements`,
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
      cacheTime: 10 * 60 * 1000, // 10 minutos
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
