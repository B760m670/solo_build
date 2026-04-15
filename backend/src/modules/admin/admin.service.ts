import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TaskProofType } from '@prisma/client';
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
      totalListings,
      activeListings,
      totalOrders,
      completedOrders,
      commissionAgg,
      gmvAgg,
      totalTasks,
      activeTasks,
      taskSubmissions,
      pendingWithdrawals,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.user.groupBy({
        by: ['reputationTier'],
        _count: { _all: true },
      }),
      this.prisma.listing.count(),
      this.prisma.listing.count({ where: { isActive: true } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'COMPLETED' } }),
      this.prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { commissionStars: true },
      }),
      this.prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { priceStars: true },
      }),
      this.prisma.task.count(),
      this.prisma.task.count({ where: { isActive: true } }),
      this.prisma.userTask.count({ where: { status: 'DELIVERED' } }),
      this.prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
    ]);

    const tiers = { NEW: 0, TRUSTED: 0, EXPERT: 0, ELITE: 0 } as Record<string, number>;
    for (const row of tierDist) tiers[row.reputationTier] = row._count._all;

    return {
      users: { total: totalUsers, recentSignups, tiers },
      listings: { total: totalListings, active: activeListings },
      orders: { total: totalOrders, completed: completedOrders },
      economy: {
        gmvStars: gmvAgg._sum.priceStars ?? 0,
        commissionStars: commissionAgg._sum.commissionStars ?? 0,
      },
      tasks: {
        total: totalTasks,
        active: activeTasks,
        pendingReview: taskSubmissions,
      },
      withdrawals: { pending: pendingWithdrawals },
    };
  }

  async pendingTaskSubmissions() {
    return this.prisma.userTask.findMany({
      where: { status: 'DELIVERED' },
      include: {
        task: true,
        user: { select: { id: true, username: true, firstName: true, avatarUrl: true } },
      },
      orderBy: { deliveredAt: 'asc' },
      take: 50,
    });
  }

  async pendingDisputes() {
    return this.prisma.order.findMany({
      where: { status: 'DISPUTED' },
      include: {
        listing: true,
        buyer: { select: { id: true, username: true, firstName: true } },
        seller: { select: { id: true, username: true, firstName: true } },
      },
      orderBy: { updatedAt: 'asc' },
    });
  }

  // ─── TON withdrawals ───

  async pendingWithdrawals() {
    return this.prisma.withdrawalRequest.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { id: true, firstName: true, username: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Send the pending withdrawal on-chain and mark it SENT.
   * On failure: record failure reason and leave funds debited so an admin
   * can manually refund if needed — never silently re-credit a user.
   */
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

  // ─── Brand task funding ───

  /**
   * Create a brand-funded task. The TON payment from the brand is expected
   * to have already landed on the platform wallet out-of-band; this method
   * records the task and logs a BRAND_TASK_FUNDING transaction on a
   * synthetic "platform" row tied to the calling admin.
   */
  async createBrandTask(
    adminUserId: string,
    dto: {
      brandName: string;
      brandLogo?: string;
      title: string;
      description: string;
      proofType: TaskProofType;
      rewardStars: number;
      totalSlots: number;
      fundedTon: number;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          brandName: dto.brandName,
          brandLogo: dto.brandLogo ?? null,
          title: dto.title,
          description: dto.description,
          proofType: dto.proofType,
          rewardStars: dto.rewardStars,
          totalSlots: dto.totalSlots,
          fundedTon: dto.fundedTon,
          isActive: true,
        },
      });

      if (dto.fundedTon > 0) {
        const admin = await tx.user.findUnique({ where: { id: adminUserId } });
        if (admin) {
          await tx.transaction.create({
            data: {
              userId: adminUserId,
              type: 'BRAND_TASK_FUNDING',
              currency: 'TON',
              amount: dto.fundedTon,
              balanceAfter: admin.tonBalance,
              meta: { taskId: task.id, brandName: dto.brandName },
            },
          });
        }
      }

      return task;
    });
  }
}
