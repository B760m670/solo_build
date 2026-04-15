import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramService } from './telegram.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private telegram: TelegramService,
  ) {}

  private async chatIdFor(userId: string): Promise<bigint | null> {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { telegramId: true },
    });
    return u?.telegramId ?? null;
  }

  /**
   * Unified notification send — writes an in-app Notification row and,
   * when possible, also sends a Telegram message to the user. Both sides
   * are best-effort; failures never throw.
   */
  async send(
    userId: string,
    text: string,
    inApp: { type: string; title: string; body: string },
  ) {
    try {
      await this.prisma.notification.create({
        data: {
          userId,
          type: inApp.type,
          title: inApp.title,
          body: inApp.body,
        },
      });
    } catch {
      // in-app notifications are best-effort
    }
    const chatId = await this.chatIdFor(userId);
    if (chatId) {
      try {
        await this.telegram.sendMessage(chatId, text);
      } catch {
        // telegram send failures must never break business flow
      }
    }
  }

  // ─── Generic purchase hooks (wired once Gifts/Themes/Plus services land) ───

  async plusActivated(userId: string, until: Date) {
    await this.send(
      userId,
      `<b>Unisouq Plus activated</b>\nActive until ${until.toLocaleDateString()}.`,
      {
        type: 'PLUS_ACTIVATED',
        title: 'Unisouq Plus activated',
        body: `Active until ${until.toLocaleDateString()}`,
      },
    );
  }

  async giftAcquired(userId: string, giftName: string) {
    await this.send(
      userId,
      `<b>New gift in your collection</b>\n${giftName}`,
      {
        type: 'GIFT_ACQUIRED',
        title: 'New gift',
        body: giftName,
      },
    );
  }

  async themeUnlocked(userId: string, themeName: string) {
    await this.send(
      userId,
      `<b>New theme unlocked</b>\n${themeName}`,
      {
        type: 'THEME_UNLOCKED',
        title: 'New theme unlocked',
        body: themeName,
      },
    );
  }
}
