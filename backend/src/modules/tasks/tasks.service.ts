import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

type TxClient = Prisma.TransactionClient;

const USER_TASK_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  SUBMITTED: 'SUBMITTED',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
} as const;

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

    if (!userTask || userTask.status !== USER_TASK_STATUS.ACTIVE) {
      throw new BadRequestException('Task not active');
    }

    // Submit for review. Reward is granted only after admin approval.
    await this.prisma.userTask.update({
      where: { id: userTask.id },
      data: {
        status: USER_TASK_STATUS.SUBMITTED,
        proof,
        completedAt: new Date(),
      },
    });

    return { status: USER_TASK_STATUS.SUBMITTED };
  }

  async getUserTasks(userId: string, status?: string) {
    const statuses = (status || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    return this.prisma.userTask.findMany({
      where: {
        userId,
        ...(statuses.length ? { status: { in: statuses } } : {}),
      },
      include: { task: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listSubmissions(limit = 50) {
    return this.prisma.userTask.findMany({
      where: { status: USER_TASK_STATUS.SUBMITTED },
      include: {
        task: true,
        user: {
          select: {
            id: true,
            telegramId: true,
            username: true,
            firstName: true,
            avatarUrl: true,
            brbBalance: true,
          },
        },
      },
      orderBy: [{ completedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
  }

  async approveSubmission(userTaskId: string) {
    return this.prisma.$transaction(async (tx: TxClient) => {
      const userTask = await tx.userTask.findUnique({
        where: { id: userTaskId },
        include: { task: true },
      });

      if (!userTask) throw new NotFoundException('User task not found');
      if (userTask.status !== USER_TASK_STATUS.SUBMITTED) {
        throw new BadRequestException('Submission is not pending review');
      }

      const task = userTask.task;
      if (!task) throw new NotFoundException('Task not found');
      if (task.filledSlots >= task.totalSlots) {
        throw new BadRequestException('No slots available');
      }

      const user = await tx.user.findUniqueOrThrow({
        where: { id: userTask.userId },
      });

      await tx.userTask.update({
        where: { id: userTaskId },
        data: {
          status: USER_TASK_STATUS.COMPLETED,
          completedAt: new Date(),
        },
      });

      await tx.task.update({
        where: { id: task.id },
        data: { filledSlots: { increment: 1 } },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          brbBalance: { increment: task.reward },
          totalEarned: { increment: task.reward },
        },
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'TASK_REWARD',
          amount: task.reward,
          balanceBefore: user.brbBalance,
          balanceAfter: user.brbBalance + task.reward,
          meta: {
            taskId: task.id,
            taskTitle: task.title,
            userTaskId: userTaskId,
          },
        },
      });

      // Fire and forget
      this.notifications.sendTaskCompleted(user.telegramId, task.title, task.reward);

      return { reward: task.reward, status: USER_TASK_STATUS.COMPLETED };
    });
  }

  async rejectSubmission(userTaskId: string) {
    const userTask = await this.prisma.userTask.findUnique({
      where: { id: userTaskId },
    });

    if (!userTask) throw new NotFoundException('User task not found');
    if (userTask.status !== USER_TASK_STATUS.SUBMITTED) {
      throw new BadRequestException('Submission is not pending review');
    }

    await this.prisma.userTask.update({
      where: { id: userTaskId },
      data: { status: USER_TASK_STATUS.REJECTED },
    });

    return { status: USER_TASK_STATUS.REJECTED };
  }
}
