import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export function useNotifications() {
  return useQuery<AppNotification[]>({
    queryKey: ['notifications'],
    queryFn: () => api.get<AppNotification[]>('/notifications'),
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  });
}

export function useUnreadCount() {
  return useQuery<{ count: number }>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.get<{ count: number }>('/notifications/unread-count'),
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ ok: true }>('/notifications/read-all'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
