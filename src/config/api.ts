/**
 * Configuración de API para DIAP Store
 * Integración con Simple Gestión API v1.1.1
 */

import { getAPIHeaders } from './branding';

// Base URL desde variable de entorno
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.cumar.com.ar';

// Account ID para multi-tenant (DIAP Store)
export const ACCOUNT_ID = import.meta.env.VITE_ACCOUNT_ID || 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c';

// Configuración de headers por defecto
export const DEFAULT_HEADERS = getAPIHeaders();

// Endpoints de la API Simple Gestión v1.1.1
export const API_ENDPOINTS = {
  // Health Check
  HEALTH: '/health',
  
  // Autenticación
  AUTH: {
    TOKEN: '/api/auth/token',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
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
  
  // Personas
  PEOPLE: '/api/people',
  PERSON: (personId: string) => `/api/people/${personId}`,
  PERSON_DOCUMENTS: (personId: string) => `/api/people/${personId}/documents`,
  
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
  CANCEL_ORDER: (accountId: string, orderId: string) =>
    `/api/accounts/${accountId}/sales-orders/${orderId}/cancel`,
  CONFIRM_ORDER: (accountId: string, orderId: string) => 
    `/api/accounts/${accountId}/sales-orders/${orderId}/confirm`,
  COMPLETE_ORDER: (accountId: string, orderId: string) => 
    `/api/accounts/${accountId}/sales-orders/${orderId}/complete`,
  ORDER_INVOICE: (accountId: string, orderId: string) => 
    `/api/accounts/${accountId}/sales-orders/${orderId}/invoice`,
  
  // Entregas
  DELIVERIES: (accountId: string) => `/api/accounts/${accountId}/deliveries`,
  DELIVERY: (accountId: string, deliveryId: string) => 
    `/api/accounts/${accountId}/deliveries/${deliveryId}`,
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
  ADDRESSES: '/api/addresses',
  ADDRESS: (addressId: string) => `/api/addresses/${addressId}`,
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

// Logging
export const enableApiLogging = IS_DEVELOPMENT;
