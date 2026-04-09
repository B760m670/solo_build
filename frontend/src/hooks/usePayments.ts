import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface InvoiceResult {
  type: string;
  stars: number;
  invoiceUrl: string | null;
  error?: string;
}

export function useCreateInvoice() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (type: 'PREMIUM_MONTHLY' | 'PREMIUM_YEARLY') =>
      api.post<InvoiceResult>('/payments/invoice', { type }),
    onSuccess: (data) => {
      if (data.invoiceUrl) {
        // Open Telegram Stars payment via WebApp
        const tg = window.Telegram?.WebApp;
        if (tg && 'openInvoice' in tg) {
          (tg as Record<string, (url: string, cb: (status: string) => void) => void>)
            .openInvoice(data.invoiceUrl, (status: string) => {
              if (status === 'paid') {
                qc.invalidateQueries({ queryKey: ['user'] });
                qc.invalidateQueries({ queryKey: ['wallet'] });
              }
            });
        } else {
          // Fallback: open in browser
          window.open(data.invoiceUrl, '_blank');
        }
      }
    },
  });
}
