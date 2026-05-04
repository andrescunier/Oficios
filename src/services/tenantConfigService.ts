/**
 * Tenant Config Service
 * Fetches ecommerce configuration from the API at startup.
 * Uses native fetch() instead of httpClient to avoid circular dependencies
 * (httpClient depends on config, and config depends on this service).
 */

import { getRuntimeConfigValidationErrors, parseRuntimeConfigPayload } from '@/config/runtimeSchema';
import { recordAppEvent } from '@/lib/observability';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const INITIAL_RETRY_DELAY_MS = 1500;
const MAX_RETRY_DELAY_MS = 15000;
const MAX_RETRY_DURATION_MS = 2 * 60 * 1000; // 2 minutos

interface CachedConfig {
  data: NonNullable<ReturnType<typeof parseRuntimeConfigPayload>>;
  timestamp: number;
}

type TenantConfigFailureReason = 'http_error' | 'empty_payload' | 'invalid_payload' | 'network_error';

interface TenantConfigFetchSuccess {
  ok: true;
  data: NonNullable<ReturnType<typeof parseRuntimeConfigPayload>>;
}

interface TenantConfigFetchFailure {
  ok: false;
  reason: TenantConfigFailureReason;
  status?: number;
  error?: string;
}

type TenantConfigFetchResult = TenantConfigFetchSuccess | TenantConfigFetchFailure;

export interface TenantConfigRetryState {
  attempt: number;
  nextRetryInMs: number;
  reason: TenantConfigFailureReason;
  status?: number;
  error?: string;
}

function buildCacheKey(apiBaseUrl: string, accountId: string): string {
  return `ecommerce-config:${apiBaseUrl}:${accountId}`;
}

function getCachedConfig(apiBaseUrl: string, accountId: string): { data: CachedConfig['data']; isStale: boolean } | null {
  try {
    const raw = localStorage.getItem(buildCacheKey(apiBaseUrl, accountId));
    if (!raw) return null;
    const cached: CachedConfig = JSON.parse(raw);
    return {
      data: cached.data,
      isStale: Date.now() - cached.timestamp > CACHE_TTL,
    };
  } catch {
    return null;
  }
}

function setCachedConfig(
  apiBaseUrl: string,
  accountId: string,
  data: NonNullable<ReturnType<typeof parseRuntimeConfigPayload>>,
): void {
  try {
    const entry: CachedConfig = { data, timestamp: Date.now() };
    localStorage.setItem(buildCacheKey(apiBaseUrl, accountId), JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

function stripNullValues<T>(value: T): T {
  if (value === null) {
    return undefined as T;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => stripNullValues(item))
      .filter((item) => item !== undefined) as T;
  }

  if (typeof value === 'object' && value !== null) {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, entry]) => {
      const nextValue = stripNullValues(entry);
      if (nextValue !== undefined) {
        acc[key] = nextValue;
      }
      return acc;
    }, {}) as T;
  }

  return value;
}

function normalizeFilterOptions(raw: unknown) {
  if (!Array.isArray(raw)) {
    return raw;
  }

  return raw
    .map((item) => {
      if (typeof item === 'string' && item.trim() !== '') {
        return { value: item, label: item };
      }

      if (
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { value?: unknown }).value === 'string' &&
        typeof (item as { label?: unknown }).label === 'string'
      ) {
        return item;
      }

      return null;
    })
    .filter(Boolean);
}

