/**
 * Servicio de autenticación para iAmerican
 */

import { httpClient } from './httpClient';
import { API_ENDPOINTS, ACCOUNT_ID } from '@/config/api';
import type { 
  User, 
  AuthTokenResponse, 
  CreateUserRequest,
  CreatePersonRequest,
  CreateBusinessPartnerRequest,
  ApiResponse 
} from '@/types/api';

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
}

export class AuthService {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      // Obtener token de autenticación
      const tokenResponse = await httpClient.post<AuthTokenResponse>(
        API_ENDPOINTS.AUTH.TOKEN,
        {
          grant_type: 'password',
          username: credentials.email,
          password: credentials.password,
        }
      );

      // Configurar token en el cliente HTTP
      httpClient.setAuthToken(tokenResponse.access_token);
      httpClient.setAccountId(ACCOUNT_ID);

      // Obtener información del usuario (simulado por ahora)
      const user: User = {
        id: 'user-' + Date.now(),
        person_id: 'person-' + Date.now(),
        email: credentials.email,
        username: credentials.email,
        role: 'user',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        person: {
          id: 'person-' + Date.now(),
          first_name: 'Usuario',
          last_name: 'Demo',
          email: credentials.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      };

      return {
        user,
        token: tokenResponse.access_token
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Credenciales inválidas');
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    try {
      // 1. Crear persona
      const personData: CreatePersonRequest = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
      };

      const personResponse = await httpClient.post<ApiResponse<any>>(
        API_ENDPOINTS.PEOPLE(ACCOUNT_ID),
        personData
      );

      // 2. Crear usuario
      const userData: CreateUserRequest = {
        person_id: personResponse.data.id,
        email: data.email,
        username: data.email,
        password_hash: data.password, // En producción esto debería ser hasheado
        role: 'user',
        status: 'active',
      };

      const userResponse = await httpClient.post<ApiResponse<User>>(
        API_ENDPOINTS.USERS(ACCOUNT_ID),
        userData
      );

      // 3. Crear business partner (cliente)
      const businessPartnerData: CreateBusinessPartnerRequest = {
        name: `${data.firstName} ${data.lastName}`,
        partner_type: 'customer',
        person_id: personResponse.data.id,
        default_currency: 'ARS',
      };

      await httpClient.post<ApiResponse<any>>(
        API_ENDPOINTS.BUSINESS_PARTNERS(ACCOUNT_ID),
        businessPartnerData
      );

      // 4. Hacer login automático
      return await this.login({
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      console.error('Register error:', error);
      throw new Error('Error al registrar usuario');
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      // Limpiar tokens del cliente HTTP
      httpClient.removeAuthToken();
      httpClient.removeAccountId();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // En una implementación real, esto haría una llamada a la API
      // Por ahora retornamos null ya que no tenemos endpoint específico
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Verificar si el token es válido
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      httpClient.setAuthToken(token);
      httpClient.setAccountId(ACCOUNT_ID);
      
      // Intentar hacer una llamada autenticada
      await httpClient.get('/health');
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      // En una implementación real, esto haría una llamada a la API
      // Por ahora solo simulamos la operación
      console.log('Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      throw new Error('Error al cambiar contraseña');
    }
  }

  /**
   * Recuperar contraseña
   */
  async resetPassword(email: string): Promise<void> {
    try {
      // En una implementación real, esto enviaría un email de recuperación
      console.log('Password reset email sent to:', email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error('Error al enviar email de recuperación');
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(userId: string, data: Partial<CreatePersonRequest>): Promise<User> {
    try {
      // En una implementación real, esto actualizaría el perfil
      const updatedUser: User = {
        id: userId,
        person_id: 'person-' + userId,
        email: data.email || '',
        username: data.email || '',
        role: 'user',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        person: {
          id: 'person-' + userId,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      };

      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Error al actualizar perfil');
    }
  }
}

// Instancia singleton del servicio
export const authService = new AuthService();
