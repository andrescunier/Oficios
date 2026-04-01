/**
 * Cliente HTTP configurado para la API de SIGP
 */

import axios, { AxiosHeaders, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_TIMEOUT, getActiveAccountId, getActiveAccountSlug } from '@/config/api';
import { getApiConfig } from '@/config/runtime';
import type { ApiError } from '@/types/api';
import log from '@/lib/logger';
import { clearAuthSession, getPersistedAuthToken } from '@/features/auth/session';

class HttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getApiConfig().extraHeaders,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const headers = new AxiosHeaders({
          ...getApiConfig().extraHeaders,
          ...config.headers,
        });

        // Agregar Account ID a los headers si existe
        const accountId = getActiveAccountId();
        const accountSlug = getActiveAccountSlug();

        if (accountId) {
          headers.set('X-Account-ID', accountId);
          headers.delete('X-Account-Slug');
        } else if (accountSlug) {
          headers.set('X-Account-Slug', accountSlug);
          headers.delete('X-Account-ID');
        }

        // Agregar token de autenticación automáticamente si está disponible
        const authToken = this.getStoredToken();
        if (authToken && !headers.get('Authorization')) {
          headers.set('Authorization', `Bearer ${authToken}`);
        }

        config.headers = headers;

        log.http.debug('Request →', config.method?.toUpperCase(), config.url);
        log.http.debug('Request meta:', {
          headers: headers.toJSON(),
          hasBody: Boolean(config.data),
          hasParams: Boolean(config.params),
        });

        return config;
      },
      (error) => {
        log.http.error('Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        log.http.debug('Response ←', response.status, response.config.url);
        log.http.debug('Response meta:', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        log.http.error('Response Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.response?.data?.message || error.message
        });

        // Si es error 401, limpiar token y redirigir a login
        // PERO no hacerlo durante el proceso de login/getMe para evitar limpiar la sesión recién creada
        if (error.response?.status === 401) {
          const url = error.config?.url || '';
          const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/me') || url.includes('/auth/token');
          if (!isAuthEndpoint) {
            this.handleUnauthorized();
          }
        }

        // Transformar errores de la API
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'Error desconocido',
          code: error.response?.data?.code || error.code,
          status: error.response?.status,
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
    return getPersistedAuthToken();
  }

  // Método para manejar errores de autorización (401)
  private handleUnauthorized(): void {
    try {
      clearAuthSession({
        redirect: '/login?session=expired',
        removeAuthToken: () => this.removeAuthToken(),
        preserveCart: true,
      });
    } catch (error) {
      log.http.error('Error al manejar token expirado:', error);
    }
  }

  // Método para verificar headers actuales
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(getActiveAccountId() && { 'X-Account-ID': getActiveAccountId() }),
      ...this.client.defaults.headers.common
    };
  }

  // Método para obtener headers de configuración
  getConfigInfo() {
    return {
      baseURL: this.client.defaults.baseURL,
      timeout: this.client.defaults.timeout,
      headers: this.getHeaders(),
      accountId: getActiveAccountId(),
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
