import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../telegram/notifications.service';
import { CreatePlusPlanDto, UpdatePlusPlanDto } from './plus.dto';

@Injectable()
export class PlusService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // ─── Public catalog ───

  listPlans() {
    return this.prisma.plusPlan.findMany({
      where: { isActive: true },
      orderBy: { durationDays: 'asc' },
    });
  }

  async mySubscription(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { premiumBadgeUntil: true },
    });
    const active = await this.prisma.plusSubscription.findFirst({
      where: { userId, endsAt: { gt: new Date() } },
      include: { plan: true },
      orderBy: { endsAt: 'desc' },
    });
    return {
      activeUntil: user?.premiumBadgeUntil ?? null,
      current: active,
    };
  }

  // ─── Subscribe (wallet-balance flow) ───

  async subscribe(userId: string, planId: string, currency: 'STARS' | 'TON') {
    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.plusPlan.findUnique({ where: { id: planId } });
      if (!plan || !plan.isActive) throw new NotFoundException('Plan not available');

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      let balanceAfter: number;
      let amount: number;

      if (currency === 'STARS') {
        if (plan.priceStars == null) throw new BadRequestException('Plan not sold for Stars');
        if (user.starsBalance < plan.priceStars) {
          throw new BadRequestException('Insufficient Stars');
        }
        amount = plan.priceStars;
        const updated = await tx.user.update({
          where: { id: userId },
          data: { starsBalance: { decrement: amount } },
        });
        balanceAfter = updated.starsBalance;
      } else {
        if (plan.priceTon == null) throw new BadRequestException('Plan not sold for TON');
        if (user.tonBalance < plan.priceTon) {
          throw new BadRequestException('Insufficient TON');
        }
        amount = plan.priceTon;
        const updated = await tx.user.update({
          where: { id: userId },
          data: { tonBalance: { decrement: amount } },
        });
        balanceAfter = updated.tonBalance;
      }

      // Extend from whichever is later: now or current premiumBadgeUntil
      const now = new Date();
      const base =
        user.premiumBadgeUntil && user.premiumBadgeUntil > now
          ? user.premiumBadgeUntil
          : now;
      const endsAt = new Date(base.getTime() + plan.durationDays * 86400000);

      const sub = await tx.plusSubscription.create({
        data: { userId, planId, startsAt: now, endsAt },
      });

      await tx.user.update({
        where: { id: userId },
        data: { premiumBadgeUntil: endsAt },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'PLUS_SUBSCRIPTION',
          currency,
          amount: -amount,
          balanceAfter,
          meta: { planId, subId: sub.id, endsAt: endsAt.toISOString() },
        },
      });

      return { sub, endsAt };
    }).then(async ({ sub, endsAt }) => {
      await this.notifications.plusActivated(userId, endsAt);
      return sub;
    });
  }

  // ─── Admin CRUD ───

  createPlan(dto: CreatePlusPlanDto) {
    return this.prisma.plusPlan.create({ data: dto });
  }

  updatePlan(id: string, dto: UpdatePlusPlanDto) {
    return this.prisma.plusPlan.update({ where: { id }, data: dto });
  }

  retirePlan(id: string) {
    return this.prisma.plusPlan.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
