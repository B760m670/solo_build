import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { openStarsInvoice } from '../lib/telegram';

interface PurchaseResponse {
  purchase: { id: string; invoicePayload: string };
  invoiceLink: string;
}

export type PurchaseStatus = 'paid' | 'cancelled' | 'failed' | 'pending';

async function runPurchase(path: string): Promise<PurchaseStatus> {
  const { invoiceLink } = await api.post<PurchaseResponse>(path);
  return openStarsInvoice(invoiceLink);
}

export function useBoostListing() {
  const qc = useQueryClient();
  return useMutation<PurchaseStatus, Error, string>({
    mutationFn: (listingId) => runPurchase(`/marketplace/listings/${listingId}/boost`),
    onSuccess: (status) => {
      if (status === 'paid') {
        qc.invalidateQueries({ queryKey: ['listings'] });
        qc.invalidateQueries({ queryKey: ['listing'] });
      }
    },
  });
}

export function usePurchasePremium() {
  const qc = useQueryClient();
  return useMutation<PurchaseStatus, Error, void>({
    mutationFn: () => runPurchase('/wallet/premium'),
    onSuccess: (status) => {
      if (status === 'paid') {
        qc.invalidateQueries({ queryKey: ['user', 'me'] });
        qc.invalidateQueries({ queryKey: ['wallet'] });
      }
    },
  });
}
