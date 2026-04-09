import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Listing, Order } from '@brabble/shared';

export function useListings(search?: string, category?: string) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category && category !== 'All') params.set('category', category);
  const qs = params.toString();

  return useQuery({
    queryKey: ['listings', search, category],
    queryFn: () =>
      api.get<Listing[]>(`/marketplace/listings${qs ? `?${qs}` : ''}`),
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listings', id],
    queryFn: () => api.get<Listing>(`/marketplace/listings/${id}`),
    enabled: !!id,
  });
}

export function useMyListings() {
  return useQuery({
    queryKey: ['myListings'],
    queryFn: () => api.get<Listing[]>('/marketplace/listings/my'),
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      price: number;
      category: string;
      images: string[];
    }) => api.post<Listing>('/marketplace/listings', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
      qc.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
}

export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      description?: string;
      price?: number;
      category?: string;
      images?: string[];
    }) => api.patch<Listing>(`/marketplace/listings/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
      qc.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<void>(`/marketplace/listings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
      qc.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
}

export function useBuyListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<Order>(`/marketplace/listings/${id}/buy`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
