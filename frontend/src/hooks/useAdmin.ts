import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ReputationTier, WithdrawalRequest } from '@unisouq/shared';

export interface AdminDashboard {
  users: {
    total: number;
    recentSignups: number;
    tiers: Record<ReputationTier, number>;
    activePlus: number;
  };
  gifts: { total: number; active: number };
  themes: { active: number };
  social: { posts: number };
  withdrawals: { pending: number };
}

export function useAdminDashboard() {
  return useQuery<AdminDashboard>({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get<AdminDashboard>('/admin/dashboard'),
  });
}

export function useAdminPendingWithdrawals() {
  return useQuery<WithdrawalRequest[]>({
    queryKey: ['admin', 'withdrawals', 'pending'],
    queryFn: () => api.get<WithdrawalRequest[]>('/admin/withdrawals/pending'),
  });
}

export function useAdminProcessWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<WithdrawalRequest>(`/admin/withdrawals/${id}/process`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}
