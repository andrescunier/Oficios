/**
 * Agrupación de productos por prefijo de SKU.
 *
 * - El primer segmento del SKU (antes del primer "-") es la clave de agrupación.
 * - Las opciones de variación se leen de product.metadata (color, talle, etc).
 * - Fallback: si metadata no tiene esas keys, se extraen del SKU:
 *     SKU = PREFIX-COLOR-TALLE → 2do segmento = color, 3ro = talle.
 * - Productos con un solo item en el grupo se muestran como producto normal.
 */

import type { Product } from '@/types/api';

export interface ProductGroup {
  type: 'group';
  /** SKU prefix used as group key */
  groupKey: string;
  /** All products in this group */
  products: Product[];
  /** Discovered option names, ordered (e.g. ["color", "talle"]) */
  optionNames: string[];
  /** Unique values per option name, in order of first appearance */
  optionValues: Record<string, string[]>;
  /** The "representative" product (first one) — used for name, description, image fallback */
  representative: Product;
}

export interface SingleProduct {
  type: 'single';
  product: Product;
}

export type ProductOrGroup = SingleProduct | ProductGroup;

/** Well-known metadata keys that represent variation options. */
const VARIATION_KEYS = ['color', 'talle', 'size', 'material'] as const;

/** SKU segment positions mapped to option names (fallback). */
const SKU_SEGMENT_MAP: Array<{ index: number; name: string }> = [
  { index: 1, name: 'color' },
  { index: 2, name: 'talle' },
];

/**
 * Extract the group key (prefix before first "-") from a SKU.
 * Returns null if the SKU has no dashes (can't be grouped).
 */
const getSkuGroupKey = (sku: string): string | null => {
  if (!sku) return null;
  const idx = sku.indexOf('-');
  if (idx <= 0) return null;
  return sku.substring(0, idx).toUpperCase();
};

/**
 * Preserves unique values in insertion order.
 */
const uniqueOrdered = (values: string[]): string[] => {
  const seen = new Set<string>();
  return values.filter((v) => {
    if (!v || seen.has(v)) return false;
    seen.add(v);
    return true;
  });
};

/**
 * Read a metadata value as string (case-insensitive key lookup).
 */
const getMetaValue = (product: Product, key: string): string | undefined => {
  const meta = product.metadata as Record<string, unknown> | undefined;
  if (!meta) return undefined;
  const val = meta[key] ?? meta[key.toLowerCase()];
  if (val == null) return undefined;
  return String(val);
};

/**
 * Get the SKU segment at a given index (0-based, split by "-").
 */
const getSkuSegment = (product: Product, index: number): string | undefined => {
  if (!product.sku) return undefined;
  const parts = product.sku.split('-');
  const val = parts[index];
  return val ? val.toUpperCase() : undefined;
};

/**
 * Resolve the value of an option for a product.
 * Priority: metadata → SKU segment fallback.
 */
export const getOptionValue = (product: Product, optionName: string): string | undefined => {
  // 1. Try metadata
  const metaVal = getMetaValue(product, optionName);
  if (metaVal) return metaVal;

  // 2. Fallback to SKU segment
  const mapping = SKU_SEGMENT_MAP.find((m) => m.name === optionName);
  if (mapping) {
    return getSkuSegment(product, mapping.index);
  }

  return undefined;
};

/**
 * Discover which option names are relevant for a group of products.
 * First checks metadata keys, then falls back to SKU segments.
 */
const discoverOptionNames = (products: Product[]): string[] => {
  const found: string[] = [];
  const foundNames = new Set<string>();

  // 1. Check metadata keys
  for (const key of VARIATION_KEYS) {
    const values = new Set<string>();
    for (const p of products) {
      const v = getMetaValue(p, key);
      if (v) values.add(v);
    }
    if (values.size > 1) {
      found.push(key);
      foundNames.add(key);
    }
  }

  // 2. If no metadata options found, try SKU segments as fallback
  if (found.length === 0) {
    for (const mapping of SKU_SEGMENT_MAP) {
      if (foundNames.has(mapping.name)) continue;
      const values = new Set<string>();
      for (const p of products) {
        const v = getSkuSegment(p, mapping.index);
        if (v) values.add(v);
      }
      if (values.size > 1) {
        found.push(mapping.name);
      }
    }
  }

  return found;
};

