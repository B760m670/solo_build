import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { openStarsInvoice } from '../lib/telegram';
import type { Order, OrderStatus, PlaceOrderResponse } from '@unisouq/shared';

export type OrderRole = 'buyer' | 'seller' | 'all';

export function useMyOrders(role: OrderRole = 'all', status?: OrderStatus) {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  if (status) params.set('status', status);
  return useQuery<Order[]>({
    queryKey: ['orders', role, status],
    queryFn: () => api.get<Order[]>(`/orders?${params.toString()}`),
  });
}

function useOrderAction<T>(pathFor: (id: string) => string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: T }) =>
      api.post<Order>(pathFor(id), body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

export type PlaceOrderResult =
  | { status: 'paid'; order: Order }
  | { status: 'cancelled' | 'failed' | 'pending'; order: Order };

/**
 * Create a PENDING order → open Telegram Stars invoice → resolve with
 * terminal status reported by Telegram. The bot webhook flips the order
 * to PAID server-side; we invalidate caches on `paid`.
 */
export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation<PlaceOrderResult, Error, string>({
    mutationFn: async (listingId: string) => {
      const { order, invoiceLink } = await api.post<PlaceOrderResponse>('/orders', {
        listingId,
      });
      const status = await openStarsInvoice(invoiceLink);
      return { status, order };
    },
    onSuccess: (result) => {
      if (result.status === 'paid') {
        qc.invalidateQueries({ queryKey: ['orders'] });
        qc.invalidateQueries({ queryKey: ['wallet'] });
        qc.invalidateQueries({ queryKey: ['user', 'me'] });
      }
    },
  });
}

export function useAcceptOrder() {
  return useOrderAction<void>((id) => `/orders/${id}/accept`);
}

export function useDeliverOrder() {
  return useOrderAction<{ deliverable: string }>((id) => `/orders/${id}/deliver`);
}

export function useCompleteOrder() {
  return useOrderAction<void>((id) => `/orders/${id}/complete`);
}

export function useDisputeOrder() {
  return useOrderAction<{ reason: string }>((id) => `/orders/${id}/dispute`);
}

export function useCancelOrder() {
  return useOrderAction<{ reason?: string }>((id) => `/orders/${id}/cancel`);
}
