import React, { useEffect, useRef, useState } from 'react';
import { Loader2, MessageCircle, Send, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  conversationService,
  type Conversation,
  type ConversationMessage,
} from '@/services/conversationService';

interface MediationChatProps {
  orderId: string;
  viewerRole: 'customer' | 'supplier';
  enabled: boolean;
  className?: string;
}

const senderLabel = (type: string, viewerRole: string): string => {
  if (type === 'system') return 'OficiosHub';
  if (type === 'platform') return 'OficiosHub (soporte)';
  if (type === 'customer') return viewerRole === 'customer' ? 'Vos' : 'Cliente';
  if (type === 'supplier') return viewerRole === 'supplier' ? 'Vos' : 'Proveedor';
  return type;
};

export const MediationChat: React.FC<MediationChatProps> = ({
  orderId,
  viewerRole,
  enabled,
  className = '',
}) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    if (!enabled || !orderId) return;
    try {
      setLoading(true);
      setError(null);
      const conv = await conversationService.fromOrder(orderId);
      setConversation(conv);
      const list = await conversationService.listMessages(conv.id);
      setMessages(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo abrir el chat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, enabled]);

  useEffect(() => {
    if (!conversation?.id || conversation.status !== 'open') return;
    const timer = window.setInterval(async () => {
      try {
        const list = await conversationService.listMessages(conversation.id);
        setMessages(list);
      } catch {
        /* ignore polling errors */
      }
    }, 4000);
    return () => window.clearInterval(timer);
  }, [conversation?.id, conversation?.status]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!conversation?.id || !draft.trim() || sending) return;
    try {
      setSending(true);
      setError(null);
      await conversationService.sendMessage(conversation.id, draft.trim());
      setDraft('');
      const list = await conversationService.listMessages(conversation.id);
      setMessages(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar');
    } finally {
      setSending(false);
    }
  };

  if (!enabled) {
    return (
      <div className={`rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground ${className}`}>
        <p className="flex items-center gap-2 font-medium text-foreground">
          <MessageCircle className="h-4 w-4" />
          Chat de la reserva
        </p>
        <p className="mt-1">
          Se habilita cuando el proveedor acepta la reserva. Todo pasa por OficiosHub: sin contacto directo.
        </p>
      </div>
    );
  }

  const locked = conversation?.status === 'closed' || conversation?.status === 'locked';

  return (
    <div className={`rounded-lg border bg-white ${className}`}>
      <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="flex items-center gap-2 font-semibold">
            <MessageCircle className="h-4 w-4" />
            Chat intermediado
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            OficiosHub lee y modera este hilo. No compartas teléfono ni WhatsApp.
          </p>
        </div>
        {conversation?.status && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
            {conversation.status}
          </span>
        )}
      </div>

      <div className="flex max-h-80 min-h-[220px] flex-col">
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Abriendo chat…
            </div>
          )}
          {!loading && messages.length === 0 && (
            <p className="text-sm text-muted-foreground">Todavía no hay mensajes.</p>
          )}
          {messages.map((message) => {
            const mine =
              (viewerRole === 'customer' && message.sender_type === 'customer')
              || (viewerRole === 'supplier' && message.sender_type === 'supplier');
            const system = message.sender_type === 'system' || message.sender_type === 'platform';
            return (
              <div
                key={message.id}
                className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                  system
                    ? 'mx-auto bg-amber-50 text-amber-950'
                    : mine
                      ? 'ml-auto bg-primary text-primary-foreground'
                      : 'mr-auto bg-muted'
                }`}
              >
                <p className={`mb-1 text-[10px] uppercase tracking-wide ${mine && !system ? 'opacity-80' : 'text-muted-foreground'}`}>
                  {senderLabel(message.sender_type, viewerRole)}
                  {message.is_flagged ? ' · revisión' : ''}
                </p>
                <p className="whitespace-pre-wrap break-words">{message.body}</p>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="border-t px-4 py-3">
          {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
          {locked ? (
            <p className="text-sm text-muted-foreground">Este chat está cerrado.</p>
          ) : (
            <div className="flex gap-2">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Escribí tu mensaje (sin datos de contacto)…"
                className="min-h-[72px] resize-none"
                maxLength={4000}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
              />
              <Button
                type="button"
                className="shrink-0 self-end"
                disabled={sending || !draft.trim()}
                onClick={() => void handleSend()}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediationChat;