function normalizeNamedImages(raw: unknown, keys: string[]) {
  if (!Array.isArray(raw)) {
    return raw;
  }

  return keys.reduce<Record<string, string>>((acc, key, index) => {
    const value = raw[index];
    if (typeof value === 'string' && value.trim() !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function normalizeProductFallbacks(raw: unknown) {
  if (!Array.isArray(raw)) {
    return raw;
  }

  return raw.reduce<Record<string, string>>((acc, item, index) => {
    if (typeof item === 'string' && item.trim() !== '') {
      acc[index === 0 ? 'default' : `fallback_${index + 1}`] = item;
    }
    return acc;
  }, {});
}

function adaptTenantConfigPayload(payload: unknown): unknown {
  const sanitizedPayload = stripNullValues(payload);
  if (typeof sanitizedPayload !== 'object' || sanitizedPayload === null) {
    return sanitizedPayload;
  }

  const config = JSON.parse(JSON.stringify(sanitizedPayload)) as Record<string, unknown>;

  if (typeof config.filters === 'object' && config.filters !== null) {
    const filters = config.filters as Record<string, unknown>;
    filters.capacidadOptions = normalizeFilterOptions(filters.capacidadOptions);
    filters.velocidadOptions = normalizeFilterOptions(filters.velocidadOptions);
  }

  if (typeof config.images === 'object' && config.images !== null) {
    const images = config.images as Record<string, unknown>;

    if (Array.isArray(images.categories) && images.categories.every((item) => typeof item === 'string')) {
      images.categories = [];
    }

    images.placeholders = normalizeNamedImages(images.placeholders, ['product', 'category', 'user']);
    images.backgrounds = normalizeNamedImages(images.backgrounds, ['hero', 'features', 'testimonials']);
    images.banners = normalizeNamedImages(images.banners, ['main', 'secondary', 'seasonal', 'sale']);
    images.productFallbacks = normalizeProductFallbacks(images.productFallbacks);
  }

  return config;
}

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const getRetryDelay = (attempt: number) =>
  Math.min(MAX_RETRY_DELAY_MS, INITIAL_RETRY_DELAY_MS * Math.max(1, 2 ** (attempt - 1)));

/**
 * Fetches the ecommerce config from the API.
 * Returns the config object or null if the request fails.
 */
async function fetchConfigFromAPI(apiBaseUrl: string, accountId: string): Promise<TenantConfigFetchResult> {
  const url = `${apiBaseUrl}/api/accounts/${encodeURIComponent(accountId)}/ecommerce-config`;
  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) {
      recordAppEvent('tenant_config_fallback', {
        reason: 'http_error',
        status: response.status,
      });
      return {
        ok: false,
        reason: 'http_error',
        status: response.status,
      };
    }
    const json = await response.json();
    if (!json) {
      recordAppEvent('tenant_config_fallback', {
        reason: 'empty_payload',
      });
      return {
        ok: false,
        reason: 'empty_payload',
      };
    }
    const payload = adaptTenantConfigPayload(json?.data ?? json);
    if (!payload || typeof payload !== 'object') {
      recordAppEvent('tenant_config_invalid', {
        errors: ['payload must be a JSON object'],
      });
      return {
        ok: false,
        reason: 'invalid_payload',
        error: 'payload must be a JSON object',
      };
    }
    const parsedConfig = parseRuntimeConfigPayload(payload);

    if (!parsedConfig) {
      const errors = getRuntimeConfigValidationErrors(payload);
      recordAppEvent('tenant_config_invalid', { errors });
      return {
        ok: false,
        reason: 'invalid_payload',
        error: errors.join(', '),
      };
    }

    recordAppEvent('tenant_config_loaded', { source: 'network' });
    return {
      ok: true,
      data: parsedConfig,
    };
  } catch (error) {
    recordAppEvent('tenant_config_fallback', {
      reason: 'network_error',
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      ok: false,
      reason: 'network_error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function retryFetchUntilSuccess(
  apiBaseUrl: string,
  accountId: string,
  options?: {
    onRetry?: (state: TenantConfigRetryState) => void;
  },
): Promise<NonNullable<ReturnType<typeof parseRuntimeConfigPayload>>> {
  let attempt = 0;
  const startedAt = Date.now();

  while (true) {
    const result = await fetchConfigFromAPI(apiBaseUrl, accountId);
    if (result.ok) {
      setCachedConfig(apiBaseUrl, accountId, result.data);
      return result.data;
    }

    // Invalid payload means the server responded but the data is unparseable.
    // Retrying won't help — fall back to empty defaults so the app can render.
    if (result.reason === 'invalid_payload') {
      recordAppEvent('tenant_config_fallback', { reason: 'invalid_payload' });
      return {} as NonNullable<ReturnType<typeof parseRuntimeConfigPayload>>;
    }

    const elapsed = Date.now() - startedAt;
    if (elapsed >= MAX_RETRY_DURATION_MS) {
      recordAppEvent('tenant_config_fallback', { reason: 'timeout', elapsed });
      throw new Error('No se pudo obtener la configuración del sitio después de 2 minutos de intentos.');
    }

    attempt += 1;
    const nextRetryInMs = Math.min(getRetryDelay(attempt), MAX_RETRY_DURATION_MS - elapsed);
    options?.onRetry?.({
      attempt,
      nextRetryInMs,
      reason: result.reason,
      status: result.status,
      error: result.error,
    });
    await sleep(nextRetryInMs);
  }
}

/**
 * Loads the tenant ecommerce configuration.
 *
 * Strategy:
 * 1. If valid cache exists, return it immediately AND revalidate in background.
 * 2. If no cache, fetch from API (blocking).
 * 3. If API fails and no cache, return null (app will use .env fallbacks).
 */
export async function loadTenantConfig(apiBaseUrl: string, accountId: string) {
  const cached = getCachedConfig(apiBaseUrl, accountId);

  if (cached && !cached.isStale) {
    recordAppEvent('tenant_config_loaded', { source: 'cache' });
    void fetchConfigFromAPI(apiBaseUrl, accountId).then((fresh) => {
      if (fresh.ok) setCachedConfig(apiBaseUrl, accountId, fresh.data);
    });
    return cached.data;
  }

  if (cached?.isStale) {
    recordAppEvent('tenant_config_fallback', { reason: 'stale_cache' });
    void fetchConfigFromAPI(apiBaseUrl, accountId).then((fresh) => {
      if (fresh.ok) setCachedConfig(apiBaseUrl, accountId, fresh.data);
    });
    return cached.data;
  }

  // No cache — blocking fetch
  const result = await fetchConfigFromAPI(apiBaseUrl, accountId);
  if (result.ok) {
    setCachedConfig(apiBaseUrl, accountId, result.data);
    return result.data;
  }

  recordAppEvent('tenant_config_fallback', { reason: 'defaults' });
  return null;
}

export async function waitForTenantConfig(
  apiBaseUrl: string,
  accountId: string,
  options?: {
    onRetry?: (state: TenantConfigRetryState) => void;
  },
): Promise<NonNullable<ReturnType<typeof parseRuntimeConfigPayload>>> {
  const cached = getCachedConfig(apiBaseUrl, accountId);

  if (cached) {
    recordAppEvent('tenant_config_loaded', {
      source: 'cache',
      stale: cached.isStale,
    });
    void retryFetchUntilSuccess(apiBaseUrl, accountId);
    return cached.data;
  }

  return retryFetchUntilSuccess(apiBaseUrl, accountId, options);
}
