import { httpClient } from './httpClient';
import { API_ENDPOINTS, getActiveAccountId, getActiveChannel } from '@/config/api';
import { getBusinessConfig } from '@/config/runtime';
import type { Product } from '@/types/api';
import type { PricingMode, TradeRank } from '@/utils/serviceListing';

export interface ProviderProductInput {
  name: string;
  description?: string;
  unit_price: number;
  category?: string;
  /** Zona / barrio donde ofrece el servicio (filtro de catálogo) */
  zone?: string;
  /** Oficial / Medio oficial / Ayudante / Particular */
  tradeRank?: TradeRank;
  /** Precio fijo o a convenir */
  pricingMode?: PricingMode;
  /** Foto de la persona (URL absoluta o path /branding/...) */
  imageUrl?: string;
  personName?: string;
  sku?: string;
  status?: 'active' | 'inactive';
}

interface ProductsListEnvelope {
  data?: Product[];
}

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'servicio';

/** Prefijo único por servicio: evita que el agrupador DIAP (primer segmento SKU) junte personas. */
export const buildProviderSku = (name: string): string =>
  `OH${Date.now()}-${slugify(name)}`;

const extractProducts = (response: unknown): Product[] => {
  if (Array.isArray(response)) {
    return response;
  }
  if (response && typeof response === 'object') {
    const envelope = response as ProductsListEnvelope;
    if (Array.isArray(envelope.data)) {
      return envelope.data;
    }
  }
  return [];
};

const extractProduct = (response: unknown): Product => {
  if (response && typeof response === 'object') {
    if ('id' in response) {
      return response as Product;
    }
    const envelope = response as { data?: Product };
    if (envelope.data && typeof envelope.data === 'object') {
      return envelope.data;
    }
  }
  throw new Error('No se pudo procesar la respuesta del servicio');
};

const buildCreatePayload = (input: ProviderProductInput, businessPartnerId: string) => {
  const business = getBusinessConfig();
  const status = input.status || 'active';
  const channel = getActiveChannel();
  const pricingMode: PricingMode = input.pricingMode || 'fixed';
  const tradeRank: TradeRank = input.tradeRank || 'particular';
  const unitPrice = pricingMode === 'a_convenir'
    ? Math.max(0, Number(input.unit_price) || 0)
    : Number(input.unit_price) || 0;
  const imageUrl = input.imageUrl?.trim() || undefined;
  const personName = input.personName?.trim() || undefined;
  const zone = input.zone?.trim() || undefined;

  return {
    sku: input.sku || buildProviderSku(input.name),
    name: input.name.trim(),
    description: input.description?.trim() || '',
    unit_price: unitPrice,
    currency: business.defaultCurrency,
    tax_rate: business.defaultTaxRate ?? 0.21,
    category: input.category || undefined,
    status,
    product_type: 'service',
    stock_quantity: 50,
    stock_unit: 'servicio',
    track_inventory: true,
    allow_backorders: true,
    provider_partner_id: businessPartnerId,
    image_url: imageUrl,
    thumbnail_url: imageUrl,
    metadata: {
      kind: 'service',
      marketplace: 'oficioshub',
      pricing_mode: pricingMode,
      channels: [channel],
      showecommerce: true,
      provider: {
        business_partner_id: businessPartnerId,
        type: 'person',
        name: personName,
        zone,
        trade_rank: tradeRank,
      },
      provider_business_partner_id: businessPartnerId,
      public: {
        channels: [channel],
        showecommerce: true,
        provider_zone: zone,
        provider_name: personName,
        trade_rank: tradeRank,
        pricing_mode: pricingMode,
      },
    },
  };
};

export class ProviderProductService {
  async listMine(): Promise<Product[]> {
    const accountId = getActiveAccountId();
    const response = await httpClient.get<unknown>(API_ENDPOINTS.PRODUCTS(accountId), {
      params: {
        mine: true,
        page: 1,
        per_page: 100,
      },
    });
    return extractProducts(response);
  }

  async create(input: ProviderProductInput, businessPartnerId: string): Promise<Product> {
    const accountId = getActiveAccountId();
    const response = await httpClient.post<unknown>(
      API_ENDPOINTS.PRODUCTS(accountId),
      buildCreatePayload(input, businessPartnerId),
    );
    return extractProduct(response);
  }

  async update(productId: string, input: Partial<ProviderProductInput>): Promise<Product> {
    const accountId = getActiveAccountId();
    const payload: Record<string, unknown> = {};

    if (input.name !== undefined) payload.name = input.name.trim();
    if (input.description !== undefined) payload.description = input.description.trim();
    if (input.unit_price !== undefined) payload.unit_price = input.unit_price;
    if (input.category !== undefined) payload.category = input.category;
    if (input.status !== undefined) {
      payload.status = input.status;
    }
    if (input.imageUrl !== undefined) {
      payload.image_url = input.imageUrl.trim() || null;
      payload.thumbnail_url = input.imageUrl.trim() || null;
    }

    const response = await httpClient.patch<unknown>(
      API_ENDPOINTS.PRODUCT(accountId, productId),
      payload,
    );
    return extractProduct(response);
  }
}

export const providerProductService = new ProviderProductService();
