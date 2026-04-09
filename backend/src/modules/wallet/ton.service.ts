import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TonService {
  private readonly logger = new Logger(TonService.name);

  constructor(private config: ConfigService) {}

  /**
   * Validate a TON address format.
   * Supports raw (0:hex) and user-friendly (EQ/UQ base64) formats.
   */
  validateAddress(address: string): boolean {
    // Raw format: 0:64 hex characters
    if (/^-?\d+:[0-9a-fA-F]{64}$/.test(address)) return true;
    // User-friendly base64: starts with EQ or UQ, 48 chars
    if (/^[EU]Q[A-Za-z0-9_-]{46}$/.test(address)) return true;
    return false;
  }

  /**
   * Get the platform wallet address for receiving withdrawals/fees.
   */
  getPlatformWallet(): string | undefined {
    return this.config.get<string>('PLATFORM_TON_WALLET');
  }

  /**
   * Create a withdrawal request.
   * In production, this would queue the withdrawal for manual or automated processing.
   */
  async createWithdrawalRequest(
    userId: string,
    tonAddress: string,
    netAmount: number,
  ): Promise<{ txId: string; status: string }> {
    // In production: integrate with TON SDK to send transaction
    // For now: return a pending transaction ID
    this.logger.log(
      `Withdrawal request: user=${userId}, to=${tonAddress}, amount=${netAmount} BRB`,
    );

    return {
      txId: `wd_${Date.now()}_${userId.slice(0, 8)}`,
      status: 'PENDING',
    };
  }
}
