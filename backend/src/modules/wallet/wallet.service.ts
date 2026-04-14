import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TonService } from './ton.service';
import { TasksService } from '../tasks/tasks.service';

type TxClient = Prisma.TransactionClient;

const WITHDRAWAL_FEE_RATE = 0.05;
const MIN_WITHDRAWAL = 100;
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_DAILY_SEND_BRB = 1000;

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

  async withdraw(
    userId: string,
    tonAddress: string,
    amount: number,
    idempotencyKey?: string,
  ) {
    if (amount < MIN_WITHDRAWAL) {
      throw new BadRequestException(`Minimum withdrawal is ${MIN_WITHDRAWAL} BRB`);
    }

    if (!this.tonService.validateAddress(tonAddress)) {
      throw new BadRequestException('Invalid TON address format');
    }

    const normalizedKey = (idempotencyKey?.trim() || `auto_${Date.now()}_${amount}`)
      .slice(0, 128);

    return this.prisma.$transaction(async (tx: TxClient) => {
      const existing = await tx.withdrawalRequest.findFirst({
        where: {
          userId,
          idempotencyKey: normalizedKey,
          createdAt: { gte: new Date(Date.now() - IDEMPOTENCY_TTL_MS) },
        },
      });
      if (existing) {
        return {
          netAmount: existing.netAmount,
          fee: existing.feeAmount,
          tonAddress: existing.tonAddress,
          status: existing.status,
          txId: existing.externalTxId ?? existing.id,
          withdrawalId: existing.id,
        };
      }

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

      const request = await tx.withdrawalRequest.create({
        data: {
          userId,
          tonAddress,
          grossAmount: amount,
          feeAmount: fee,
          netAmount,
          status: 'PENDING',
          idempotencyKey: normalizedKey,
        },
      });

      return {
        netAmount,
        fee,
        tonAddress,
        status: request.status,
        txId: request.id,
        withdrawalId: request.id,
      };
    });
  }

  async sendBrb(userId: string, recipient: string, amount: number, note?: string) {
    const normalizedRecipient = recipient.trim();
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    return this.prisma.$transaction(async (tx: TxClient) => {
      const sender = await tx.user.findUniqueOrThrow({ where: { id: userId } });

      const receiver = await tx.user.findFirst({
        where: {
          OR: [
            { id: normalizedRecipient },
            { username: normalizedRecipient.startsWith('@') ? normalizedRecipient.slice(1) : normalizedRecipient },
            { referralCode: normalizedRecipient },
          ],
        },
      });
      if (!receiver) throw new BadRequestException('Recipient not found');
      if (receiver.id === sender.id) throw new BadRequestException('Cannot send to yourself');
      if (sender.brbBalance < amount) throw new BadRequestException('Insufficient balance');

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const sentTodayAgg = await tx.transaction.aggregate({
        where: { userId: sender.id, type: 'BRB_TRANSFER_OUT', createdAt: { gte: startOfDay } },
        _sum: { amount: true },
      });
      const sentTodayAbs = Math.abs(sentTodayAgg._sum.amount ?? 0);
      if (sentTodayAbs + amount > MAX_DAILY_SEND_BRB) {
        throw new BadRequestException(`Daily send limit is ${MAX_DAILY_SEND_BRB} BRB`);
      }

      await tx.user.update({
        where: { id: sender.id },
        data: { brbBalance: { decrement: amount } },
      });
      await tx.user.update({
        where: { id: receiver.id },
        data: { brbBalance: { increment: amount } },
      });

      await tx.transaction.create({
        data: {
          userId: sender.id,
          type: 'BRB_TRANSFER_OUT',
          amount: -amount,
          balanceBefore: sender.brbBalance,
          balanceAfter: sender.brbBalance - amount,
          meta: {
            toUserId: receiver.id,
            toUsername: receiver.username,
            note: note?.trim() || null,
          },
        },
      });

      await tx.transaction.create({
        data: {
          userId: receiver.id,
          type: 'BRB_TRANSFER_IN',
          amount,
          balanceBefore: receiver.brbBalance,
          balanceAfter: receiver.brbBalance + amount,
          meta: {
            fromUserId: sender.id,
            fromUsername: sender.username,
            note: note?.trim() || null,
          },
        },
      });

      return {
        amount,
        recipient: {
          id: receiver.id,
          username: receiver.username,
          firstName: receiver.firstName,
        },
      };
    });
  }

  async listWithdrawalQueue(status?: 'PENDING' | 'APPROVED' | 'SENT' | 'FAILED', limit = 50) {
    return this.prisma.withdrawalRequest.findMany({
      where: status ? { status } : undefined,
      include: {
        user: {
          select: { id: true, telegramId: true, username: true, firstName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async approveWithdrawal(withdrawalId: string) {
    return this.prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: { status: 'APPROVED', approvedAt: new Date(), failureReason: null },
    });
  }

  async markWithdrawalFailed(withdrawalId: string, reason?: string) {
    return this.prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: {
        status: 'FAILED',
        failureReason: reason?.trim() || 'Unknown failure',
        failedAt: new Date(),
      },
    });
  }

  async sendApprovedWithdrawal(withdrawalId: string) {
    return this.prisma.$transaction(async (tx: TxClient) => {
      const request = await tx.withdrawalRequest.findUniqueOrThrow({ where: { id: withdrawalId } });
      if (request.status !== 'APPROVED') {
        throw new BadRequestException('Withdrawal must be APPROVED before sending');
      }
      const result = await this.tonService.createWithdrawalRequest(
        request.userId,
        request.tonAddress,
        request.netAmount,
      );
      return tx.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: 'SENT',
          externalTxId: result.txId,
          sentAt: new Date(),
          failureReason: null,
        },
      });
    });
  }
}
