import { httpClient } from './httpClient';
import { API_ENDPOINTS, getActiveAccountId } from '@/config/api';
import type { CapacitacionBlock } from '@/utils/capacitacionEmbeds';
import type { ProviderTask, TaskStatus } from './taskService';

export interface CapacitacionProvider {
  user_id: string;
  email: string;
  name: string;
  partner_id?: string | null;
  partner_name?: string | null;
}

export interface CapacitacionCreateInput {
  title: string;
  description?: string;
  due_at?: string | null;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  content_blocks: CapacitacionBlock[];
  assigned_to_user_ids?: string[];
  assign_to_all_suppliers?: boolean;
}

const unwrapList = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data as T[];
  }
  return [];
};

const unwrapOne = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export const isPlatformManagerRole = (role: string | undefined | null): boolean => {
  const value = (role || '').toLowerCase();
  return value === 'admin' || value === 'sysadmin' || value === 'operator' || value === 'owner';
};

export const capacitacionService = {
  async list(params?: { status?: string }): Promise<ProviderTask[]> {
    const accountId = getActiveAccountId();
    const response = await httpClient.get<unknown>(API_ENDPOINTS.CAPACITACIONES(accountId), {
      params: {
        per_page: 100,
        status: params?.status,
      },
    });
    return unwrapList<ProviderTask>(response);
  },

  async listProviders(): Promise<CapacitacionProvider[]> {
    const accountId = getActiveAccountId();
    const response = await httpClient.get<unknown>(API_ENDPOINTS.CAPACITACION_PROVIDERS(accountId));
    return unwrapList<CapacitacionProvider>(response);
  },

  async create(input: CapacitacionCreateInput): Promise<ProviderTask[]> {
    const accountId = getActiveAccountId();
    const response = await httpClient.post<unknown>(API_ENDPOINTS.CAPACITACIONES(accountId), input);
    return unwrapList<ProviderTask>(response);
  },

  async updateStatus(id: string, status: TaskStatus): Promise<ProviderTask> {
    const accountId = getActiveAccountId();
    const response = await httpClient.patch<unknown>(API_ENDPOINTS.CAPACITACION(accountId, id), {
      status,
    });
    return unwrapOne<ProviderTask>(response);
  },
};
