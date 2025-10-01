/**
 * Script de prueba para verificar el Account ID
 */

import { httpClient } from './httpClient';
import { ACCOUNT_ID, API_ENDPOINTS } from '@/config/api';

export const testAccountId = async () => {
  console.log('🧪 Testing Account ID...');
  console.log('📋 Account ID from config:', ACCOUNT_ID);
  
  try {
    // Depurar configuración
    httpClient.debugConfig();
    
    // Intentar hacer una petición de productos
    const url = API_ENDPOINTS.PRODUCTS(ACCOUNT_ID);
    console.log('🎯 URL to call:', url);
    
    const response = await httpClient.get(url);
    console.log('✅ Response received:', response);
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  }
};

// Exportar para usar en la consola
if (typeof window !== 'undefined') {
  (window as any).testAccountId = testAccountId;
  (window as any).httpClient = httpClient;
}