import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type NotificationType =
  | 'task_completed'
  | 'marketplace_sale'
  | 'referral_bonus'
  | 'withdrawal_processed'
  | 'premium_activated'
  | 'new_task_available';

interface NotificationPayload {
  type: NotificationType;
  data: Record<string, unknown>;
}

const TEMPLATES: Record<NotificationType, (data: Record<string, unknown>) => string> = {
  task_completed: (d) =>
    `Task completed! You earned ${d.reward} BRB for "${d.taskTitle}".`,
  marketplace_sale: (d) =>
    `Your listing "${d.listingTitle}" was purchased for ${d.amount} BRB.`,
  referral_bonus: (d) =>
    `Referral bonus! You received ${d.bonus} BRB from a referred friend.`,
  withdrawal_processed: (d) =>
    `Withdrawal of ${d.amount} BRB to ${d.tonAddress} has been processed.`,
  premium_activated: (d) =>
    `Premium activated! Your subscription is active until ${d.expiresAt}.`,
  new_task_available: (d) =>
    `New task available: "${d.taskTitle}" — earn ${d.reward} BRB.`,
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private config: ConfigService) {}

  async send(telegramId: number | bigint, payload: NotificationPayload): Promise<boolean> {
    const botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      this.logger.warn('Bot token not configured, skipping notification');
      return false;
    }

    const template = TEMPLATES[payload.type];
    if (!template) {
      this.logger.warn(`Unknown notification type: ${payload.type}`);
      return false;
    }

    const text = template(payload.data);
    const webappUrl = this.config.get<string>('FRONTEND_URL', '');

    const keyboard = webappUrl
      ? {
          inline_keyboard: [
            [{ text: 'Open Brabble', web_app: { url: webappUrl } }],
          ],
        }
      : undefined;

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: Number(telegramId),
            text,
            parse_mode: 'HTML',
            reply_markup: keyboard,
          }),
        },
      );

      const result = await res.json();
      if (!result.ok) {
        this.logger.warn(`Failed to send notification to ${telegramId}: ${result.description}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Notification send error for ${telegramId}`, error);
      return false;
    }
  }

  async sendTaskCompleted(telegramId: number | bigint, taskTitle: string, reward: number) {
    return this.send(telegramId, {
      type: 'task_completed',
      data: { taskTitle, reward },
    });
  }

  async sendMarketplaceSale(telegramId: number | bigint, listingTitle: string, amount: number) {
    return this.send(telegramId, {
      type: 'marketplace_sale',
      data: { listingTitle, amount },
    });
  }

  async sendReferralBonus(telegramId: number | bigint, bonus: number) {
    return this.send(telegramId, {
      type: 'referral_bonus',
      data: { bonus },
    });
  }

  async sendWithdrawalProcessed(telegramId: number | bigint, amount: number, tonAddress: string) {
    return this.send(telegramId, {
      type: 'withdrawal_processed',
      data: { amount, tonAddress },
    });
  }

  async sendPremiumActivated(telegramId: number | bigint, expiresAt: string) {
    return this.send(telegramId, {
      type: 'premium_activated',
      data: { expiresAt },
    });
  }
}
