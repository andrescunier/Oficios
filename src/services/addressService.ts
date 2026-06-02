/**
 * Servicio de direcciones de envío del cliente (storefront).
 *
 * Contrato: docs/BACKEND_CONTRACT.md
 * Endpoints:
 *   POST   /api/accounts/{account_id}/addresses
 *   PATCH  /api/accounts/{account_id}/addresses/{address_id}
 *   PATCH  /api/accounts/{account_id}/business-partners/{business_partner_id}
 */

import { httpClient } from './httpClient';
import { API_ENDPOINTS, getActiveAccountId } from '@/config/api';
import { getBusinessPartnerId } from '@/features/auth/session';
import log from '@/lib/logger';

export interface AddressFormData {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country_code: string;
}

export interface AddressRead extends AddressFormData {
  id: string;
  addressable_type: string;
  addressable_id: string;
  is_primary: boolean;
  created_at: string;
}

interface AddressResponse {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country_code: string;
  addressable_type: string;
  addressable_id: string;
  is_primary: boolean;
  created_at: string;
}

/**
 * Crea una nueva dirección de envío para el business partner autenticado y la
 * vincula al business partner como `shipping_address_id`.
 *
 * Siempre crea una nueva dirección (el backend maneja `is_primary`).
 */
export async function saveShippingAddress(address: AddressFormData): Promise<AddressRead> {
  const accountId = getActiveAccountId();
  const businessPartnerId = getBusinessPartnerId();

  if (!businessPartnerId) {
    throw new Error('No se encontró el identificador de cliente (business_partner_id).');
  }

  log.auth.info('Guardando dirección de envío para business_partner_id:', businessPartnerId);

  // 1. Crear dirección vinculada al business partner
  const newAddress = await httpClient.post<AddressResponse>(
    API_ENDPOINTS.ADDRESSES(accountId),
    {
      addressable_type: 'business_partner',
      addressable_id: businessPartnerId,
      line1: address.line1.trim(),
      line2: address.line2?.trim() || null,
      city: address.city.trim(),
      state: address.state?.trim() || null,
      postal_code: address.postal_code?.trim() || null,
      country_code: address.country_code.trim(),
      is_primary: true,
    }
  );

  log.auth.info('Dirección creada con ID:', newAddress.id);

  // 2. Vincular como shipping_address_id en el business partner
  await httpClient.patch(
    API_ENDPOINTS.BUSINESS_PARTNER(accountId, businessPartnerId),
    { shipping_address_id: newAddress.id }
  );

  log.auth.info('shipping_address_id actualizado en business partner');

  return {
    id: newAddress.id,
    addressable_type: newAddress.addressable_type,
    addressable_id: newAddress.addressable_id,
    line1: newAddress.line1,
    line2: newAddress.line2,
    city: newAddress.city,
    state: newAddress.state,
    postal_code: newAddress.postal_code,
    country_code: newAddress.country_code,
    is_primary: newAddress.is_primary,
    created_at: newAddress.created_at,
  };
}
