import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomUUID } from 'crypto';

const TON_WITHDRAWAL_FEE_RATE = 0.05;

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getWallet(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        starsBalance: true,
        tonBalance: true,
        totalEarnedStars: true,
        tonAddress: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const recentTransactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      starsBalance: user.starsBalance,
      tonBalance: user.tonBalance,
      totalEarnedStars: user.totalEarnedStars,
      tonAddress: user.tonAddress,
      recentTransactions,
    };
  }

  async transactions(userId: string, limit = 50, offset = 0) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async requestTonWithdrawal(
    userId: string,
    tonAddress: string,
    amount: number,
    idempotencyKey?: string,
  ) {
    const key = idempotencyKey || randomUUID();

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      if (user.tonBalance < amount) {
        throw new BadRequestException('Insufficient TON balance');
      }
      if (amount < 0.1) {
        throw new BadRequestException('Minimum withdrawal is 0.1 TON');
      }

      const existing = await tx.withdrawalRequest.findUnique({
        where: { userId_idempotencyKey: { userId, idempotencyKey: key } },
      });
      if (existing) return existing;

      const feeAmount = +(amount * TON_WITHDRAWAL_FEE_RATE).toFixed(4);
      const netAmount = +(amount - feeAmount).toFixed(4);

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { tonBalance: { decrement: amount } },
      });

      const withdrawal = await tx.withdrawalRequest.create({
        data: {
          userId,
          tonAddress,
          grossAmount: amount,
          feeAmount,
          netAmount,
          status: 'PENDING',
          idempotencyKey: key,
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'TON_WITHDRAWAL',
          currency: 'TON',
          amount: -amount,
          balanceAfter: updatedUser.tonBalance,
          meta: { withdrawalId: withdrawal.id, feeAmount, netAmount },
        },
      });

      return withdrawal;
    });
  }
}
