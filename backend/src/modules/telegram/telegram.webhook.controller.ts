import {
  Body,
  Controller,
  ForbiddenException,
  Headers,
  Logger,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramService } from './telegram.service';
import { TipsService } from '../tips/tips.service';

// Minimal shapes of the Telegram Update fields we care about.
interface TgUpdate {
  update_id: number;
  message?: TgMessage;
  pre_checkout_query?: TgPreCheckoutQuery;
}

interface TgUserRef {
  id: number;
  username?: string;
  first_name?: string;
  is_bot?: boolean;
}

interface TgMessage {
  message_id: number;
  from?: TgUserRef;
  chat: { id: number; type?: string };
  text?: string;
  reply_to_message?: TgMessage;
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
  private readonly botUsername: string;

  constructor(
    config: ConfigService,
    private telegram: TelegramService,
    private prisma: PrismaService,
    private tips: TipsService,
  ) {
    this.secret = config.get<string>('BOT_WEBHOOK_SECRET') ?? '';
    this.webappUrl = config.get<string>('WEBAPP_URL') ?? '';
    this.botUsername = (config.get<string>('BOT_USERNAME') ?? '').replace(/^@/, '');
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
    this.logger.log(
      `Received successful_payment payload=${sp.invoice_payload} charge=${sp.telegram_payment_charge_id}`,
    );
  }

  private async handleCommand(msg: TgMessage) {
    const text = msg.text?.trim() ?? '';
    if (!text.startsWith('/')) return;
    const rawCmd = text.split(/\s+/)[0];
    const cmd = rawCmd.split('@')[0];

    if (cmd === '/start') {
      await this.handleStart(msg);
      return;
    }

    if (cmd === '/help') {
      await this.handleHelp(msg);
      return;
    }

    if (cmd === '/tip') {
      await this.handleTip(msg, text);
      return;
    }
  }

  private async handleStart(msg: TgMessage) {
    const button = this.webappUrl ? `\n\nOpen: ${this.webappUrl}` : '';
    await this.telegram.sendMessage(
      msg.chat.id,
      `<b>Unisouq</b> — send TON tips to anyone on Telegram.\n\n• <code>/tip @user 0.5</code> — tip a user by handle\n• Reply to a message with <code>/tip 0.5</code> — tip that sender\n• Unclaimed tips auto-refund after 7 days${button}`,
    );
  }

  private async handleHelp(msg: TgMessage) {
    await this.telegram.sendMessage(
      msg.chat.id,
      `<b>Commands</b>\n/start — intro + open the app\n/tip @user &lt;amount&gt; — send a TON tip\n/tip &lt;amount&gt; (as a reply) — tip the replied-to user\n/help — this message\n\nTips are peer-to-peer TON transfers. Escrowed tips auto-refund after 7 days if unclaimed.`,
    );
  }

  /**
   * /tip parser. Accepts either:
   *   /tip @username 0.5
   *   /tip 0.5          (as a reply to another user's message)
   */
  private async handleTip(msg: TgMessage, text: string) {
    const sender = msg.from;
    if (!sender || sender.is_bot) return;

    const parts = text.split(/\s+/).slice(1);

    // Figure out recipient + amount from the two patterns.
    let recipientUsername: string | undefined;
    let recipientTelegramId: number | undefined;
    let amountStr: string | undefined;

    const mentionPart = parts.find((p) => p.startsWith('@'));
    const amountPart = parts.find((p) => /^-?\d+(\.\d+)?$/.test(p));

    if (mentionPart && amountPart) {
      recipientUsername = mentionPart.slice(1);
      amountStr = amountPart;
    } else if (amountPart && msg.reply_to_message?.from) {
      const target = msg.reply_to_message.from;
      if (target.is_bot) {
        await this.telegram.sendMessage(msg.chat.id, 'Cannot tip a bot.');
        return;
      }
      recipientTelegramId = target.id;
      recipientUsername = target.username;
      amountStr = amountPart;
    } else {
      await this.telegram.sendMessage(
        msg.chat.id,
        'Usage: <code>/tip @user 0.5</code> — or reply to a message with <code>/tip 0.5</code>',
      );
      return;
    }

    const amount = Number(amountStr);
    if (!Number.isFinite(amount) || amount <= 0) {
      await this.telegram.sendMessage(msg.chat.id, 'Amount must be a positive TON number.');
      return;
    }
    if (amount > 10_000) {
      await this.telegram.sendMessage(msg.chat.id, 'Amount too large.');
      return;
    }

    // Sender must be a Unisouq user — they need to open the app to sign.
    const dbSender = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(sender.id) },
      select: { id: true, tonAddress: true },
    });
    if (!dbSender) {
      const openHint = this.webappUrl ? `\n\nOpen: ${this.webappUrl}` : '';
      await this.telegram.sendMessage(
        msg.chat.id,
        `Open Unisouq first so we know it's you.${openHint}`,
      );
      return;
    }

    // Don't allow self-tipping.
    if (recipientTelegramId && BigInt(recipientTelegramId) === BigInt(sender.id)) {
      await this.telegram.sendMessage(msg.chat.id, 'You cannot tip yourself.');
      return;
    }

    // Create the Tip row. The /tip command creates a PENDING_SIGN row; the
    // sender must open the Mini App to sign the TonConnect transaction.
    const idempotencyKey = `bot-${msg.chat.id}-${msg.message_id}`;
    const tip = await this.tips.create(dbSender.id, {
      idempotencyKey,
      amountTon: amount,
      recipientUsername,
      recipientTelegramId: recipientTelegramId ? String(recipientTelegramId) : undefined,
    });

    const deepLink = this.botUsername
      ? `https://t.me/${this.botUsername}/app?startapp=tip_${tip.tipId}`
      : this.webappUrl || '(open the Unisouq app)';

    const targetLabel = recipientUsername ? `@${recipientUsername}` : 'that user';
    await this.telegram.sendMessage(
      msg.chat.id,
      `Tip of <b>${amount} TON</b> to ${targetLabel} ready. Sign in the app:\n\n${deepLink}`,
    );
  }
}
