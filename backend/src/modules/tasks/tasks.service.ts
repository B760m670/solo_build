import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserTaskStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../telegram/notifications.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async listAvailable() {
    return this.prisma.task.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async mine(userId: string, status?: UserTaskStatus) {
    return this.prisma.userTask.findMany({
      where: { userId, ...(status ? { status } : {}) },
      include: { task: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async start(userId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task || !task.isActive) throw new NotFoundException('Task not available');
    if (task.filledSlots >= task.totalSlots) {
      throw new BadRequestException('No slots remaining');
    }
    const existing = await this.prisma.userTask.findUnique({
      where: { userId_taskId: { userId, taskId } },
    });
    if (existing) throw new BadRequestException('Already started');

    return this.prisma.userTask.create({
      data: { userId, taskId, status: 'ACTIVE' },
    });
  }

  async submitProof(userId: string, userTaskId: string, proof: string) {
    const ut = await this.prisma.userTask.findUnique({ where: { id: userTaskId } });
    if (!ut) throw new NotFoundException('Task not started');
    if (ut.userId !== userId) throw new ForbiddenException('Not your task');
    if (ut.status !== 'ACTIVE') {
      throw new BadRequestException(`Cannot submit from status ${ut.status}`);
    }
    return this.prisma.userTask.update({
      where: { id: userTaskId },
      data: { status: 'DELIVERED', proof, deliveredAt: new Date() },
    });
  }

  /**
   * Admin approves a task submission → Stars credited to user.
   */
  async approve(userTaskId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const ut = await tx.userTask.findUnique({
        where: { id: userTaskId },
        include: { task: true },
      });
      if (!ut) throw new NotFoundException('Submission not found');
      if (ut.status !== 'DELIVERED') {
        throw new BadRequestException('Not in DELIVERED state');
      }

      const user = await tx.user.update({
        where: { id: ut.userId },
        data: {
          starsBalance: { increment: ut.task.rewardStars },
          totalEarnedStars: { increment: ut.task.rewardStars },
        },
      });

      await tx.task.update({
        where: { id: ut.taskId },
        data: {
          filledSlots: { increment: 1 },
          spentStars: { increment: ut.task.rewardStars },
        },
      });

      await tx.transaction.create({
        data: {
          userId: ut.userId,
          type: 'TASK_REWARD',
          currency: 'STARS',
          amount: ut.task.rewardStars,
          balanceAfter: user.starsBalance,
          meta: { taskId: ut.taskId, userTaskId: ut.id },
        },
      });

      return tx.userTask.update({
        where: { id: ut.id },
        data: { status: 'APPROVED', approvedAt: new Date() },
      });
    });
    void this.notifications.taskApproved(result.id);
    return result;
  }

  async reject(userTaskId: string, reason?: string) {
    const ut = await this.prisma.userTask.findUnique({ where: { id: userTaskId } });
    if (!ut) throw new NotFoundException('Submission not found');
    if (ut.status !== 'DELIVERED') {
      throw new BadRequestException('Not in DELIVERED state');
    }
    const updated = await this.prisma.userTask.update({
      where: { id: userTaskId },
      data: { status: 'REJECTED', rejectReason: reason ?? null },
    });
    void this.notifications.taskRejected(updated.id);
    return updated;
  }
}
