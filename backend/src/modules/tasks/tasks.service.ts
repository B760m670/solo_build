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

const TASK_VERIFICATION = {
  MANUAL: 'MANUAL',
  AUTO_CONNECT_WALLET: 'AUTO_CONNECT_WALLET',
  AUTO_FIRST_LISTING: 'AUTO_FIRST_LISTING',
  AUTO_FIRST_PURCHASE: 'AUTO_FIRST_PURCHASE',
} as const;

function readIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readFloatEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  const parsed = raw ? parseFloat(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

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

  async adminList(limit = 50) {
    return this.prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async adminCreate(data: {
    title: string;
    description: string;
    category: string;
    reward: number;
    timeMinutes: number;
    brand: string;
    brandLogo?: string;
    isActive?: boolean;
    totalSlots?: number;
    expiresAt?: string;
    verificationType?: string;
  }) {
    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        verificationType: data.verificationType ?? TASK_VERIFICATION.MANUAL,
        reward: data.reward,
        timeMinutes: data.timeMinutes,
        brand: data.brand,
        brandLogo: data.brandLogo ?? null,
        isActive: data.isActive ?? true,
        totalSlots: data.totalSlots ?? 100,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  async adminUpdate(taskId: string, data: {
    title?: string;
    description?: string;
    category?: string;
    reward?: number;
    timeMinutes?: number;
    brand?: string;
    brandLogo?: string;
    isActive?: boolean;
    totalSlots?: number;
    filledSlots?: number;
    expiresAt?: string | null;
    verificationType?: string;
  }) {
    await this.findById(taskId);

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(typeof data.title === 'string' ? { title: data.title } : {}),
        ...(typeof data.description === 'string' ? { description: data.description } : {}),
        ...(typeof data.category === 'string' ? { category: data.category } : {}),
        ...(typeof data.verificationType === 'string' ? { verificationType: data.verificationType } : {}),
        ...(typeof data.reward === 'number' ? { reward: data.reward } : {}),
        ...(typeof data.timeMinutes === 'number' ? { timeMinutes: data.timeMinutes } : {}),
        ...(typeof data.brand === 'string' ? { brand: data.brand } : {}),
        ...(typeof data.brandLogo === 'string' ? { brandLogo: data.brandLogo } : {}),
        ...(typeof data.isActive === 'boolean' ? { isActive: data.isActive } : {}),
        ...(typeof data.totalSlots === 'number' ? { totalSlots: data.totalSlots } : {}),
        ...(typeof data.filledSlots === 'number' ? { filledSlots: data.filledSlots } : {}),
        ...(Object.prototype.hasOwnProperty.call(data, 'expiresAt')
          ? { expiresAt: data.expiresAt ? new Date(String(data.expiresAt)) : null }
          : {}),
      },
    });
  }

  private async userMeetsAutoCondition(userId: string, verificationType: string): Promise<boolean> {
    if (verificationType === TASK_VERIFICATION.AUTO_CONNECT_WALLET) {
      const u = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
      return !!u.tonWallet;
    }

    if (verificationType === TASK_VERIFICATION.AUTO_FIRST_LISTING) {
      const count = await this.prisma.listing.count({ where: { sellerId: userId } });
      return count > 0;
    }

    if (verificationType === TASK_VERIFICATION.AUTO_FIRST_PURCHASE) {
      const count = await this.prisma.order.count({ where: { buyerId: userId } });
      return count > 0;
    }

    return false;
  }

  private async grantRewardForActiveUserTask(userTaskId: string) {
    return this.prisma.$transaction(async (tx: TxClient) => {
      const userTask = await tx.userTask.findUnique({
        where: { id: userTaskId },
        include: { task: true },
      });

      if (!userTask) throw new NotFoundException('User task not found');
      if (userTask.status !== USER_TASK_STATUS.ACTIVE) {
        throw new BadRequestException('Task not active');
      }

      const task = userTask.task;
      if (!task) throw new NotFoundException('Task not found');
      if (!task.isActive) throw new BadRequestException('Task is not active');
      if (task.expiresAt && new Date(task.expiresAt).getTime() < Date.now()) {
        throw new BadRequestException('Task expired');
      }
      if (task.filledSlots >= task.totalSlots) {
        throw new BadRequestException('No slots available');
      }

      const user = await tx.user.findUniqueOrThrow({ where: { id: userTask.userId } });

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const maxDailyReward = readFloatEnv('MAX_DAILY_TASK_REWARD_BRB', 200);
      const earnedTodayAgg = await tx.transaction.aggregate({
        where: { userId: user.id, type: 'TASK_REWARD', createdAt: { gte: startOfDay } },
        _sum: { amount: true },
      });
      const earnedToday = earnedTodayAgg._sum.amount ?? 0;
      if (earnedToday + task.reward > maxDailyReward) {
        throw new BadRequestException('Daily task reward limit reached');
      }

      await tx.userTask.update({
        where: { id: userTask.id },
        data: {
          status: USER_TASK_STATUS.COMPLETED,
          reviewedAt: new Date(),
          reviewNote: null,
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
          meta: { taskId: task.id, taskTitle: task.title, userTaskId: userTask.id, auto: true },
        },
      });

      this.notifications.sendTaskCompleted(user.telegramId, task.title, task.reward);

      return { reward: task.reward, status: USER_TASK_STATUS.COMPLETED };
    });
  }

  async adminToggle(taskId: string) {
    const task = await this.findById(taskId);
    return this.prisma.task.update({
      where: { id: taskId },
      data: { isActive: !task.isActive },
    });
  }

  async findById(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async start(userId: string, taskId: string) {
    const task = await this.findById(taskId);

    if (!task.isActive) {
      throw new BadRequestException('Task is not active');
    }

    if (task.expiresAt && new Date(task.expiresAt).getTime() < Date.now()) {
      throw new BadRequestException('Task expired');
    }

    if (task.filledSlots >= task.totalSlots) {
      throw new BadRequestException('No slots available');
    }

    const maxActive = readIntEnv('MAX_ACTIVE_TASKS_PER_USER', 3);
    const activeCount = await this.prisma.userTask.count({
      where: {
        userId,
        status: { in: [USER_TASK_STATUS.ACTIVE, USER_TASK_STATUS.SUBMITTED] },
      },
    });
    if (activeCount >= maxActive) {
      throw new BadRequestException('Too many active tasks');
    }

    const existing = await this.prisma.userTask.findUnique({
      where: { userId_taskId: { userId, taskId } },
    });

    if (existing) {
      if (existing.status === USER_TASK_STATUS.REJECTED) {
        // Allow resubmission after rejection.
        const restarted = await this.prisma.userTask.update({
          where: { id: existing.id },
          data: {
            status: USER_TASK_STATUS.ACTIVE,
            proof: null,
            submittedAt: null,
            reviewedAt: null,
            reviewNote: null,
            completedAt: null,
          },
        });

        if (task.verificationType && task.verificationType !== TASK_VERIFICATION.MANUAL) {
          const ok = await this.userMeetsAutoCondition(userId, task.verificationType);
          if (ok) return this.grantRewardForActiveUserTask(restarted.id);
        }

        return restarted;
      }

      throw new BadRequestException('Task already started');
    }

    const started = await this.prisma.userTask.create({
      data: { userId, taskId, status: 'ACTIVE' },
    });

    if (task.verificationType && task.verificationType !== TASK_VERIFICATION.MANUAL) {
      const ok = await this.userMeetsAutoCondition(userId, task.verificationType);
      if (ok) return this.grantRewardForActiveUserTask(started.id);
    }

    return started;
  }

  async autoCompleteActiveTasks(userId: string, verificationType: string) {
    const active = await this.prisma.userTask.findMany({
      where: {
        userId,
        status: USER_TASK_STATUS.ACTIVE,
        task: { verificationType, isActive: true },
      },
      select: { id: true },
      take: 25,
    });

    for (const ut of active) {
      try {
        await this.grantRewardForActiveUserTask(ut.id);
      } catch {
        // Ignore individual failures to avoid blocking the main user action.
      }
    }
  }

  async complete(userId: string, taskId: string, proof: string) {
    const userTask = await this.prisma.userTask.findUnique({
      where: { userId_taskId: { userId, taskId } },
    });

    if (!userTask || userTask.status !== USER_TASK_STATUS.ACTIVE) {
      throw new BadRequestException('Task not active');
    }

    const task = await this.findById(taskId);
    if (!task.isActive) {
      throw new BadRequestException('Task is not active');
    }
    if (task.expiresAt && new Date(task.expiresAt).getTime() < Date.now()) {
      throw new BadRequestException('Task expired');
    }

    // Submit for review. Reward is granted only after admin approval.
    await this.prisma.userTask.update({
      where: { id: userTask.id },
      data: {
        status: USER_TASK_STATUS.SUBMITTED,
        proof,
        submittedAt: new Date(),
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
      if (!task.isActive) {
        throw new BadRequestException('Task is not active');
      }
      if (task.expiresAt && new Date(task.expiresAt).getTime() < Date.now()) {
        throw new BadRequestException('Task expired');
      }
      if (task.filledSlots >= task.totalSlots) {
        throw new BadRequestException('No slots available');
      }

      const user = await tx.user.findUniqueOrThrow({
        where: { id: userTask.userId },
      });

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const maxDailyReward = readFloatEnv('MAX_DAILY_TASK_REWARD_BRB', 200);
      const earnedTodayAgg = await tx.transaction.aggregate({
        where: {
          userId: user.id,
          type: 'TASK_REWARD',
          createdAt: { gte: startOfDay },
        },
        _sum: { amount: true },
      });
      const earnedToday = earnedTodayAgg._sum.amount ?? 0;
      if (earnedToday + task.reward > maxDailyReward) {
        throw new BadRequestException('Daily task reward limit reached');
      }

      await tx.userTask.update({
        where: { id: userTaskId },
        data: {
          status: USER_TASK_STATUS.COMPLETED,
          reviewedAt: new Date(),
          reviewNote: null,
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
    // Back-compat: reject without reason
    return this.rejectSubmissionWithReason(userTaskId, undefined);
  }

  async rejectSubmissionWithReason(userTaskId: string, reason?: string) {
    const userTask = await this.prisma.userTask.findUnique({
      where: { id: userTaskId },
    });

    if (!userTask) throw new NotFoundException('User task not found');
    if (userTask.status !== USER_TASK_STATUS.SUBMITTED) {
      throw new BadRequestException('Submission is not pending review');
    }

    const task = await this.findById(userTask.taskId);
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userTask.userId },
    });

    await this.prisma.userTask.update({
      where: { id: userTaskId },
      data: {
        status: USER_TASK_STATUS.REJECTED,
        reviewedAt: new Date(),
        reviewNote: reason?.trim() ? reason.trim().slice(0, 500) : null,
      },
    });

    // Fire and forget
    this.notifications.sendTaskRejected(user.telegramId, task.title, reason);

    return { status: USER_TASK_STATUS.REJECTED };
  }
}
