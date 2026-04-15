import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Listing, ListingCategory } from '@unisouq/shared';

interface ListQuery {
  category?: ListingCategory;
  search?: string;
}

export function useListings(q: ListQuery = {}) {
  const params = new URLSearchParams();
  if (q.category) params.set('category', q.category);
  if (q.search) params.set('search', q.search);
  const qs = params.toString();
  return useQuery<Listing[]>({
    queryKey: ['listings', q],
    queryFn: () => api.get<Listing[]>(`/marketplace/listings${qs ? `?${qs}` : ''}`),
  });
}

export function useListing(id: string | null) {
  return useQuery<Listing>({
    queryKey: ['listing', id],
    queryFn: () => api.get<Listing>(`/marketplace/listings/${id}`),
    enabled: !!id,
  });
}

export function useMyListings() {
  return useQuery<Listing[]>({
    queryKey: ['listings', 'mine'],
    queryFn: () => api.get<Listing[]>('/marketplace/listings/mine'),
  });
}

export interface CreateListingInput {
  title: string;
  description: string;
  category: ListingCategory;
  priceStars: number;
  deliveryDays: number;
  coverImage?: string;
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateListingInput) => api.post<Listing>('/marketplace/listings', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/marketplace/listings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
