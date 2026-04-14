import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useInspectTonAddress() {
  return useMutation({
    mutationFn: (address: string) =>
      api.post<{
        address: string;
        isValid: boolean;
        format: 'RAW' | 'USER_FRIENDLY' | 'UNKNOWN';
        workchain: string | null;
        platformWalletConfigured: boolean;
        warnings: string[];
        recommendations: string[];
      }>('/services/ton/address-inspect', { address }),
  });
}

export function useDecodeTonTransaction() {
  return useMutation({
    mutationFn: (txRef: string) =>
      api.post<{
        input: string;
        txHash: string;
        hashFormat: 'HEX_64' | 'BASE64URL' | 'UNKNOWN';
        isHashValid: boolean;
        explorerLinks: { tonviewer: string; tonscan: string; dton: string };
        safetyChecklist: string[];
      }>('/services/ton/tx-decode', { txRef }),
  });
}
