import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TonService } from './ton.service';
import { TasksService } from '../tasks/tasks.service';

type TxClient = Prisma.TransactionClient;

const WITHDRAWAL_FEE_RATE = 0.05;
const MIN_WITHDRAWAL = 100;

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private tonService: TonService,
    private tasksService: TasksService,
  ) {}

  async getWallet(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const recentTransactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      balance: user.brbBalance,
      totalEarned: user.totalEarned,
      tonWallet: user.tonWallet,
      recentTransactions,
    };
  }

  async getTransactions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where: { userId } }),
    ]);

    return {
      data: transactions,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    };
  }

  async connectWallet(userId: string, tonAddress: string) {
    if (!this.tonService.validateAddress(tonAddress)) {
      throw new BadRequestException('Invalid TON address format');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { tonWallet: tonAddress },
    });

    // Fire and forget: auto-complete wallet-connect tasks if user started them.
    this.tasksService.autoCompleteActiveTasks(userId, 'AUTO_CONNECT_WALLET');

    return { tonWallet: user.tonWallet };
  }

  async disconnectWallet(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { tonWallet: null },
    });
    return { tonWallet: null };
  }

  async withdraw(userId: string, tonAddress: string, amount: number) {
    if (amount < MIN_WITHDRAWAL) {
      throw new BadRequestException(`Minimum withdrawal is ${MIN_WITHDRAWAL} BRB`);
    }

    if (!this.tonService.validateAddress(tonAddress)) {
      throw new BadRequestException('Invalid TON address format');
    }

    return this.prisma.$transaction(async (tx: TxClient) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
      });

      if (user.brbBalance < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const fee = amount * WITHDRAWAL_FEE_RATE;
      const netAmount = amount - fee;

      await tx.user.update({
        where: { id: userId },
        data: { brbBalance: { decrement: amount } },
      });

      const withdrawal = await tx.transaction.create({
        data: {
          userId,
          type: 'WITHDRAWAL',
          amount: -netAmount,
          balanceBefore: user.brbBalance,
          balanceAfter: user.brbBalance - amount,
          meta: { tonAddress, fee, netAmount, status: 'PENDING' },
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'WITHDRAWAL_FEE',
          amount: -fee,
          balanceBefore: user.brbBalance,
          balanceAfter: user.brbBalance - amount,
          meta: { tonAddress, withdrawalId: withdrawal.id },
        },
      });

      // Queue withdrawal for processing
      const result = await this.tonService.createWithdrawalRequest(
        userId,
        tonAddress,
        netAmount,
      );

      return { netAmount, fee, tonAddress, status: result.status, txId: result.txId };
    });
  }
}
