/**
 * Single-active-session por usuario dentro del mismo navegador.
 *
 * Estrategia (frontend-only): cada login genera un `session_id` único, se persiste
 * en `localStorage` y se broadcast-ea via `BroadcastChannel` + `storage` event.
 * Cualquier pestaña abierta que detecte un `session_id` distinto al propio
 * dispara el callback `onSessionInvalidated` (típicamente: logout + redirect).
 *
 * Limitaciones: NO protege contra dos navegadores distintos ni dos máquinas.
 * Para enforcement real, el backend debe asociar token <-> session activa.
 */

const STORAGE_KEY = 'diapstore-active-session-id';
const CHANNEL_NAME = 'diapstore-session';

let currentSessionId: string | null = null;
let channel: BroadcastChannel | null = null;
let storageListener: ((e: StorageEvent) => void) | null = null;
let invalidatedHandler: (() => void) | null = null;

const generateSessionId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getChannel = (): BroadcastChannel | null => {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null;
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME);
  return channel;
};

const handleIncomingSessionId = (incoming: string | null) => {
  if (!incoming) return;
  if (!currentSessionId) return; // aún no hay sesión local registrada
  if (incoming === currentSessionId) return;
  // Otra sesión activa apareció — invalidar la actual
  invalidatedHandler?.();
};

/**
 * Registra una nueva sesión activa para el usuario actual.
 * Llamar desde `login` después de setear el estado.
 */
export const claimActiveSession = (): string => {
  const sessionId = generateSessionId();
  currentSessionId = sessionId;
  try {
    localStorage.setItem(STORAGE_KEY, sessionId);
  } catch {
    /* noop */
  }
  try {
    getChannel()?.postMessage({ type: 'claim', sessionId });
  } catch {
    /* noop */
  }
  return sessionId;
};

/**
 * Limpia el marcador de sesión activa local (sólo si nos pertenece).
 * Llamar desde `logout`.
 */
export const releaseActiveSession = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored === currentSessionId) {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* noop */
  }
  currentSessionId = null;
};

/**
 * Suscribe el callback que se ejecuta cuando otra pestaña/sesión toma el control.
 * Llamar UNA vez al inicio de la app (bootstrap).
 */
export const subscribeSessionInvalidation = (onInvalidated: () => void) => {
  invalidatedHandler = onInvalidated;

  if (typeof window === 'undefined') return () => {};

  // 1) BroadcastChannel
  const ch = getChannel();
  ch?.addEventListener('message', (e: MessageEvent) => {
    if (e?.data?.type === 'claim') {
      handleIncomingSessionId(e.data.sessionId);
    }
  });

  // 2) storage event (otra pestaña del mismo browser)
  storageListener = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    handleIncomingSessionId(e.newValue);
  };
  window.addEventListener('storage', storageListener);

  return () => {
    if (storageListener) window.removeEventListener('storage', storageListener);
    storageListener = null;
    invalidatedHandler = null;
  };
};

/**
 * Sincroniza el id local con el de localStorage al restaurar una sesión persistida
 * (initializeAuth). Si no hay marcador, lo registra ahora.
 */
export const adoptOrClaimSessionFromStorage = (): string => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      currentSessionId = stored;
      return stored;
    }
  } catch {
    /* noop */
  }
  return claimActiveSession();
};
