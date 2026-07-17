import type { Product } from '@/types/api';

export type PricingMode = 'fixed' | 'a_convenir';

export type TradeRank =
  | 'oficial'
  | 'medio_oficial'
  | 'ayudante'
  | 'particular';

/** Carga de demanda controlada por la plataforma (no stock). */
export type DemandLevel = 'high' | 'medium' | 'low';

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

export const DEMAND_LEVEL_OPTIONS: Array<{ value: DemandLevel; label: string; hint: string }> = [
  { value: 'high', label: 'Muy contratado', hint: 'Alta demanda en la plataforma' },
  { value: 'medium', label: 'Demanda media', hint: 'Contratación moderada' },
  { value: 'low', label: 'Poca demanda', hint: 'Más espacio relativo en agenda' },
];

const TRADE_RANK_LABELS: Record<TradeRank, string> = {
  oficial: 'Oficial',
  medio_oficial: 'Medio oficial',
  ayudante: 'Ayudante',
  particular: 'Particular',
};

const DEMAND_LABELS: Record<DemandLevel, string> = {
  high: 'Muy contratado',
  medium: 'Demanda media',
  low: 'Poca demanda',
};

const DEMAND_TONES: Record<DemandLevel, string> = {
  high: 'text-amber-700 bg-amber-50',
  medium: 'text-sky-700 bg-sky-50',
  low: 'text-emerald-700 bg-emerald-50',
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

  const demandRaw = String(
    meta.demand_level || pub.demand_level || provider.demand_level || 'medium',
  ).toLowerCase();
  const demandLevel: DemandLevel =
    demandRaw === 'high' || demandRaw === 'alta' || demandRaw === 'muy_contratado'
      ? 'high'
      : demandRaw === 'low' || demandRaw === 'baja' || demandRaw === 'poca'
        ? 'low'
        : 'medium';

  return {
    isService,
    pricingMode,
    tradeRank,
    tradeRankLabel: tradeRankLabel(tradeRank),
    personName,
    headline,
    zone,
    isAConvenir: pricingMode === 'a_convenir',
    demandLevel,
    demandLabel: DEMAND_LABELS[demandLevel],
    demandToneClassName: DEMAND_TONES[demandLevel],
  };
};

/** Servicios: sin stock. Precio fijo > 0 o a convenir. */
export const canRequestService = (product: Product): boolean => {
  const listing = getServiceListing(product);
  if (listing.isService) {
    if (listing.isAConvenir) return true;
    return typeof product.unit_price === 'number' && product.unit_price > 0;
  }
  if ((product.stock_quantity || 0) <= 0) return false;
  return typeof product.unit_price === 'number' && product.unit_price > 0;
};
