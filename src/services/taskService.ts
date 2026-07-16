import { httpClient } from './httpClient';
import { API_ENDPOINTS, getActiveAccountId } from '@/config/api';

export type TaskStatus = 'open' | 'in_progress' | 'done' | 'cancelled' | string;

export interface ProviderTask {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: string;
  due_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
  metadata?: Record<string, unknown>;
}

const unwrapList = (payload: unknown): ProviderTask[] => {
  if (Array.isArray(payload)) return payload as ProviderTask[];
  if (payload && typeof payload === 'object') {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data as ProviderTask[];
  }
  return [];
};

export const taskService = {
  async listMine(params?: { project?: string; status?: string }): Promise<ProviderTask[]> {
    const accountId = getActiveAccountId();
    const response = await httpClient.get(API_ENDPOINTS.TASKS_MINE(accountId), {
      params: {
        per_page: 50,
        project: params?.project || 'capacitacion',
        status: params?.status,
      },
    });
    return unwrapList(response.data);
  },

  async updateStatus(taskId: string, status: TaskStatus): Promise<ProviderTask> {
    const accountId = getActiveAccountId();
    const response = await httpClient.patch(API_ENDPOINTS.TASK(accountId, taskId), { status });
    const body = response.data;
    if (body && typeof body === 'object' && 'data' in body) {
      return (body as { data: ProviderTask }).data;
    }
    return body as ProviderTask;
  },
};
