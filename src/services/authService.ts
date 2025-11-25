/**
 * Servicio de autenticación para DIAP - Integración con API real
 */

import type { User, Account } from '@/types/api';
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
  title?: string;
  industry?: string;
  currency?: string;
  username?: string;
  role?: 'customer' | 'supplier';
  personMetadata?: Record<string, any>;
  companyMetadata?: Record<string, any>;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data: {
    access_token: string;
    token_type?: string;
    user: User;
    account?: Account;
  };
  timestamp?: string;
}

export interface SimpleRegistrationResponse {
  success: boolean;
  message?: string;
  data?: {
    person_id: string;
    partner_id: string;
    user_id: string;
    link_id: string;
    email: string;
    username: string;
    company_name: string;
    role: string;
    account_id: string;
  };
}

export class AuthService {
  /**
   * Iniciar sesión con API real
   */
  async login(
    credentials: LoginCredentials
  ): Promise<{ user: User; token: string; account: Account | null }> {
    try {
      const response = await httpClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email,
        password: credentials.password,
        account_id: ACCOUNT_ID
      });

      const { token, user, account } = this.normalizeLoginResponse(response, credentials);

      // Configurar token en el cliente HTTP automáticamente
      httpClient.setAuthToken(token);

      // Guardar información adicional si es necesaria
      if (account) {
        localStorage.setItem('account_info', JSON.stringify(account));
      }

      return {
        user,
        token,
        account
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
  async register(
    data: RegisterData
  ): Promise<{ user: User; token: string; account: Account | null }> {
    try {
      const payload = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        title: data.title,
        company_name: data.companyName || `${data.firstName} ${data.lastName}`,
        tax_id: data.taxId,
        industry: data.industry,
        currency: data.currency || 'USD',
        username: data.username || data.email.split('@')[0],
        role: data.role || 'customer',
        person_metadata: {
          phone: data.phone,
          title: data.title,
          ...(data.personMetadata || {})
        },
        company_metadata: {
          tax_id: data.taxId,
          industry: data.industry,
          ...(data.companyMetadata || {})
        }
      };

      const response = await httpClient.post<SimpleRegistrationResponse>(
        API_ENDPOINTS.REGISTRATION.REGISTER_CUSTOMER,
        payload
      );

      if (!response?.success) {
        throw new Error(response?.message || 'Error en el registro');
      }

      // Luego de un registro exitoso, iniciamos sesión automáticamente
      return await this.login({
        email: data.email,
        password: data.password
      });

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
  async logout(userId?: string): Promise<void> {
    try {
      // Llamar al endpoint de logout si existe
      await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT, {
        user_id: userId,
        account_id: ACCOUNT_ID
      });
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

  private normalizeLoginResponse(
    response: any,
    credentials: LoginCredentials
  ): { user: User; token: string; account: Account | null } {
    const envelope = response?.success !== undefined
      ? response
      : { success: true, data: response };

    if (!envelope.success) {
      throw new Error(envelope.message || 'Error de autenticación');
    }

    const payload = envelope.data || {};
    const token = payload.access_token || payload.token;

    if (!token) {
      throw new Error('La API no devolvió un token válido');
    }

    const account = payload.account || null;
    const user = this.buildUser(payload.user, credentials);

    return { user, token, account };
  }

  private buildUser(apiUser: any, credentials: LoginCredentials): User {
    const now = new Date().toISOString();

    const baseUser: User = {
      id: apiUser?.id || apiUser?.user_id || credentials.email,
      person_id: apiUser?.person_id || '',
      email: apiUser?.email || credentials.email,
      username: apiUser?.username || credentials.email?.split('@')[0] || credentials.email,
      role: (apiUser?.role as User['role']) || 'customer',
      status: (apiUser?.status as User['status']) || 'active',
      created_at: apiUser?.created_at || now,
      updated_at: apiUser?.updated_at || apiUser?.last_login_at || now,
      person: apiUser?.person,
    };

    return baseUser;
  }
}

export const authService = new AuthService();
