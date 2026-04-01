import { clearRecordedEvents, getRecordedEvents } from '@/lib/observability';
import { loadTenantConfig, waitForTenantConfig } from './tenantConfigService';

const CACHE_KEY = 'ecommerce-config:http://127.0.0.1:8000:tenant-1';

describe('tenantConfigService', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearRecordedEvents();
    window.__APP_CONFIG__ = {
      api: {
        url: 'http://127.0.0.1:8000',
        accountId: 'tenant-1',
        accountSlug: 'tenant',
        channel: 'ecommerce',
      },
    };
  });

  it('returns validated config from network and caches it', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          app: { name: 'Tenant Store' },
          images: { productFallbacks: { default: '/placeholder-product.svg' } },
        },
      }),
    }));

    const config = await loadTenantConfig('http://127.0.0.1:8000', 'tenant-1');

    expect(config?.app?.name).toBe('Tenant Store');
    expect(localStorage.getItem(CACHE_KEY)).toContain('Tenant Store');
  });

  it('falls back to null and records invalid payload event', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { app: 'invalid' },
      }),
    }));

    const config = await loadTenantConfig('http://127.0.0.1:8000', 'tenant-1');

    expect(config).toBeNull();
    expect(getRecordedEvents().some((event) => event.type === 'tenant_config_invalid')).toBe(true);
  });

  it('uses stale cache while revalidating in background', async () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now() - (10 * 60 * 1000),
      data: {
        app: { name: 'Cached Tenant' },
      },
    }));

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          app: { name: 'Fresh Tenant' },
        },
      }),
    }));

    const config = await loadTenantConfig('http://127.0.0.1:8000', 'tenant-1');

    expect(config?.app?.name).toBe('Cached Tenant');
    expect(getRecordedEvents().some((event) =>
      event.type === 'tenant_config_fallback' && event.details?.reason === 'stale_cache'
    )).toBe(true);
  });

  it('retries until a valid config is available', async () => {
    vi.useFakeTimers();

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            app: { name: 'Recovered Tenant' },
            business: { defaultCurrency: 'ARS' },
            images: {
              placeholders: [],
              backgrounds: [],
              banners: [],
              productFallbacks: [],
            },
            filters: {
              capacidadOptions: [],
              velocidadOptions: [],
            },
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const promise = waitForTenantConfig('http://127.0.0.1:8000', 'tenant-1');

    await vi.runOnlyPendingTimersAsync();
    const config = await promise;

    expect(config?.app?.name).toBe('Recovered Tenant');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});
