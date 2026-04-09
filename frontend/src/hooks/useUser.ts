import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { User } from '@brabble/shared';

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => api.get<User>('/users/me'),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { theme?: string; language?: string; tonWallet?: string }) =>
      api.patch<User>('/users/me', data),
    onSuccess: (updatedUser) => {
      qc.setQueryData(['user'], updatedUser);
    },
  });
}
