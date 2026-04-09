import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

type TxClient = Prisma.TransactionClient;

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async findAll(category?: string) {
    return this.prisma.task.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async start(userId: string, taskId: string) {
    const task = await this.findById(taskId);

    if (task.filledSlots >= task.totalSlots) {
      throw new BadRequestException('No slots available');
    }

    const existing = await this.prisma.userTask.findUnique({
      where: { userId_taskId: { userId, taskId } },
    });

    if (existing) {
      throw new BadRequestException('Task already started');
    }

    return this.prisma.userTask.create({
      data: { userId, taskId, status: 'ACTIVE' },
    });
  }

  async complete(userId: string, taskId: string, proof: string) {
    const userTask = await this.prisma.userTask.findUnique({
      where: { userId_taskId: { userId, taskId } },
    });

    if (!userTask || userTask.status !== 'ACTIVE') {
      throw new BadRequestException('Task not active');
    }

    const task = await this.findById(taskId);

    return this.prisma.$transaction(async (tx: TxClient) => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });

      await tx.userTask.update({
        where: { id: userTask.id },
        data: {
          status: 'COMPLETED',
          proof,
          completedAt: new Date(),
        },
      });

      await tx.task.update({
        where: { id: taskId },
        data: { filledSlots: { increment: 1 } },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          brbBalance: { increment: task.reward },
          totalEarned: { increment: task.reward },
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'TASK_REWARD',
          amount: task.reward,
          balanceBefore: user.brbBalance,
          balanceAfter: user.brbBalance + task.reward,
          meta: { taskId, taskTitle: task.title },
        },
      });

      // Send push notification (fire and forget)
      this.notifications.sendTaskCompleted(
        user.telegramId,
        task.title,
        task.reward,
      );

      return { reward: task.reward };
    });
  }

  async getUserTasks(userId: string, status?: string) {
    return this.prisma.userTask.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      include: { task: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
