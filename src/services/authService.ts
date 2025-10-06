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
   * Iniciar sesión - Modo demo
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    console.log('🔐 Intentando login con:', credentials.email);
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Credenciales válidas para demo
    const validCredentials = [
      { email: 'demo@iamerican.com', password: 'demo123' },
      { email: 'admin@iamerican.com', password: 'admin123' },
      { email: 'test@test.com', password: '123456' },
      { email: 'user@test.com', password: 'password' },
    ];
    
    const isValid = validCredentials.some(
      cred => cred.email === credentials.email && cred.password === credentials.password
    );
    
    if (!isValid) {
      throw new Error('Credenciales inválidas. Prueba: demo@iamerican.com / demo123');
    }
    
    // Usuario simulado
    const user: User = {
      id: 'demo-user-' + Date.now(),
      username: credentials.email,
      email: credentials.email,
      person_id: 'demo-person-' + Date.now(),
      role: credentials.email.includes('admin') ? 'admin' : 'user',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      person: {
        id: 'demo-person-' + Date.now(),
        first_name: credentials.email.includes('admin') ? 'Admin' : 'Usuario',
        last_name: 'Demo',
        email: credentials.email,
        phone: '+54 11 1234-5678',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    };
    
    const token = 'demo-token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    console.log('✅ Login simulado exitoso para:', credentials.email);
    return { user, token };
  }

  /**
   * Registrar usuario - Modo demo
   */
  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    console.log('📝 Registrando usuario:', data.email);
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Usuario simulado registrado
    const user: User = {
      id: 'new-user-' + Date.now(),
      username: data.email,
      email: data.email,
      person_id: 'new-person-' + Date.now(),
      role: 'user',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      person: {
        id: 'new-person-' + Date.now(),
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    };
    
    const token = 'new-token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    console.log('✅ Registro simulado exitoso para:', data.email);
    return { user, token };
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    console.log('✅ Logout exitoso');
  }
}

export const authService = new AuthService();
