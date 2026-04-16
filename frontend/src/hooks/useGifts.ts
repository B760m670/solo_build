import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Currency, Gift, UserGift } from '@unisouq/shared';

export function useGiftCatalog() {
  return useQuery<Gift[]>({
    queryKey: ['gifts', 'catalog'],
    queryFn: () => api.get<Gift[]>('/gifts'),
  });
}

export function useMyGifts() {
  return useQuery<UserGift[]>({
    queryKey: ['gifts', 'mine'],
    queryFn: () => api.get<UserGift[]>('/gifts/mine'),
  });
}

export function useBuyGift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ giftId, currency }: { giftId: string; currency: Currency }) =>
      api.post<UserGift>(`/gifts/${giftId}/buy`, { currency }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gifts'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
