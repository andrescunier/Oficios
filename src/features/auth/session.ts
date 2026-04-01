import type { Account, User } from '@/types/api';
import { clearClientSession, SESSION_INVALIDATED_EVENT } from '@/lib/session';
import log from '@/lib/logger';

export const SESSION_STORAGE_KEYS = {
  redirect: 'diap-redirect',
  registrationData: 'registration_data',
  businessPartnerId: 'business_partner_id',
  accountInfo: 'account_info',
  activeAccountId: 'active_account_id',
  store: 'diapstore-store',
} as const;

export interface RegistrationDraft {
  first_name?: string;
  last_name?: string;
  phone?: string;
  company_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface AuthSessionSnapshot {
  user: User | null;
  account: Account | null;
  isAuthenticated: boolean;
  token: string | null;
}

const readJson = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : null;
  } catch {
    return null;
  }
};

const getPersistedStoreState = () => {
  return readJson<{ state?: { auth?: Partial<AuthSessionSnapshot> } }>(SESSION_STORAGE_KEYS.store);
};

export const getPersistedRegistrationDraft = (): RegistrationDraft | null => {
  return readJson<RegistrationDraft>(SESSION_STORAGE_KEYS.registrationData);
};

export const saveRegistrationDraft = (draft: RegistrationDraft) => {
  try {
    localStorage.setItem(SESSION_STORAGE_KEYS.registrationData, JSON.stringify(draft));
  } catch (error) {
    log.auth.error('Error saving registration draft:', error);
  }
};

export const getBusinessPartnerId = (): string | null => {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEYS.businessPartnerId);
  } catch {
    return null;
  }
};

export const saveBusinessPartnerId = (businessPartnerId: string) => {
  try {
    localStorage.setItem(SESSION_STORAGE_KEYS.businessPartnerId, businessPartnerId);
  } catch (error) {
    log.auth.error('Error saving business partner id:', error);
  }
};

export const saveAccountSession = (account: Account) => {
  try {
    localStorage.setItem(SESSION_STORAGE_KEYS.accountInfo, JSON.stringify(account));
    localStorage.setItem(SESSION_STORAGE_KEYS.activeAccountId, account.id);
  } catch (error) {
    log.auth.error('Error saving account session:', error);
  }
};

export const getPersistedAccountSession = (): Account | null => {
  const accountInfo = readJson<Account>(SESSION_STORAGE_KEYS.accountInfo);
  if (accountInfo) {
    return accountInfo;
  }

  const persistedAccount = getPersistedStoreState()?.state?.auth?.account;
  return persistedAccount && typeof persistedAccount === 'object' ? persistedAccount as Account : null;
};

export const getPersistedActiveAccountId = (): string | null => {
  try {
    const explicitAccountId = localStorage.getItem(SESSION_STORAGE_KEYS.activeAccountId);
    if (explicitAccountId && explicitAccountId.trim().length > 0) {
      return explicitAccountId;
    }
  } catch {
    // ignore
  }

  return getPersistedAccountSession()?.id || null;
};

export const getPersistedActiveAccountSlug = (): string | null => {
  return getPersistedAccountSession()?.slug || null;
};

export const getPendingRedirect = (): string | null => {
  try {
    const redirect = localStorage.getItem(SESSION_STORAGE_KEYS.redirect);
    return redirect && redirect.trim().length > 0 ? redirect : null;
  } catch {
    return null;
  }
};

export const consumePendingRedirect = (): string | null => {
  const redirect = getPendingRedirect();

  if (!redirect) {
    return null;
  }

  try {
    localStorage.removeItem(SESSION_STORAGE_KEYS.redirect);
  } catch {
    // ignore
  }

  return redirect;
};

export const getPersistedAuthSnapshot = (): AuthSessionSnapshot => {
  const auth = getPersistedStoreState()?.state?.auth;

  return {
    user: auth?.user && typeof auth.user === 'object' ? auth.user as User : null,
    account: auth?.account && typeof auth.account === 'object' ? auth.account as Account : null,
    isAuthenticated: auth?.isAuthenticated === true,
    token: typeof auth?.token === 'string' ? auth.token : null,
  };
};

export const getAuthIntegrityIssue = (auth: Partial<AuthSessionSnapshot> | null | undefined): string | null => {
  if (!auth) {
    return null;
  }

  if (auth.isAuthenticated && !auth.token) {
    return 'missing_token';
  }

  if (auth.isAuthenticated && !auth.user) {
    return 'missing_user';
  }

  if (!auth.isAuthenticated && auth.token) {
    return 'token_without_auth';
  }

  if (typeof auth.token === 'string' && auth.token.length > 0 && auth.token.length < 10) {
    return 'invalid_token';
  }

  return null;
};

export const clearAuthSession = (options?: {
  redirect?: string;
  clearAllLocalStorage?: boolean;
  removeAuthToken?: () => void;
  preserveCart?: boolean;
}) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SESSION_INVALIDATED_EVENT, {
      detail: {
        reason: options?.redirect || 'manual_clear',
        preserveCart: Boolean(options?.preserveCart),
      },
    }));
  }
  clearClientSession(options);
};

export const extractCustomerIdFromPersistedSession = (): string | null => {
  return getBusinessPartnerId();
};

export const getPersistedAuthToken = (): string | null => {
  const token = getPersistedAuthSnapshot().token;
  return typeof token === 'string' && token.trim().length > 0 ? token : null;
};

export const hasPersistedAuthToken = (): boolean => Boolean(getPersistedAuthToken());

export const buildRegistrationDraftFromUser = (user: User, registrationDraft?: RegistrationDraft | null): RegistrationDraft => ({
  first_name: user.person?.first_name || registrationDraft?.first_name || '',
  last_name: user.person?.last_name || registrationDraft?.last_name || '',
  phone: user.person?.phone || registrationDraft?.phone || '',
  company_name: registrationDraft?.company_name || '',
  address: registrationDraft?.address || '',
  city: registrationDraft?.city || '',
  state: registrationDraft?.state || '',
  zipCode: registrationDraft?.zipCode || '',
});
