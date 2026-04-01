import {
  clearRecordedEvents,
  flushRemoteEvents,
  getRecordedEvents,
  getPendingRemoteEvents,
  getSessionCorrelationId,
  installGlobalErrorHandlers,
  recordAppEvent,
  recordRouteChange,
} from './observability';

describe('observability', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    delete window.__APP_MONITOR__;
    window.__APP_CONFIG__ = {
      api: {
        url: 'http://127.0.0.1:8000',
        accountId: 'tenant-1',
        accountSlug: 'tenant',
        channel: 'ecommerce',
      },
    };
  });

  it('guarda eventos y expone monitor global', () => {
    installGlobalErrorHandlers();
    recordRouteChange('/productos');
    recordAppEvent('bootstrap_error', { step: 'test' });

    const events = getRecordedEvents();

    expect(window.__APP_MONITOR__).toBeDefined();
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe('route_change');
    expect(events[0].sessionId).toBe(getSessionCorrelationId());
    expect(events[1].details).toMatchObject({ step: 'test' });
  });

  it('permite limpiar la traza', () => {
    recordAppEvent('bootstrap_error', { step: 'before-clear' });
    expect(getRecordedEvents()).toHaveLength(1);

    clearRecordedEvents();
    expect(getRecordedEvents()).toHaveLength(0);
  });

  it('envia eventos pendientes al transporte remoto cuando está habilitado', async () => {
    window.__APP_CONFIG__ = {
      ...window.__APP_CONFIG__,
      observability: {
        enabled: true,
        endpoint: 'http://127.0.0.1:8000/api/frontend-events',
        flushIntervalMs: 1000,
        maxQueueSize: 10,
        useBeacon: false,
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
    });
    vi.stubGlobal('fetch', fetchMock);

    recordAppEvent('checkout_started', { checkoutId: 'chk-1' });

    expect(getPendingRemoteEvents()).toHaveLength(1);
    await expect(flushRemoteEvents('manual')).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getPendingRemoteEvents()).toHaveLength(0);
  });
});
