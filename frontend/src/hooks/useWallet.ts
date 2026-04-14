import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getAuthToken } from '../lib/api';
import type { PaginatedResponse, Transaction } from '@brabble/shared';

interface WalletData {
  balance: number;
  totalEarned: number;
  tonWallet: string | null;
  recentTransactions: Transaction[];
}

interface WalletPolicy {
  model: string;
  description: string;
  settlementRails: string[];
  sellerCommissionTiers: Array<{ minBrbBalance: number; commissionRate: number }>;
  withdrawal: { minBrb: number; feeRate: number; requiresQueueApproval: boolean };
}

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => api.get<WalletData>('/wallet'),
    enabled: !!getAuthToken(),
  });
}

export function useWalletPolicy() {
  return useQuery({
    queryKey: ['walletPolicy'],
    queryFn: () => api.get<WalletPolicy>('/wallet/policy'),
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
    mutationFn: (data: { tonAddress: string; amount: number; idempotencyKey?: string }) =>
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

export function useSendBrb() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { recipient: string; amount: number; note?: string }) =>
      api.post<{
        amount: number;
        recipient: { id: string; username: string | null; firstName: string };
      }>('/wallet/send', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
