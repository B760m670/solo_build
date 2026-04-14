import { Injectable } from '@nestjs/common';
import { TonService } from '../wallet/ton.service';

function extractTxHash(input: string): string {
  const trimmed = input.trim();
  const tonviewerMatch = trimmed.match(/transaction\/([A-Za-z0-9_-]{20,128})/i);
  if (tonviewerMatch?.[1]) return tonviewerMatch[1];
  const hashOnlyMatch = trimmed.match(/^([A-Fa-f0-9]{64}|[A-Za-z0-9_-]{43,88})$/);
  if (hashOnlyMatch?.[1]) return hashOnlyMatch[1];
  return trimmed;
}

@Injectable()
export class ServicesService {
  constructor(private tonService: TonService) {}

  inspectTonAddress(address: string) {
    const normalized = address.trim();
    const isValid = this.tonService.validateAddress(normalized);
    const isRaw = /^-?\d+:[0-9a-fA-F]{64}$/.test(normalized);
    const isUserFriendly = /^[EU]Q[A-Za-z0-9_-]{46}$/.test(normalized);
    const workchain = isRaw ? normalized.split(':')[0] : null;
    const warnings: string[] = [];

    if (!isValid) {
      warnings.push('Address format is invalid');
    } else if (isUserFriendly && normalized.startsWith('UQ')) {
      warnings.push('Non-bounceable format detected (UQ...)');
    }

    return {
      address: normalized,
      isValid,
      format: isRaw ? 'RAW' : isUserFriendly ? 'USER_FRIENDLY' : 'UNKNOWN',
      workchain,
      platformWalletConfigured: !!this.tonService.getPlatformWallet(),
      warnings,
      recommendations: [
        'Always verify full address before transfer',
        'For large amounts, send a small test transfer first',
      ],
    };
  }

  decodeTonTransaction(txRef: string) {
    const txHash = extractTxHash(txRef);
    const isHexHash = /^[A-Fa-f0-9]{64}$/.test(txHash);
    const isBase64UrlHash = /^[A-Za-z0-9_-]{43,88}$/.test(txHash);

    return {
      input: txRef.trim(),
      txHash,
      hashFormat: isHexHash ? 'HEX_64' : isBase64UrlHash ? 'BASE64URL' : 'UNKNOWN',
      isHashValid: isHexHash || isBase64UrlHash,
      explorerLinks: {
        tonviewer: `https://tonviewer.com/transaction/${txHash}`,
        tonscan: `https://tonscan.org/tx/${txHash}`,
        dton: `https://dton.io/tx/${txHash}`,
      },
      safetyChecklist: [
        'Verify sender/receiver addresses in explorer',
        'Check transferred amount and token contract',
        'Avoid unknown token masters and fake jettons',
      ],
    };
  }
}
