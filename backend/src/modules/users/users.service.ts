import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.serialize(user);
  }

  async updateSettings(
    userId: string,
    data: { language?: string; theme?: string; tonAddress?: string },
  ) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    return this.serialize(updated);
  }

  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        avatarUrl: true,
        reputationScore: true,
        reputationTier: true,
        completedDeals: true,
        averageRating: true,
        reviewCount: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private serialize(user: Record<string, unknown>) {
    return { ...user, telegramId: Number(user.telegramId) };
  }
}
