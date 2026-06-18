import { getObservabilityConfig } from '@/config/runtime';
import { getActiveAccountId, getActiveChannel } from '@/config/api';
import log from '@/lib/logger';
import { SESSION_INVALIDATED_EVENT } from '@/lib/session';

const TRACE_STORAGE_KEY = 'diap-observability-events';
const REMOTE_QUEUE_STORAGE_KEY = 'diap-observability-pending';
const SESSION_ID_STORAGE_KEY = 'diap-observability-session-id';
const MAX_TRACE_EVENTS = 100;
const DEFAULT_FLUSH_INTERVAL_MS = 15000;

export type AppEventType =
  | 'route_change'
  | 'query_error'
  | 'mutation_error'
  | 'render_error'
  | 'unhandled_error'
  | 'unhandled_rejection'
  | 'bootstrap_error'
  | 'tenant_config_loaded'
  | 'tenant_config_invalid'
  | 'tenant_config_fallback'
  | 'product_view'
  | 'add_to_cart'
  | 'checkout_started'
  | 'checkout_succeeded'
  | 'checkout_failed'
  | 'session_invalidated';

export interface AppEvent {
  id: string;
  sessionId: string;
  type: AppEventType;
  timestamp: string;
  pathname: string;
  accountId: string;
  channel: string;
  details: Record<string, unknown>;
}

interface RemoteObservabilityPayload {
  sessionId: string;
  accountId: string;
  channel: string;
  sentAt: string;
  reason: string;
  events: AppEvent[];
}

declare global {
  interface Window {
    __APP_MONITOR__?: {
      getEvents: () => AppEvent[];
      getPending: () => AppEvent[];
      getSessionId: () => string;
      clear: () => void;
      flush: () => Promise<boolean>;
    };
  }
}

let listenersInstalled = false;
let flushTimerId: number | null = null;
let isFlushing = false;

const canUseSessionStorage = () => typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';

export const createCorrelationId = (prefix = 'evt') =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  return {
    message: 'Unknown error',
    value: String(error),
  };
};

const readStoredEvents = (key: string): AppEvent[] => {
  if (!canUseSessionStorage()) {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStoredEvents = (key: string, events: AppEvent[], maxSize: number) => {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify(events.slice(-maxSize)));
  } catch {
    // ignore quota/unavailable errors
  }
};

export const getSessionCorrelationId = (): string => {
  if (!canUseSessionStorage()) {
    return createCorrelationId('sess');
  }

  try {
    const existing = window.sessionStorage.getItem(SESSION_ID_STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const nextId = createCorrelationId('sess');
    window.sessionStorage.setItem(SESSION_ID_STORAGE_KEY, nextId);
    return nextId;
  } catch {
    return createCorrelationId('sess');
  }
};

export const getRecordedEvents = (): AppEvent[] => readStoredEvents(TRACE_STORAGE_KEY);

export const getPendingRemoteEvents = (): AppEvent[] => readStoredEvents(REMOTE_QUEUE_STORAGE_KEY);

const queueRemoteEvent = (event: AppEvent) => {
  const maxQueueSize = Math.max(1, getObservabilityConfig().maxQueueSize || 50);
  writeStoredEvents(REMOTE_QUEUE_STORAGE_KEY, [...getPendingRemoteEvents(), event], maxQueueSize);
};

const buildRemotePayload = (events: AppEvent[], reason: string): RemoteObservabilityPayload => ({
  sessionId: getSessionCorrelationId(),
  accountId: getActiveAccountId(),
  channel: getActiveChannel(),
  sentAt: new Date().toISOString(),
  reason,
  events,
});

const postRemoteEvents = async (events: AppEvent[], reason: string) => {
  const config = getObservabilityConfig();
  if (!config.enabled || !config.endpoint) {
    return false;
  }

  const payload = buildRemotePayload(events, reason);

  const shouldUseBeacon =
    config.useBeacon &&
    typeof navigator !== 'undefined' &&
    typeof navigator.sendBeacon === 'function' &&
    (reason === 'pagehide' || reason === 'visibilitychange');

  if (shouldUseBeacon) {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    return navigator.sendBeacon(config.endpoint, blob);
  }

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Account-ID': getActiveAccountId(),
    },
    body: JSON.stringify(payload),
    keepalive: true,
  });

  return response.ok;
};

