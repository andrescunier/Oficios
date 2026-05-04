/**
 * Servicio de sincronización del carrito por cliente.
 * Contrato: docs/BACKEND_CONTRACT.md › sección "Carrito del cliente"
 *
 * Endpoints:
 *   GET    /api/accounts/{account_id}/customers/{business_partner_id}/cart
 *   PUT    /api/accounts/{account_id}/customers/{business_partner_id}/cart
 *   DELETE /api/accounts/{account_id}/customers/{business_partner_id}/cart
 *
 * El backend NO interpreta el JSON: lo guarda tal cual en `customer_carts.cart`.
 * Si el producto cambia / desaparece, el checkout valida stock y precio antes de cerrar.
 */

import { httpClient } from './httpClient';
import { API_ENDPOINTS, getActiveAccountId } from '@/config/api';
import log from '@/lib/logger';

export interface CartSnapshot {
  items: any[];
  currency: string;
}

interface FetchResponse {
  success?: boolean;
  data?: { cart?: CartSnapshot } | CartSnapshot | null;
}

const normalizeFetch = (resp: FetchResponse | null | undefined): CartSnapshot | null => {
  const data = resp?.data;
  if (!data) return null;
  // Backend puede devolver { data: { cart: {...} } } o { data: {...} } directo
  const snapshot = (data as any).cart ?? data;
  if (!snapshot || typeof snapshot !== 'object') return null;
  if (!Array.isArray(snapshot.items)) return null;
  return {
    items: snapshot.items,
    currency: typeof snapshot.currency === 'string' ? snapshot.currency : '',
  };
};

export class CartSyncService {
  /**
   * Obtener el snapshot guardado en el backend para el cliente.
   * Devuelve null si no hay snapshot, no hay sesión, o falla la red.
   */
  async fetch(businessPartnerId: string): Promise<CartSnapshot | null> {
    const accountId = getActiveAccountId();
    if (!accountId || !businessPartnerId) return null;
    try {
      const resp = await httpClient.get<FetchResponse>(
        API_ENDPOINTS.CART(accountId, businessPartnerId),
      );
      return normalizeFetch(resp);
    } catch (error: any) {
      log.store.error('cartSyncService.fetch error:', error?.message || error);
      return null;
    }
  }

  /**
   * Reemplazar el snapshot completo en el backend (UPSERT).
   * No lanza: el carrito local sigue siendo la fuente de verdad inmediata.
   */
  async save(businessPartnerId: string, snapshot: CartSnapshot): Promise<boolean> {
    const accountId = getActiveAccountId();
    if (!accountId || !businessPartnerId) return false;
    try {
      await httpClient.put(
        API_ENDPOINTS.CART(accountId, businessPartnerId),
        { cart: snapshot },
      );
      return true;
    } catch (error: any) {
      log.store.error('cartSyncService.save error:', error?.message || error);
      return false;
    }
  }

  /**
   * Limpiar el snapshot remoto. Idempotente.
   */
  async clear(businessPartnerId: string): Promise<boolean> {
    const accountId = getActiveAccountId();
    if (!accountId || !businessPartnerId) return false;
    try {
      await httpClient.delete(
        API_ENDPOINTS.CART(accountId, businessPartnerId),
      );
      return true;
    } catch (error: any) {
      log.store.error('cartSyncService.clear error:', error?.message || error);
      return false;
    }
  }
}

export const cartSyncService = new CartSyncService();
