/**
 * Cliente HTTP configurado para la API de SIGP
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_TIMEOUT, enableApiLogging, ACCOUNT_ID } from '@/config/api';
import type { ApiError } from '@/types/api';

class HttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Agregar Account ID a los headers si existe
        if (ACCOUNT_ID) {
          config.headers = config.headers || {};
          config.headers['X-Account-ID'] = ACCOUNT_ID;
        }

        // Agregar token de autenticación automáticamente si está disponible
        const authToken = this.getStoredToken();
        if (authToken && !config.headers?.['Authorization']) {
          config.headers = config.headers || {};
          config.headers['Authorization'] = `Bearer ${authToken}`;
        }

        if (enableApiLogging) {
          console.log('🚀 Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            headers: config.headers,
            data: config.data
          });
        }

        return config;
      },
      (error) => {
        if (enableApiLogging) {
          console.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (enableApiLogging) {
          console.log('✅ Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
          });
        }
        return response;
      },
      (error) => {
        if (enableApiLogging) {
          console.error('❌ Response Error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.response?.data?.message || error.message
          });
        }

        // Si es error 401, limpiar token y redirigir a login
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }

        // Transformar errores de la API
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'Error desconocido',
          code: error.response?.data?.code || error.code,
          details: error.response?.data?.details || {},
        };

        return Promise.reject(apiError);
      }
    );
  }

  // Métodos HTTP
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Método para actualizar headers (útil para autenticación)
  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Método para actualizar Account ID
  setAccountId(accountId: string) {
    this.client.defaults.headers.common['X-Account-ID'] = accountId;
  }

  removeAccountId() {
    delete this.client.defaults.headers.common['X-Account-ID'];
  }

  // Método para obtener la instancia de Axios (si es necesario)
  getInstance(): AxiosInstance {
    return this.client;
  }

  // Método para obtener el token almacenado del localStorage o store
  private getStoredToken(): string | null {
    try {
      // Intentar obtener del localStorage donde Zustand persiste el estado
      const persistedState = localStorage.getItem('iamerican-store');
      if (persistedState) {
        const state = JSON.parse(persistedState);
        return state?.state?.auth?.token || null;
      }
      return null;
    } catch (error) {
      console.warn('Error al obtener token del storage:', error);
      return null;
    }
  }

  // Método para manejar errores de autorización (401)
  private handleUnauthorized(): void {
    try {
      // Limpiar token del cliente HTTP
      this.removeAuthToken();
      
      // Limpiar localStorage completamente
      localStorage.removeItem('iamerican-store');
      
      // Limpiar sessionStorage también
      sessionStorage.clear();
      
      // Redirigir a login (solo si estamos en el navegador)
      if (typeof window !== 'undefined' && window.location) {
        // Verificar si ya estamos en login para evitar bucles
        if (!window.location.pathname.includes('/login')) {
          // Forzar recarga completa para limpiar el estado de React
          window.location.href = '/login?session=expired';
        }
      }
    } catch (error) {
      console.error('Error al manejar token expirado:', error);
    }
  }

  // Método para verificar headers actuales
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(ACCOUNT_ID && { 'X-Account-ID': ACCOUNT_ID }),
      ...this.client.defaults.headers.common
    };
  }

  // Método para obtener headers de configuración
  getConfigInfo() {
    return {
      baseURL: this.client.defaults.baseURL,
      timeout: this.client.defaults.timeout,
      headers: this.getHeaders(),
      accountId: ACCOUNT_ID,
    };
  }
}

// Instancia singleton del cliente HTTP
export const httpClient = new HttpClient();

// Exportar también la clase para casos especiales
export { HttpClient };

// Tipos de utilidad para requests
export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipAccountId?: boolean;
}

// Helper para crear requests con configuración personalizada
export const createRequest = (config: RequestConfig = {}) => {
  const { skipAuth, skipAccountId, ...axiosConfig } = config;
  
  if (skipAuth) {
    delete axiosConfig.headers?.['Authorization'];
  }
  
  if (skipAccountId) {
    delete axiosConfig.headers?.['X-Account-ID'];
  }
  
  return axiosConfig;
};
