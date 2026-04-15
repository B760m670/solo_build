import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramValidator, TelegramUserData } from './telegram.validator';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private telegramValidator: TelegramValidator,
  ) {}

  async login(initData: string, referralCode?: string) {
    const telegramUser = this.telegramValidator.validate(initData);
    const user = await this.findOrCreateUser(telegramUser, referralCode);
    const accessToken = this.jwt.sign({
      sub: user.id,
      telegramId: Number(user.telegramId),
    });

    return {
      accessToken,
      user: this.serializeUser(user),
    };
  }

  private async findOrCreateUser(
    telegramUser: TelegramUserData,
    referralCode?: string,
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramUser.id) },
    });

    if (existing) {
      return this.prisma.user.update({
        where: { id: existing.id },
        data: {
          username: telegramUser.username || existing.username,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name || existing.lastName,
          avatarUrl: telegramUser.photo_url || existing.avatarUrl,
        },
      });
    }

    let referredById: string | undefined;
    if (referralCode) {
      const referrer = await this.prisma.user.findUnique({
        where: { referralCode },
      });
      if (referrer) referredById = referrer.id;
    }

    return this.prisma.user.create({
      data: {
        telegramId: BigInt(telegramUser.id),
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        avatarUrl: telegramUser.photo_url,
        referredById,
      },
    });
  }

  private serializeUser(user: Record<string, unknown>) {
    return {
      ...user,
      telegramId: Number(user.telegramId),
    };
  }
}
