import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Transaction, WalletInfo, WithdrawalRequest } from '@unisouq/shared';

export function useWallet() {
  return useQuery<WalletInfo>({
    queryKey: ['wallet'],
    queryFn: () => api.get<WalletInfo>('/wallet'),
  });
}

export function useTransactions(limit = 50) {
  return useQuery<Transaction[]>({
    queryKey: ['wallet', 'transactions', limit],
    queryFn: () => api.get<Transaction[]>(`/wallet/transactions?limit=${limit}`),
  });
}

export interface WithdrawTonInput {
  tonAddress: string;
  amount: number;
  idempotencyKey?: string;
}

export function useWithdrawTon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WithdrawTonInput) =>
      api.post<WithdrawalRequest>('/wallet/withdraw/ton', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}