export const flushRemoteEvents = async (reason = 'manual'): Promise<boolean> => {
  const config = getObservabilityConfig();
  if (!config.enabled || !config.endpoint || isFlushing) {
    return false;
  }

  const pending = getPendingRemoteEvents();
  if (pending.length === 0) {
    return true;
  }

  const batchSize = Math.max(1, config.maxQueueSize || 50);
  const batch = pending.slice(0, batchSize);

  isFlushing = true;
  try {
    const delivered = await postRemoteEvents(batch, reason);
    if (!delivered) {
      return false;
    }

    writeStoredEvents(REMOTE_QUEUE_STORAGE_KEY, pending.slice(batch.length), batchSize);
    return true;
  } catch (error) {
    log.config.warn('[observability] remote flush failed', error);
    return false;
  } finally {
    isFlushing = false;
  }
};

const scheduleRemoteFlush = () => {
  if (typeof window === 'undefined' || flushTimerId !== null) {
    return;
  }

  const interval = Math.max(1000, getObservabilityConfig().flushIntervalMs || DEFAULT_FLUSH_INTERVAL_MS);
  flushTimerId = window.setTimeout(async () => {
    flushTimerId = null;
    await flushRemoteEvents('interval');
    scheduleRemoteFlush();
  }, interval);
};

const exposeMonitor = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.__APP_MONITOR__ = {
    getEvents: getRecordedEvents,
    getPending: getPendingRemoteEvents,
    getSessionId: getSessionCorrelationId,
    clear: clearRecordedEvents,
    flush: () => flushRemoteEvents('manual'),
  };
};

export const recordAppEvent = (type: AppEventType, details: Record<string, unknown> = {}) => {
  const event: AppEvent = {
    id: createCorrelationId('evt'),
    sessionId: getSessionCorrelationId(),
    type,
    timestamp: new Date().toISOString(),
    pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
    accountId: getActiveAccountId(),
    channel: getActiveChannel(),
    details,
  };

  writeStoredEvents(TRACE_STORAGE_KEY, [...getRecordedEvents(), event], MAX_TRACE_EVENTS);
  queueRemoteEvent(event);
  log.config.warn('[observability]', type, details);
  return event;
};

export const clearRecordedEvents = () => {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(TRACE_STORAGE_KEY);
    window.sessionStorage.removeItem(REMOTE_QUEUE_STORAGE_KEY);
  } catch {
    // ignore
  }
};

export const recordRouteChange = (pathname: string) => {
  recordAppEvent('route_change', { pathname });
};

export const recordQueryError = (type: 'query_error' | 'mutation_error', target: string, error: unknown) => {
  recordAppEvent(type, {
    target,
    error: serializeError(error),
  });
};

export const recordRenderError = (error: unknown, componentStack?: string) => {
  recordAppEvent('render_error', {
    error: serializeError(error),
    componentStack,
  });
};

export const installGlobalErrorHandlers = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!listenersInstalled) {
    window.addEventListener('error', (event) => {
      const target = event.target as
        | (EventTarget & { tagName?: string; src?: string; href?: string; currentSrc?: string })
        | null;

      recordAppEvent('unhandled_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: serializeError(event.error),
        resource: target
          ? {
              tagName: target.tagName || null,
              src: target.currentSrc || target.src || null,
              href: target.href || null,
            }
          : null,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      recordAppEvent('unhandled_rejection', {
        reason: serializeError(event.reason),
      });
    });

    window.addEventListener(SESSION_INVALIDATED_EVENT, (event) => {
      const detail = event instanceof CustomEvent ? event.detail : {};
      recordAppEvent('session_invalidated', detail && typeof detail === 'object' ? detail : {});
    });

    window.addEventListener('pagehide', () => {
      void flushRemoteEvents('pagehide');
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        void flushRemoteEvents('visibilitychange');
      }
    });

    listenersInstalled = true;
  }

  exposeMonitor();
  scheduleRemoteFlush();
};
