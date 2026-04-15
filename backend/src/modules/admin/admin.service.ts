import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TonService } from '../ton/ton.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private ton: TonService,
  ) {}

  async dashboard() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      recentSignups,
      tierDist,
      activePlus,
      totalGifts,
      activeGifts,
      totalThemes,
      totalPosts,
      pendingWithdrawals,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.user.groupBy({
        by: ['reputationTier'],
        _count: { _all: true },
      }),
      this.prisma.user.count({ where: { premiumBadgeUntil: { gt: now } } }),
      this.prisma.gift.count(),
      this.prisma.gift.count({ where: { isActive: true } }),
      this.prisma.theme.count({ where: { isActive: true } }),
      this.prisma.post.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
    ]);

    const tiers = { NEW: 0, TRUSTED: 0, EXPERT: 0, ELITE: 0 } as Record<string, number>;
    for (const row of tierDist) tiers[row.reputationTier] = row._count._all;

    return {
      users: { total: totalUsers, recentSignups, tiers, activePlus },
      gifts: { total: totalGifts, active: activeGifts },
      themes: { active: totalThemes },
      social: { posts: totalPosts },
      withdrawals: { pending: pendingWithdrawals },
    };
  }

  // ─── TON withdrawals ───

  async pendingWithdrawals() {
    return this.prisma.withdrawalRequest.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { id: true, firstName: true, username: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async processWithdrawal(withdrawalId: string) {
    const w = await this.prisma.withdrawalRequest.findUnique({ where: { id: withdrawalId } });
    if (!w) throw new NotFoundException('Withdrawal not found');
    if (w.status !== 'PENDING') {
      throw new BadRequestException(`Withdrawal already ${w.status}`);
    }

    try {
      const { seqno } = await this.ton.sendTon({
        destination: w.tonAddress,
        amountTon: w.netAmount,
        comment: `unisouq:${w.id}`,
      });
      return this.prisma.withdrawalRequest.update({
        where: { id: w.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          externalTxId: `seqno:${seqno}`,
        },
      });
    } catch (e) {
      const reason = (e as Error).message;
      this.logger.error(`Withdrawal ${w.id} failed: ${reason}`);
      return this.prisma.withdrawalRequest.update({
        where: { id: w.id },
        data: { status: 'FAILED', failedAt: new Date(), failureReason: reason },
      });
    }
  }
}
