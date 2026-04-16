import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Gift, Theme, PlusPlan, ReputationTier, WithdrawalRequest } from '@unisouq/shared';

// ─── Dashboard ───

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

// ─── Withdrawals ───

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

// ─── Gifts CRUD ───

export function useAdminCreateGift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      imageUrl: string;
      rarity: string;
      priceStars?: number;
      priceTon?: number;
      editionSize?: number;
    }) => api.post<Gift>('/admin/gifts', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['gifts'] });
    },
  });
}

export function useAdminUpdateGift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; description?: string; imageUrl?: string; priceStars?: number; priceTon?: number; isActive?: boolean }) =>
      api.patch<Gift>(`/admin/gifts/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['gifts'] });
    },
  });
}

export function useAdminRetireGift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<Gift>(`/admin/gifts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['gifts'] });
    },
  });
}

// ─── Themes CRUD ───

export function useAdminCreateTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      palette: Record<string, string>;
      description?: string;
      previewUrl?: string;
      priceStars?: number;
      priceTon?: number;
      plusOnly?: boolean;
    }) => api.post<Theme>('/admin/themes', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['themes'] });
    },
  });
}

export function useAdminUpdateTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; priceStars?: number; priceTon?: number; plusOnly?: boolean; isActive?: boolean }) =>
      api.patch<Theme>(`/admin/themes/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['themes'] });
    },
  });
}

export function useAdminRetireTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<Theme>(`/admin/themes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['themes'] });
    },
  });
}

// ─── Plus Plans CRUD ───

export function useAdminCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      durationDays: number;
      priceStars?: number;
      priceTon?: number;
      priceFiat?: number;
    }) => api.post<PlusPlan>('/admin/plus/plans', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['plus'] });
    },
  });
}

export function useAdminUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; durationDays?: number; priceStars?: number; priceTon?: number; priceFiat?: number; isActive?: boolean }) =>
      api.patch<PlusPlan>(`/admin/plus/plans/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['plus'] });
    },
  });
}

export function useAdminRetirePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<PlusPlan>(`/admin/plus/plans/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['plus'] });
    },
  });
}
