import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getAuthToken } from '../lib/api';
import type { ReferralInfo } from '@brabble/shared';

export function useReferrals() {
  return useQuery({
    queryKey: ['referrals'],
    queryFn: () => api.get<ReferralInfo>('/referrals'),
    enabled: !!getAuthToken(),
  });
}

export function useClaimReferralBonus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<{ bonus: number; referrerId: string }>('/referrals/bonus'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['referrals'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
