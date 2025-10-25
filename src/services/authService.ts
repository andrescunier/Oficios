/**
 * Servicio de autenticación para iAmerican - Versión simplificada
 */

import type { User } from '@/types/api';

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
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // En producción, esto debería conectar con la API real
    // Por ahora, rechazar todas las credenciales para forzar integración con API
    throw new Error('Servicio de autenticación no disponible. Contacte al administrador.');
    
    // Usuario del sistema
    const user: User = {
      id: 'user-' + Date.now(),
      username: credentials.email,
      email: credentials.email,
      person_id: 'person-' + Date.now(),
      role: credentials.email.includes('admin') ? 'admin' : 'user',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      person: {
        id: 'person-' + Date.now(),
        first_name: credentials.email.includes('admin') ? 'Administrador' : 'Usuario',
        last_name: 'Sistema',
        email: credentials.email,
        phone: '+54 11 0000-0000',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    };
    
    const token = 'token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    return { user, token };
  }

  /**
   * Registrar usuario
   */
  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // En producción, esto debería conectar con la API real
    throw new Error('Servicio de registro no disponible. Contacte al administrador.');
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    // Logout silencioso
  }
}

export const authService = new AuthService();
