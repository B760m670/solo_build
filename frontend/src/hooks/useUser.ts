import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { User } from '@unisouq/shared';

export type CurrentUser = User & { isAdmin?: boolean };

export function useUser(enabled: boolean = true) {
  return useQuery<CurrentUser>({
    queryKey: ['user', 'me'],
    queryFn: () => api.get<CurrentUser>('/users/me'),
    staleTime: 30_000,
    enabled,
  });
}

export interface UpdateSettingsInput {
  language?: string;
  theme?: string;
  tonAddress?: string | null;
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => api.patch<User>('/users/me', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}
