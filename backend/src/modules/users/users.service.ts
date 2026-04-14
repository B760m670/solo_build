import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private withAdminFlag(user: {
    telegramId: bigint;
    role: string;
    [key: string]: unknown;
  }) {
    const adminIds = (this.config.get<string>('ADMIN_TELEGRAM_IDS') || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    const role = String(user.role || '').toUpperCase();
    const isRoleAdmin = role === 'ADMIN' || role === 'MODERATOR';
    const isEnvAdmin = adminIds.includes(String(user.telegramId));

    return {
      ...user,
      telegramId: Number(user.telegramId),
      isAdmin: isRoleAdmin || isEnvAdmin,
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return this.withAdminFlag(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
    });
    return this.withAdminFlag(user);
  }
}
