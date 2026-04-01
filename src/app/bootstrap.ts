import { setRuntimeConfig } from '@/config/runtime';
import { initializeTheme } from '@/config/theme';
import { waitForTenantConfig, type TenantConfigRetryState } from '@/services/tenantConfigService';
import { installGlobalErrorHandlers, recordAppEvent } from '@/lib/observability';
import { initializeAuth, useStore } from '@/store/useStore';
import log from '@/lib/logger';

type BootstrapStep = 'tenant_config' | 'theme' | 'runtime_sync' | 'auth';
type BootstrapPhase = 'tenant_config' | 'retrying_tenant_config' | 'theme' | 'runtime_sync' | 'auth' | 'ready';

export interface BootstrapStatus {
  phase: BootstrapPhase;
  message: string;
  attempt?: number;
  nextRetryInMs?: number;
  error?: string;
}

interface BootstrapOptions {
  onStatusChange?: (status: BootstrapStatus) => void;
}

const recordBootstrapError = (step: BootstrapStep, error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  log.config.error(`Bootstrap step failed: ${step}`, error);
  recordAppEvent('bootstrap_error', { step, error: message });
};

const applyBaseRuntimeConfig = (apiBaseUrl: string, accountId: string) => {
  setRuntimeConfig({
    api: {
      url: apiBaseUrl,
      accountId,
      accountSlug: '',
      channel: 'ecommerce',
      extraHeaders: {},
    },
  });
};

export const bootstrapApplication = async (options: BootstrapOptions = {}) => {
  installGlobalErrorHandlers();

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.cumar.com.ar';
  const accountId = import.meta.env.VITE_ACCOUNT_ID || '';

  if (!accountId) {
    throw new Error('Falta VITE_ACCOUNT_ID para resolver ecommerce-config');
  }

  applyBaseRuntimeConfig(apiBaseUrl, accountId);

  options.onStatusChange?.({
    phase: 'tenant_config',
    message: 'Cargando configuracion del tenant...',
  });

  try {
    const tenantConfig = await waitForTenantConfig(apiBaseUrl, accountId, {
      onRetry: (state: TenantConfigRetryState) => {
        const statusDetails = state.status ? ` (HTTP ${state.status})` : '';
        options.onStatusChange?.({
          phase: 'retrying_tenant_config',
          message: `No se pudo obtener ecommerce-config${statusDetails}. Reintentando...`,
          attempt: state.attempt,
          nextRetryInMs: state.nextRetryInMs,
          error: state.error,
        });
      },
    });

    setRuntimeConfig({
      ...tenantConfig,
      api: {
        url: apiBaseUrl,
        accountId,
        accountSlug: tenantConfig.api?.accountSlug || '',
        channel: tenantConfig.api?.channel || 'ecommerce',
        extraHeaders: tenantConfig.api?.extraHeaders || {},
      },
    });
  } catch (error) {
    recordBootstrapError('tenant_config', error);
    throw error;
  }

  try {
    options.onStatusChange?.({
      phase: 'theme',
      message: 'Aplicando tema del tenant...',
    });
    initializeTheme();
  } catch (error) {
    recordBootstrapError('theme', error);
  }

  try {
    options.onStatusChange?.({
      phase: 'runtime_sync',
      message: 'Sincronizando configuracion runtime...',
    });
    useStore.getState().syncRuntimeConfig();
  } catch (error) {
    recordBootstrapError('runtime_sync', error);
  }

  try {
    options.onStatusChange?.({
      phase: 'auth',
      message: 'Inicializando sesion...',
    });
    initializeAuth();
  } catch (error) {
    recordBootstrapError('auth', error);
  }

  options.onStatusChange?.({
    phase: 'ready',
    message: 'Aplicacion lista.',
  });
};
