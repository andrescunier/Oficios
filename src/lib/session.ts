import log from '@/lib/logger';

const APP_STORAGE_KEYS = [
  'diapstore-store',
  'business_partner_id',
  'active_account_id',
  'account_info',
] as const;

export const PENDING_REDIRECT_EVENT = 'diap:pending-redirect';
export const SESSION_INVALIDATED_EVENT = 'diap:session-invalidated';

interface PreservedStoreSnapshot {
  cart?: unknown;
  recentProducts?: unknown;
  theme?: unknown;
}

const readPreservedStoreSnapshot = (): PreservedStoreSnapshot | null => {
  try {
    const raw = localStorage.getItem('diapstore-store');
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return {
      cart: parsed?.state?.cart,
      recentProducts: parsed?.state?.recentProducts,
      theme: parsed?.state?.ui?.theme,
    };
  } catch (e) {
    log.store.warn('Error reading persisted cart snapshot:', e);
    return null;
  }
};

const restorePreservedStoreSnapshot = (snapshot: PreservedStoreSnapshot | null) => {
  if (!snapshot?.cart) {
    return;
  }

  try {
    localStorage.setItem('diapstore-store', JSON.stringify({
      state: {
        auth: {
          user: null,
          account: null,
          isAuthenticated: false,
          token: null,
        },
        cart: snapshot.cart,
        favorites: [],
        recentProducts: Array.isArray(snapshot.recentProducts) ? snapshot.recentProducts : [],
        ui: {
          theme: snapshot.theme === 'dark' ? 'dark' : 'light',
        },
      },
      version: 0,
    }));
  } catch (e) {
    log.store.error('Error restoring preserved cart snapshot:', e);
  }
};

export const setPendingRedirect = (redirect: string) => {
  try {
    localStorage.setItem('diap-redirect', redirect);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(PENDING_REDIRECT_EVENT, { detail: { redirect } }));
    }
  } catch (e) {
    log.store.error('Error setting diap-redirect flag:', e);
  }
};

export const consumePendingRedirect = (): string | null => {
  try {
    const redirect = localStorage.getItem('diap-redirect');
    if (!redirect) {
      return null;
    }

    localStorage.removeItem('diap-redirect');
    return redirect;
  } catch (e) {
    log.store.error('Error consuming diap-redirect flag:', e);
    return null;
  }
};

export const clearClientSession = (options?: {
  redirect?: string;
  clearAllLocalStorage?: boolean;
  removeAuthToken?: () => void;
  preserveCart?: boolean;
}) => {
  const {
    redirect,
    clearAllLocalStorage = false,
    removeAuthToken,
    preserveCart = false,
  } = options || {};

  try {
    const preservedStoreSnapshot = !clearAllLocalStorage && preserveCart
      ? readPreservedStoreSnapshot()
      : null;

    removeAuthToken?.();

    if (clearAllLocalStorage) {
      localStorage.clear();
    } else {
      APP_STORAGE_KEYS.forEach((key) => {
        localStorage.removeItem(key);
      });
    }

    sessionStorage.clear();
    restorePreservedStoreSnapshot(preservedStoreSnapshot);

    if (redirect) {
      setPendingRedirect(redirect);
    }
  } catch (e) {
    log.store.error('Error clearing client session:', e);
  }
};
