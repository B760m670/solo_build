import {
  Body,
  Controller,
  ForbiddenException,
  Headers,
  Logger,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';

// Minimal shapes of the Telegram Update fields we care about.
interface TgUpdate {
  update_id: number;
  message?: TgMessage;
  pre_checkout_query?: TgPreCheckoutQuery;
}

interface TgMessage {
  message_id: number;
  from?: { id: number };
  chat: { id: number };
  text?: string;
  successful_payment?: {
    currency: string;
    total_amount: number;
    invoice_payload: string;
    telegram_payment_charge_id: string;
    provider_payment_charge_id: string;
  };
}

interface TgPreCheckoutQuery {
  id: string;
  from: { id: number };
  currency: string;
  total_amount: number;
  invoice_payload: string;
}

@Controller('telegram')
export class TelegramWebhookController {
  private readonly logger = new Logger(TelegramWebhookController.name);
  private readonly secret: string;
  private readonly webappUrl: string;

  constructor(
    config: ConfigService,
    private telegram: TelegramService,
  ) {
    this.secret = config.get<string>('BOT_WEBHOOK_SECRET') ?? '';
    this.webappUrl = config.get<string>('WEBAPP_URL') ?? '';
  }

  @Post('webhook')
  async webhook(
    @Headers('x-telegram-bot-api-secret-token') secretHeader: string | undefined,
    @Body() update: TgUpdate,
  ) {
    if (!this.secret || secretHeader !== this.secret) {
      throw new ForbiddenException('Invalid webhook secret');
    }

    try {
      if (update.pre_checkout_query) {
        await this.handlePreCheckout(update.pre_checkout_query);
      } else if (update.message?.successful_payment) {
        await this.handleSuccessfulPayment(update.message);
      } else if (update.message?.text) {
        await this.handleCommand(update.message);
      }
    } catch (e) {
      // Always 200 OK back to Telegram — we don't want retry storms on bad updates.
      this.logger.error(`Webhook handler error: ${(e as Error).message}`);
    }
    return { ok: true };
  }

  private async handlePreCheckout(q: TgPreCheckoutQuery) {
    if (q.currency !== 'XTR') {
      await this.telegram.answerPreCheckoutQuery(q.id, false, 'Unsupported currency');
      return;
    }
    try {
      await this.telegram.answerPreCheckoutQuery(q.id, true);
    } catch (e) {
      this.logger.error(`answerPreCheckoutQuery failed: ${(e as Error).message}`);
    }
  }

  private async handleSuccessfulPayment(msg: TgMessage) {
    const sp = msg.successful_payment!;
    if (sp.currency !== 'XTR') return;
    // Purchase fulfillment is pending rebuild on the new schema (Gifts/Themes/Plus/Boost).
    // For now we just log — the purchase modules will pick this up by invoice_payload.
    this.logger.log(
      `Received successful_payment payload=${sp.invoice_payload} charge=${sp.telegram_payment_charge_id}`,
    );
  }

  private async handleCommand(msg: TgMessage) {
    const text = msg.text?.trim() ?? '';
    if (!text.startsWith('/')) return;
    const cmd = text.split(/\s+/)[0].split('@')[0];

    if (cmd === '/start') {
      const button = this.webappUrl ? `\n\nOpen: ${this.webappUrl}` : '';
      await this.telegram.sendMessage(
        msg.chat.id,
        `<b>Unisouq</b> — the creative Web3 studio inside Telegram.\n\nCrypto, AI tools, games, social, NFT gifts — all in one place.${button}`,
      );
      return;
    }

    if (cmd === '/help') {
      await this.telegram.sendMessage(
        msg.chat.id,
        '<b>Commands</b>\n/start — open the app\n/help — this message\n\nPayments use Telegram Stars. Not financial advice.',
      );
      return;
    }
  }
}
