import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const REFERRAL_BONUS_STARS = 50;
const BOT_USERNAME = 'unisouq_bot';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  async getInfo(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const count = await this.prisma.user.count({
      where: { referredById: userId },
    });

    const earnedAgg = await this.prisma.transaction.aggregate({
      where: { userId, type: 'REFERRAL_BONUS' },
      _sum: { amount: true },
    });

    return {
      code: user.referralCode,
      link: `https://t.me/${BOT_USERNAME}?start=ref_${user.referralCode}`,
      count,
      earnedStars: Math.max(0, earnedAgg._sum.amount ?? 0),
    };
  }

  /**
   * Called by orders module after a referred user completes their first deal.
   * Credits the referrer with a Stars bonus (one level only).
   */
  async creditFirstDealBonus(referredUserId: string) {
    const referred = await this.prisma.user.findUnique({
      where: { id: referredUserId },
    });
    if (!referred || !referred.referredById) return null;
    if (referred.referralBonusClaimedAt) return null;

    return this.prisma.$transaction(async (tx) => {
      const referrer = await tx.user.update({
        where: { id: referred.referredById! },
        data: { starsBalance: { increment: REFERRAL_BONUS_STARS } },
      });

      await tx.user.update({
        where: { id: referredUserId },
        data: { referralBonusClaimedAt: new Date() },
      });

      await tx.transaction.create({
        data: {
          userId: referrer.id,
          type: 'REFERRAL_BONUS',
          currency: 'STARS',
          amount: REFERRAL_BONUS_STARS,
          balanceAfter: referrer.starsBalance,
          meta: { referredUserId },
        },
      });

      return { credited: REFERRAL_BONUS_STARS };
    });
  }
}
