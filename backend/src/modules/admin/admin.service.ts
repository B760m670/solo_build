import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalUsers,
      premiumUsers,
      totalTasks,
      completedTasks,
      activeListings,
      totalOrders,
      totalTransactions,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isPremium: true } }),
      this.prisma.task.count(),
      this.prisma.userTask.count({ where: { status: 'COMPLETED' } }),
      this.prisma.listing.count({ where: { isActive: true } }),
      this.prisma.order.count(),
      this.prisma.transaction.count(),
    ]);

    // BRB economy stats
    const brbStats = await this.prisma.user.aggregate({
      _sum: { brbBalance: true, totalEarned: true },
    });

    // Recent signups (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentSignups = await this.prisma.user.count({
      where: { createdAt: { gte: weekAgo } },
    });

    // Revenue from commissions
    const commissionRevenue = await this.prisma.order.aggregate({
      _sum: { commission: true },
    });

    // Top tasks by completion
    const topTasks = await this.prisma.task.findMany({
      orderBy: { filledSlots: 'desc' },
      take: 5,
      select: { id: true, title: true, brand: true, filledSlots: true, totalSlots: true, reward: true },
    });

    return {
      users: {
        total: totalUsers,
        premium: premiumUsers,
        recentSignups,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        topTasks,
      },
      marketplace: {
        activeListings,
        totalOrders,
        commissionRevenue: commissionRevenue._sum.commission ?? 0,
      },
      economy: {
        totalBrbInCirculation: brbStats._sum.brbBalance ?? 0,
        totalBrbEarned: brbStats._sum.totalEarned ?? 0,
        totalTransactions,
      },
    };
  }

  async getRecentUsers(limit = 20) {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        brbBalance: true,
        isPremium: true,
        createdAt: true,
        _count: { select: { tasks: true, listings: true } },
      },
    });

    return users.map((u: typeof users[number]) => ({
      ...u,
      telegramId: Number(u.telegramId),
    }));
  }
}
