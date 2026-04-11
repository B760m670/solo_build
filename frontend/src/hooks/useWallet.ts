import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getAuthToken } from '../lib/api';
import type { PaginatedResponse, Transaction } from '@brabble/shared';

interface WalletData {
  balance: number;
  totalEarned: number;
  tonWallet: string | null;
  recentTransactions: Transaction[];
}

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => api.get<WalletData>('/wallet'),
    enabled: !!getAuthToken(),
  });
}

export function useTransactions(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['transactions', page, limit],
    queryFn: () =>
      api.get<PaginatedResponse<Transaction>>(
        `/wallet/transactions?page=${page}&limit=${limit}`,
      ),
  });
}

export function useConnectWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tonAddress: string) =>
      api.post<{ tonWallet: string }>('/wallet/connect', { tonAddress }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useDisconnectWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete<{ tonWallet: null }>('/wallet/connect'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useWithdraw() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { tonAddress: string; amount: number }) =>
      api.post<{ netAmount: number; fee: number; status: string; txId: string }>(
        '/wallet/withdraw',
        data,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
