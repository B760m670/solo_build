import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface LabeledPrice {
  label: string;
  amount: number;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly token: string;
  private readonly apiBase: string;

  constructor(private config: ConfigService) {
    this.token = this.config.get<string>('TELEGRAM_BOT_TOKEN') ?? '';
    this.apiBase = `https://api.telegram.org/bot${this.token}`;
    if (!this.token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not set — Telegram calls will fail');
    }
  }

  private async call<T>(method: string, body: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${this.apiBase}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { ok: boolean; result?: T; description?: string };
    if (!json.ok) {
      this.logger.error(`Telegram ${method} failed: ${json.description}`);
      throw new Error(`Telegram API error: ${json.description}`);
    }
    return json.result as T;
  }

  /**
   * Create a Telegram Stars invoice link. Currency is XTR, amounts are integer Stars.
   * https://core.telegram.org/bots/api#createinvoicelink
   */
  async createStarsInvoiceLink(params: {
    title: string;
    description: string;
    payload: string;
    priceStars: number;
  }): Promise<string> {
    const prices: LabeledPrice[] = [{ label: params.title, amount: params.priceStars }];
    return this.call<string>('createInvoiceLink', {
      title: params.title.slice(0, 32),
      description: params.description.slice(0, 255),
      payload: params.payload,
      provider_token: '',
      currency: 'XTR',
      prices,
    });
  }

  /**
   * Refund a Telegram Stars payment. telegramChargeId comes from
   * successful_payment.telegram_payment_charge_id.
   * https://core.telegram.org/bots/api#refundstarpayment
   */
  async refundStarPayment(telegramUserId: number | bigint, telegramChargeId: string): Promise<void> {
    await this.call('refundStarPayment', {
      user_id: Number(telegramUserId),
      telegram_payment_charge_id: telegramChargeId,
    });
  }

  async answerPreCheckoutQuery(queryId: string, ok: boolean, errorMessage?: string): Promise<void> {
    await this.call('answerPreCheckoutQuery', {
      pre_checkout_query_id: queryId,
      ok,
      ...(errorMessage ? { error_message: errorMessage } : {}),
    });
  }

  async sendMessage(chatId: number | bigint, text: string): Promise<void> {
    try {
      await this.call('sendMessage', {
        chat_id: Number(chatId),
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });
    } catch (e) {
      // Never let a notification failure break a business flow
      this.logger.warn(`sendMessage failed: ${(e as Error).message}`);
    }
  }

  async setWebhook(url: string, secretToken: string): Promise<void> {
    await this.call('setWebhook', {
      url,
      secret_token: secretToken,
      allowed_updates: ['message', 'pre_checkout_query'],
      drop_pending_updates: true,
    });
  }
}
