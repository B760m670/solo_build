import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mnemonicToPrivateKey } from '@ton/crypto';
import {
  Address,
  internal,
  TonClient,
  WalletContractV4,
  toNano,
  fromNano,
  SendMode,
} from '@ton/ton';

/**
 * Platform TON wallet wrapper. Uses a mnemonic-backed WalletContractV4 to
 * sign and broadcast transfers. Read-only methods fall back to TonClient.
 */
@Injectable()
export class TonService {
  private readonly logger = new Logger(TonService.name);
  private clientPromise: Promise<TonClient> | null = null;
  private walletPromise: Promise<{
    wallet: WalletContractV4;
    keyPair: Awaited<ReturnType<typeof mnemonicToPrivateKey>>;
  }> | null = null;

  constructor(private config: ConfigService) {}

  private async client(): Promise<TonClient> {
    if (!this.clientPromise) {
      const endpoint =
        this.config.get<string>('TON_ENDPOINT') ??
        'https://toncenter.com/api/v2/jsonRPC';
      const apiKey = this.config.get<string>('TON_API_KEY');
      this.clientPromise = Promise.resolve(
        new TonClient({ endpoint, apiKey: apiKey || undefined }),
      );
    }
    return this.clientPromise;
  }

  private async wallet() {
    if (!this.walletPromise) {
      const mnemonic = this.config.get<string>('PLATFORM_TON_MNEMONIC');
      if (!mnemonic) {
        throw new ServiceUnavailableException('PLATFORM_TON_MNEMONIC not configured');
      }
      this.walletPromise = (async () => {
        const keyPair = await mnemonicToPrivateKey(mnemonic.trim().split(/\s+/));
        const wallet = WalletContractV4.create({
          workchain: 0,
          publicKey: keyPair.publicKey,
        });
        return { wallet, keyPair };
      })();
    }
    return this.walletPromise;
  }

  async platformAddress(): Promise<string> {
    const { wallet } = await this.wallet();
    return wallet.address.toString({ bounceable: false });
  }

  async getBalanceTon(address?: string): Promise<number> {
    const client = await this.client();
    const addr = address
      ? Address.parse(address)
      : (await this.wallet()).wallet.address;
    const balance = await client.getBalance(addr);
    return Number(fromNano(balance));
  }

  /**
   * Send TON from the platform wallet to `destination`. Returns the transfer
   * seqno the wallet signed with — not a tx hash, but enough to trace.
   * Throws if the destination is invalid or the wallet has insufficient funds.
   */
  async sendTon(params: {
    destination: string;
    amountTon: number;
    comment?: string;
  }): Promise<{ seqno: number }> {
    if (params.amountTon <= 0) {
      throw new Error('amountTon must be > 0');
    }
    const destAddress = Address.parse(params.destination);
    const client = await this.client();
    const { wallet, keyPair } = await this.wallet();
    const contract = client.open(wallet);

    const seqno = await contract.getSeqno();
    await contract.sendTransfer({
      seqno,
      secretKey: keyPair.secretKey,
      sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
      messages: [
        internal({
          to: destAddress,
          value: toNano(params.amountTon.toFixed(9)),
          body: params.comment,
          bounce: false,
        }),
      ],
    });

    this.logger.log(`Sent ${params.amountTon} TON to ${params.destination} seqno=${seqno}`);
    return { seqno };
  }
}
