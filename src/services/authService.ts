/**
 * Servicio de autenticación para DIAP - Integración con API real
 */

import type { User, AuthTokenResponse, BusinessPartner, Person } from '@/types/api';
import { httpClient } from './httpClient';
import { API_ENDPOINTS, ACCOUNT_ID } from '@/config/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  companyName?: string;
  taxId?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    user: User;
    account: any;
  };
  error_details?: any;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    user: User;
    businessPartner: BusinessPartner;
  };
  error_details?: any;
}

export class AuthService {
  /**
   * Iniciar sesión con API real
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await httpClient.post<LoginResponse>('/api/auth/login', {
        email: credentials.email,
        password: credentials.password,
        account_id: ACCOUNT_ID
      });

      // Verificar si la respuesta es exitosa
      if (!response.success) {
        throw new Error(response.message || 'Error de autenticación');
      }

      const { access_token, user, account } = response.data;

      // Configurar token en el cliente HTTP automáticamente
      httpClient.setAuthToken(access_token);

      // Guardar información adicional si es necesaria
      if (account) {
        localStorage.setItem('account_info', JSON.stringify(account));
      }

      return {
        user,
        token: access_token
      };

    } catch (error: any) {
      // Si es un error de la API con estructura conocida
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      // Si es un error de red o genérico
      if (error.message) {
        throw new Error(error.message);
      }

      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
  }

  /**
   * Registrar usuario con API real
   */
  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    try {
      const response = await httpClient.post<RegisterResponse>('/api/auth/register', {
        account_id: ACCOUNT_ID,
        person: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone || ''
        },
        user: {
          email: data.email,
          username: data.email,
          password: data.password,
          role: 'user'
        },
        business_partner: {
          name: data.companyName || `${data.firstName} ${data.lastName}`,
          partner_type: 'customer',
          tax_id: data.taxId || '',
          default_currency: 'ARS'
        }
      });

      // Verificar si la respuesta es exitosa
      if (!response.success) {
        throw new Error(response.message || 'Error en el registro');
      }

      const { access_token, user, businessPartner } = response.data;

      // Configurar token en el cliente HTTP automáticamente
      httpClient.setAuthToken(access_token);

      // Guardar información del business partner
      if (businessPartner) {
        localStorage.setItem('business_partner_info', JSON.stringify(businessPartner));
      }

      return {
        user,
        token: access_token
      };

    } catch (error: any) {
      // Si es un error de la API con estructura conocida
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      // Si es un error de red o genérico
      if (error.message) {
        throw new Error(error.message);
      }

      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      // Llamar al endpoint de logout si existe
      await httpClient.post('/api/auth/logout');
    } catch (error) {
      // No importa si el logout falla en el servidor
    } finally {
      // Remover token del cliente HTTP
      httpClient.removeAuthToken();
      
      // Limpiar storage local
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('account_info');
      localStorage.removeItem('business_partner_info');
    }
  }

  /**
   * Verificar si el token es válido
   */
  async verifyToken(token: string): Promise<User | null> {
    try {
      const response = await httpClient.get<{ user: User }>('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Refrescar token si es necesario
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; user: User } | null> {
    try {
      const response = await httpClient.post<LoginResponse>('/api/auth/refresh', {
        refresh_token: refreshToken
      });

      if (!response.success) {
        return null;
      }

      return {
        token: response.data.access_token,
        user: response.data.user
      };
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService();
