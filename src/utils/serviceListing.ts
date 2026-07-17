import type { Product } from '@/types/api';

export type PricingMode = 'fixed' | 'a_convenir';

export type TradeRank =
  | 'oficial'
  | 'medio_oficial'
  | 'ayudante'
  | 'particular';

export const TRADE_RANK_OPTIONS: Array<{ value: TradeRank; label: string }> = [
  { value: 'oficial', label: 'Oficial' },
  { value: 'medio_oficial', label: 'Medio oficial' },
  { value: 'ayudante', label: 'Ayudante' },
  { value: 'particular', label: 'Particular' },
];

export const PRICING_MODE_OPTIONS: Array<{ value: PricingMode; label: string }> = [
  { value: 'fixed', label: 'Precio fijo del servicio' },
  { value: 'a_convenir', label: 'A convenir / presupuesto' },
];

const TRADE_RANK_LABELS: Record<TradeRank, string> = {
  oficial: 'Oficial',
  medio_oficial: 'Medio oficial',
  ayudante: 'Ayudante',
  particular: 'Particular',
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

export const tradeRankLabel = (rank?: string | null): string => {
  if (!rank) return '';
  const key = String(rank).toLowerCase() as TradeRank;
  return TRADE_RANK_LABELS[key] || String(rank);
};

export const getServiceListing = (product: Product | null | undefined) => {
  const meta = asRecord(product?.metadata);
  const provider = asRecord(meta.provider);
  const pub = asRecord(meta.public);

  const pricingRaw = String(
    meta.pricing_mode || pub.pricing_mode || 'fixed',
  ).toLowerCase();
  const pricingMode: PricingMode =
    pricingRaw === 'a_convenir' || pricingRaw === 'quote' || pricingRaw === 'presupuesto'
      ? 'a_convenir'
      : 'fixed';

  const tradeRank = String(
    provider.trade_rank || pub.trade_rank || provider.rank || '',
  ).toLowerCase() || null;

  const personName = String(
    provider.name || pub.provider_name || '',
  ).trim() || null;

  const headline = String(
    provider.headline || pub.provider_headline || '',
  ).trim() || null;

  const zone = String(
    provider.zone || pub.provider_zone || '',
  ).trim() || null;

  const isService =
    meta.kind === 'service'
    || meta.marketplace === 'oficioshub'
    || product?.product_type === 'service';

  return {
    isService,
    pricingMode,
    tradeRank,
    tradeRankLabel: tradeRankLabel(tradeRank),
    personName,
    headline,
    zone,
    isAConvenir: pricingMode === 'a_convenir',
  };
};

/** Permite contratar aunque el precio sea a convenir (unit_price puede ser 0). */
export const canRequestService = (product: Product): boolean => {
  const listing = getServiceListing(product);
  if ((product.stock_quantity || 0) <= 0) return false;
  if (listing.isAConvenir) return true;
  return typeof product.unit_price === 'number' && product.unit_price > 0;
};
