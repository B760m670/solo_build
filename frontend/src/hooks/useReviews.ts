import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Review } from '@unisouq/shared';

export interface CreateReviewInput {
  orderId: string;
  rating: number;
  comment?: string;
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) => api.post<Review>('/reviews', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}
