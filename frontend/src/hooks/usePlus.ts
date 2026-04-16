import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Currency, PlusPlan, PlusSubscription } from '@unisouq/shared';

export interface MyPlus {
  activeUntil: string | null;
  current: (PlusSubscription & { plan: PlusPlan }) | null;
}

export function usePlusPlans() {
  return useQuery<PlusPlan[]>({
    queryKey: ['plus', 'plans'],
    queryFn: () => api.get<PlusPlan[]>('/plus/plans'),
  });
}

export function useMyPlus() {
  return useQuery<MyPlus>({
    queryKey: ['plus', 'me'],
    queryFn: () => api.get<MyPlus>('/plus/me'),
  });
}

export function useSubscribePlus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, currency }: { planId: string; currency: Currency }) =>
      api.post<PlusSubscription>('/plus/subscribe', { planId, currency }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plus'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
