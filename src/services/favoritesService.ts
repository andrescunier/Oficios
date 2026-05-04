/**
 * Servicio de favoritos del cliente
 * Contrato: docs/BACKEND_CONTRACT.md › sección "Favoritos"
 *
 * Endpoints:
 *   GET    /api/accounts/{account_id}/customers/{business_partner_id}/favorites
 *   POST   /api/accounts/{account_id}/customers/{business_partner_id}/favorites
 *   DELETE /api/accounts/{account_id}/customers/{business_partner_id}/favorites/{product_id}
 *
 * Auth: Bearer token. Backend valida que `business_partner_id` corresponde al user del token.
 * Storage: tabla dedicada `customer_favorites(account_id, business_partner_id, product_id, created_at)`.
 */

import { httpClient } from './httpClient';
import { API_ENDPOINTS, getActiveAccountId } from '@/config/api';
import log from '@/lib/logger';

export interface FavoriteEntry {
  product_id: string;
  created_at?: string;
}

interface ListResponse {
  success?: boolean;
  data?: FavoriteEntry[] | { items?: FavoriteEntry[] };
}

const normalize = (resp: ListResponse | null | undefined): string[] => {
  const data = resp?.data;
  if (!data) return [];
  const items = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];
  return items
    .map((entry) => (typeof entry?.product_id === 'string' ? entry.product_id : null))
    .filter((id): id is string => !!id);
};

export class FavoritesService {
  /**
   * Listar favoritos del cliente autenticado.
   * Devuelve [] si no hay business_partner_id (ej. usuario aún no tiene customer).
   */
  async list(businessPartnerId: string): Promise<string[]> {
    const accountId = getActiveAccountId();
    if (!accountId || !businessPartnerId) return [];
    try {
      const resp = await httpClient.get<ListResponse>(
        API_ENDPOINTS.FAVORITES(accountId, businessPartnerId),
      );
      return normalize(resp);
    } catch (error: any) {
      log.store.error('favoritesService.list error:', error?.message || error);
      return [];
    }
  }

  /**
   * Agregar un producto a favoritos. Idempotente (backend hace upsert).
   */
  async add(businessPartnerId: string, productId: string): Promise<boolean> {
    const accountId = getActiveAccountId();
    if (!accountId || !businessPartnerId || !productId) return false;
    try {
      await httpClient.post(
        API_ENDPOINTS.FAVORITES(accountId, businessPartnerId),
        { product_id: productId },
      );
      return true;
    } catch (error: any) {
      log.store.error('favoritesService.add error:', error?.message || error);
      return false;
    }
  }

  /**
   * Quitar un producto de favoritos. Idempotente.
   */
  async remove(businessPartnerId: string, productId: string): Promise<boolean> {
    const accountId = getActiveAccountId();
    if (!accountId || !businessPartnerId || !productId) return false;
    try {
      await httpClient.delete(
        API_ENDPOINTS.FAVORITE(accountId, businessPartnerId, productId),
      );
      return true;
    } catch (error: any) {
      log.store.error('favoritesService.remove error:', error?.message || error);
      return false;
    }
  }
}

export const favoritesService = new FavoritesService();
