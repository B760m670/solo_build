import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type TxClient = Prisma.TransactionClient;

interface TelegramInvoiceResponse {
  ok: boolean;
  result: string; // invoice link
}

const PLAN_CONFIG = {
  PREMIUM_MONTHLY: { stars: 299, days: 30, label: 'Brabble Premium (1 month)' },
  PREMIUM_YEARLY: { stars: 2499, days: 365, label: 'Brabble Premium (1 year)' },
} as const;

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async createInvoice(userId: string, type: 'PREMIUM_MONTHLY' | 'PREMIUM_YEARLY') {
    const botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    const plan = PLAN_CONFIG[type];

    // Fetch user to get telegramId for payload
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const payload = JSON.stringify({
      userId: user.id,
      type,
      telegramId: Number(user.telegramId),
    });

    // Create invoice via Telegram Bot API
    const body = {
      title: plan.label,
      description: `Access premium features on Brabble. BRB is a utility token, not a financial instrument.`,
      payload,
      provider_token: '', // Empty for Telegram Stars
      currency: 'XTR', // Telegram Stars currency
      prices: [{ label: plan.label, amount: plan.stars }],
    };

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${botToken}/createInvoiceLink`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );

      const data: TelegramInvoiceResponse = await res.json();

      if (!data.ok) {
        this.logger.error('Failed to create invoice', data);
        throw new Error('Failed to create invoice');
      }

      return {
        type,
        stars: plan.stars,
        invoiceUrl: data.result,
      };
    } catch (error) {
      this.logger.error('Invoice creation error', error);
      // Fallback: return a web app invoice link
      return {
        type,
        stars: plan.stars,
        invoiceUrl: null,
        error: 'Invoice creation unavailable',
      };
    }
  }

  async handlePreCheckout(preCheckoutQueryId: string) {
    const botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN');

    await fetch(
      `https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pre_checkout_query_id: preCheckoutQueryId,
          ok: true,
        }),
      },
    );
  }

  async handleSuccessfulPayment(
    telegramId: bigint,
    type: string,
    totalAmount: number,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      this.logger.warn(`Payment received for unknown user: ${telegramId}`);
      return;
    }

    const planKey = type as keyof typeof PLAN_CONFIG;
    const plan = PLAN_CONFIG[planKey];
    const durationDays = plan?.days ?? 30;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    await this.prisma.$transaction(async (tx: TxClient) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          isPremium: true,
          premiumExpiry: expiresAt,
        },
      });

      await tx.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          plan: 'PREMIUM',
          expiresAt,
          isActive: true,
        },
        update: {
          expiresAt,
          isActive: true,
          startsAt: new Date(),
        },
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'PREMIUM_PURCHASE',
          amount: -totalAmount,
          balanceBefore: user.brbBalance,
          balanceAfter: user.brbBalance,
          meta: { planType: type, stars: totalAmount, durationDays },
        },
      });
    });

    this.logger.log(`Premium activated for user ${user.id}, plan: ${type}`);
  }
}
