import { httpClient } from './httpClient';
import { API_ENDPOINTS, getActiveAccountId } from '@/config/api';
import type { BusinessPartner } from '@/types/api';

const SUPPLIER_PARTNER_TYPES = new Set(['supplier', 'both']);

interface BusinessPartnerEnvelope {
  success?: boolean;
  data?: BusinessPartner;
}

const extractBusinessPartner = (response: unknown): BusinessPartner | null => {
  if (response && typeof response === 'object') {
    if ('partner_type' in response) {
      return response as BusinessPartner;
    }
    const envelope = response as BusinessPartnerEnvelope;
    if (envelope.data && typeof envelope.data === 'object') {
      return envelope.data;
    }
  }
  return null;
};

export const isSupplierPartnerType = (partnerType: string | undefined | null): boolean => {
  return Boolean(partnerType && SUPPLIER_PARTNER_TYPES.has(partnerType));
};

export async function getBusinessPartner(businessPartnerId: string): Promise<BusinessPartner | null> {
  const accountId = getActiveAccountId();
  if (!accountId || !businessPartnerId) {
    return null;
  }

  const response = await httpClient.get<unknown>(
    API_ENDPOINTS.BUSINESS_PARTNER(accountId, businessPartnerId),
  );
  return extractBusinessPartner(response);
}

export async function isSupplierPartner(businessPartnerId: string): Promise<boolean> {
  try {
    const partner = await getBusinessPartner(businessPartnerId);
    return isSupplierPartnerType(partner?.partner_type);
  } catch {
    return false;
  }
}

/** True si el usuario autenticado es proveedor (rol o partner_type). */
export function isSupplierUserRole(role: string | undefined | null): boolean {
  return (role || '').toLowerCase() === 'supplier';
}
