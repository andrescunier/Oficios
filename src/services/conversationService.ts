import { httpClient } from './httpClient';
import { API_ENDPOINTS, getActiveAccountId } from '@/config/api';

export type ConversationStatus = 'open' | 'paused' | 'closed' | 'locked' | string;
export type MessageSenderType = 'customer' | 'supplier' | 'platform' | 'system' | string;

export interface Conversation {
  id: string;
  account_id: string;
  sales_order_id: string;
  customer_partner_id: string;
  supplier_partner_id: string;
  status: ConversationStatus;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  closed_at?: string | null;
}

export interface ConversationMessage {
  id: string;
  account_id: string;
  conversation_id: string;
  sender_type: MessageSenderType;
  sender_user_id?: string | null;
  body: string;
  visibility: 'all' | 'platform_only' | string;
  is_flagged?: boolean;
  is_hidden?: boolean;
  moderation_reason?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

const unwrap = <T>(payload: unknown): T | null => {
  if (!payload || typeof payload !== 'object') return null;
  if ('data' in payload) return (payload as { data: T }).data ?? null;
  return payload as T;
};

export const conversationService = {
  async fromOrder(orderId: string): Promise<Conversation> {
    const accountId = getActiveAccountId();
    const response = await httpClient.post(
      API_ENDPOINTS.CONVERSATION_FROM_ORDER(accountId, orderId),
      {},
    );
    const data = unwrap<Conversation>(response.data);
    if (!data?.id) throw new Error('No se pudo abrir el chat de la reserva');
    return data;
  },

  async listMessages(conversationId: string, after?: string): Promise<ConversationMessage[]> {
    const accountId = getActiveAccountId();
    const response = await httpClient.get(
      API_ENDPOINTS.CONVERSATION_MESSAGES(accountId, conversationId),
      { params: after ? { after } : undefined },
    );
    const data = unwrap<ConversationMessage[]>(response.data);
    return Array.isArray(data) ? data : [];
  },

  async sendMessage(conversationId: string, body: string): Promise<ConversationMessage> {
    const accountId = getActiveAccountId();
    const response = await httpClient.post(
      API_ENDPOINTS.CONVERSATION_MESSAGES(accountId, conversationId),
      { body },
    );
    const data = unwrap<ConversationMessage>(response.data);
    if (!data?.id) throw new Error('No se pudo enviar el mensaje');
    return data;
  },

  async close(conversationId: string, reason?: string): Promise<Conversation> {
    const accountId = getActiveAccountId();
    const response = await httpClient.post(
      API_ENDPOINTS.CONVERSATION_CLOSE(accountId, conversationId),
      { reason },
    );
    const data = unwrap<Conversation>(response.data);
    if (!data?.id) throw new Error('No se pudo cerrar el chat');
    return data;
  },
};
