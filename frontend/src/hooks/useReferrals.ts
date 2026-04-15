import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ReferralInfo } from '@unisouq/shared';

export function useReferrals() {
  return useQuery<ReferralInfo>({
    queryKey: ['referrals'],
    queryFn: () => api.get<ReferralInfo>('/referrals'),
  });
}
