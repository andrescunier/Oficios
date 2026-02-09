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

// Interface para respuesta de /auth/me (actualizada según API v1.1.1)
export interface MeResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
    };
    person?: {
      id: string;
      first_name: string;
      last_name: string;
      phone?: string;
      email?: string;
      document_type?: string;
      document_number?: string;
    };
    billing?: {
      business_partner_id: string;  // ← Este es el customer_id para órdenes
      company_name?: string;
      tax_id?: string;
      tax_condition?: string;
      address?: {
        line1?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country_code?: string;
      };
    };
    shipping?: {
      address?: string;
      city?: string;
      state?: string;
      zip_code?: string;
      country?: string;
    };
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
        currency: data.currency || 'ARS',
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
        API_ENDPOINTS.SIMPLE.REGISTER_CUSTOMER,
        payload
      );

      if (!response?.success) {
        throw new Error(response?.message || 'Error en el registro');
      }

      // Guardar datos del registro para usar en checkout
      const registrationData = {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        company_name: data.companyName
      };
      localStorage.setItem('registration_data', JSON.stringify(registrationData));

      // Guardar el partner_id (business_partner_id) del registro
      // Este es el customer_id que necesitamos para crear órdenes
      if (response.data?.partner_id) {
        localStorage.setItem('business_partner_id', response.data.partner_id);
        console.log('✅ Business Partner ID guardado del registro:', response.data.partner_id);
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
      localStorage.removeItem('business_partner_id');
    }
  }

  /**
   * Obtener perfil del usuario autenticado con business_partner_id
   * GET /auth/me
   */
  async getMe(): Promise<MeResponse | null> {
    try {
      const response = await httpClient.get<MeResponse>(API_ENDPOINTS.AUTH.ME, {
        headers: {
          'X-Account-ID': ACCOUNT_ID,
        }
      });

      if (response.success && response.data) {
        // Intentar obtener business_partner_id de distintas ubicaciones posibles en la respuesta
        const bpId = response.data.billing?.business_partner_id 
          || (response.data as any).business_partner_id
          || (response.data as any).partner_id;
        if (bpId) {
          localStorage.setItem('business_partner_id', bpId);
          console.log('✅ Business Partner ID guardado desde /auth/me:', bpId);
        } else {
          console.warn('⚠️ /auth/me no devolvió business_partner_id. Se usará user.id como fallback para customer_id.');
        }
        return response;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return null;
    }
  }

  /**
   * Verificar si el token es válido usando /auth/me
   */
  async verifyToken(token: string): Promise<User | null> {
    try {
      // Ahora usamos /auth/me para verificar el token
      const meResponse = await this.getMe();
      if (meResponse?.success && meResponse.data?.user) {
        const now = new Date().toISOString();
        return {
          id: meResponse.data.user.id,
          person_id: meResponse.data.person?.id || '',
          email: meResponse.data.user.email,
          username: meResponse.data.user.username,
          role: meResponse.data.user.role as User['role'],
          status: 'active',
          created_at: now,
          updated_at: now,
          person: meResponse.data.person ? {
            id: meResponse.data.person.id,
            first_name: meResponse.data.person.first_name,
            last_name: meResponse.data.person.last_name,
            email: meResponse.data.person.email || meResponse.data.user.email,
            phone: meResponse.data.person.phone,
            created_at: now,
            updated_at: now,
          } : undefined,
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // NOTA: No existe endpoint /api/auth/refresh en la API (ver documentacion.md)
  // Los tokens expiran por TTL y el usuario debe volver a loguearse

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
