import log from '@/lib/logger';

const APP_STORAGE_KEYS = [
  'diapstore-store',
  'business_partner_id',
  'active_account_id',
  'account_info',
] as const;

export const setPendingRedirect = (redirect: string) => {
  try {
    localStorage.setItem('diap-redirect', redirect);
  } catch (e) {
    log.store.error('Error setting diap-redirect flag:', e);
  }
};

export const clearClientSession = (options?: {
  redirect?: string;
  clearAllLocalStorage?: boolean;
  removeAuthToken?: () => void;
}) => {
  const { redirect, clearAllLocalStorage = false, removeAuthToken } = options || {};

  try {
    removeAuthToken?.();

    if (clearAllLocalStorage) {
      localStorage.clear();
    } else {
      APP_STORAGE_KEYS.forEach((key) => {
        localStorage.removeItem(key);
      });
    }

    sessionStorage.clear();

    if (redirect) {
      setPendingRedirect(redirect);
    }
  } catch (e) {
    log.store.error('Error clearing client session:', e);
  }
};
