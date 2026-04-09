import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

type TxClient = Prisma.TransactionClient;

const REFERRAL_BONUS = 50;

@Injectable()
export class ReferralsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private notifications: NotificationsService,
  ) {}

  async getReferralInfo(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const botUsername = this.config.get<string>('BOT_USERNAME', 'brabble_bot');

    return {
      code: user.referralCode,
      link: `https://t.me/${botUsername}?start=${user.referralCode}`,
      count: user.referralCount,
      earned: user.referralEarned,
    };
  }

  async claimBonus(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (!user.referredBy) {
      throw new BadRequestException('Not a referred user');
    }

    // Check if user completed at least one task
    const completedTask = await this.prisma.userTask.findFirst({
      where: { userId, status: 'COMPLETED' },
    });

    if (!completedTask) {
      throw new BadRequestException('Complete at least one task first');
    }

    // Credit referrer
    return this.prisma.$transaction(async (tx: TxClient) => {
      const referrer = await tx.user.findUniqueOrThrow({
        where: { id: user.referredBy! },
      });

      await tx.user.update({
        where: { id: referrer.id },
        data: {
          brbBalance: { increment: REFERRAL_BONUS },
          totalEarned: { increment: REFERRAL_BONUS },
          referralEarned: { increment: REFERRAL_BONUS },
        },
      });

      await tx.transaction.create({
        data: {
          userId: referrer.id,
          type: 'REFERRAL_BONUS',
          amount: REFERRAL_BONUS,
          balanceBefore: referrer.brbBalance,
          balanceAfter: referrer.brbBalance + REFERRAL_BONUS,
          meta: { referredUserId: userId },
        },
      });

      // Notify referrer
      this.notifications.sendReferralBonus(referrer.telegramId, REFERRAL_BONUS);

      return { bonus: REFERRAL_BONUS, referrerId: referrer.id };
    });
  }
}