/**
 * Group an array of products by SKU prefix.
 * Products whose SKU has no dashes, or that are the only product in their group,
 * are returned as SingleProduct items.
 */
export const groupProductsBySku = (products: Product[]): ProductOrGroup[] => {
  // 1. Bucket products by group key
  const buckets = new Map<string, Product[]>();

  for (const product of products) {
    const key = getSkuGroupKey(product.sku);
    if (!key) {
      continue;
    }
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(product);
    } else {
      buckets.set(key, [product]);
    }
  }

  // 2. Build result, preserving approximate original order
  const result: ProductOrGroup[] = [];
  const emittedGroups = new Set<string>();

  for (const product of products) {
    const key = getSkuGroupKey(product.sku);

    if (!key) {
      result.push({
        type: 'group',
        groupKey: product.id,
        products: [product],
        optionNames: [],
        optionValues: {},
        representative: product,
      });
      continue;
    }

    if (emittedGroups.has(key)) {
      continue;
    }

    const bucket = buckets.get(key)!;

    if (bucket.length === 1) {
      const single = bucket[0];
      const optionNames = discoverOptionNames(bucket);
      const optionValues: Record<string, string[]> = {};
      for (const name of optionNames) {
        optionValues[name] = uniqueOrdered(
          bucket.map((p) => getOptionValue(p, name) || '').filter(Boolean),
        );
      }
      result.push({
        type: 'group',
        groupKey: key,
        products: bucket,
        optionNames,
        optionValues,
        representative: single,
      });
    } else {
      const optionNames = discoverOptionNames(bucket);
      const optionValues: Record<string, string[]> = {};
      for (const name of optionNames) {
        optionValues[name] = uniqueOrdered(
          bucket.map((p) => getOptionValue(p, name) || '').filter(Boolean),
        );
      }

      result.push({
        type: 'group',
        groupKey: key,
        products: bucket,
        optionNames,
        optionValues,
        representative: bucket[0],
      });
    }

    emittedGroups.add(key);
  }

  return result;
};

/**
 * Find the product matching the selected options.
 * Uses metadata first, then SKU segment fallback.
 * Falls back progressively: try all options, then fewer, then first product.
 */
export const findProductByOptions = (
  group: ProductGroup,
  selected: Record<string, string>,
): Product => {
  // Try exact match on all selected options
  const exactMatch = group.products.find((p) =>
    group.optionNames.every((name) => {
      const sel = selected[name];
      if (!sel) return true;
      return getOptionValue(p, name) === sel;
    }),
  );
  if (exactMatch) return exactMatch;

  // Partial match: first option only
  const firstName = group.optionNames[0];
  if (firstName && selected[firstName]) {
    const partial = group.products.find((p) => getOptionValue(p, firstName) === selected[firstName]);
    if (partial) return partial;
  }

  return group.products[0];
};

/**
 * Get available values for a specific option, given the other selections.
 */
export const getAvailableOptionValues = (
  group: ProductGroup,
  optionName: string,
  selected: Record<string, string>,
): Set<string> => {
  const otherNames = group.optionNames.filter((n) => n !== optionName);
  const available = new Set<string>();

  for (const p of group.products) {
    const matchesOthers = otherNames.every((name) => {
      const sel = selected[name];
      if (!sel) return true;
      return getOptionValue(p, name) === sel;
    });
    if (matchesOthers) {
      const val = getOptionValue(p, optionName);
      if (val) available.add(val);
    }
  }

  return available;
};

/**
 * Get values that have stock for a specific option, given the other selections.
 */
export const getInStockOptionValues = (
  group: ProductGroup,
  optionName: string,
  selected: Record<string, string>,
): Set<string> => {
  const otherNames = group.optionNames.filter((n) => n !== optionName);
  const inStock = new Set<string>();

  for (const p of group.products) {
    if ((p.stock_quantity ?? 0) <= 0) continue;
    const matchesOthers = otherNames.every((name) => {
      const sel = selected[name];
      if (!sel) return true;
      return getOptionValue(p, name) === sel;
    });
    if (matchesOthers) {
      const val = getOptionValue(p, optionName);
      if (val) inStock.add(val);
    }
  }

  return inStock;
};

/** Re-export for reading metadata values */
export { getMetaValue };
