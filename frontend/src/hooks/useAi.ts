import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface AiUsage {
  used: number;
  limit: number | null;
  isPlusActive: boolean;
  remaining: number | null;
}

export interface AiChatSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export interface AiMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AiChatFull {
  id: string;
  title: string;
  messages: AiMessage[];
}

export interface AiSendResult {
  chatId: string;
  reply: string;
}

export function useAiUsage() {
  return useQuery<AiUsage>({
    queryKey: ['ai', 'usage'],
    queryFn: () => api.get<AiUsage>('/ai/usage'),
  });
}

export function useAiChats() {
  return useQuery<AiChatSummary[]>({
    queryKey: ['ai', 'chats'],
    queryFn: () => api.get<AiChatSummary[]>('/ai/chats'),
  });
}

export function useAiChat(chatId: string | null) {
  return useQuery<AiChatFull>({
    queryKey: ['ai', 'chat', chatId],
    queryFn: () => api.get<AiChatFull>(`/ai/chats/${chatId}`),
    enabled: !!chatId,
  });
}

export function useAiSend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ message, chatId }: { message: string; chatId?: string }) =>
      api.post<AiSendResult>('/ai/send', { message, chatId }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['ai', 'chats'] });
      qc.invalidateQueries({ queryKey: ['ai', 'chat', data.chatId] });
      qc.invalidateQueries({ queryKey: ['ai', 'usage'] });
    },
  });
}

export function useAiDeleteChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chatId: string) => api.delete<{ ok: boolean }>(`/ai/chats/${chatId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai', 'chats'] });
      qc.invalidateQueries({ queryKey: ['ai', 'usage'] });
    },
  });
}
