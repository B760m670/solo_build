import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../telegram/notifications.service';
import { CreateThemeDto, UpdateThemeDto } from './themes.dto';

@Injectable()
export class ThemesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // ─── Public catalog ───

  list() {
    return this.prisma.theme.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  myThemes(userId: string) {
    return this.prisma.userTheme.findMany({
      where: { userId },
      include: { theme: true },
      orderBy: { acquiredAt: 'desc' },
    });
  }

  // ─── Purchase ───

  async buy(userId: string, themeId: string, currency: 'STARS' | 'TON') {
    return this.prisma.$transaction(async (tx) => {
      const theme = await tx.theme.findUnique({ where: { id: themeId } });
      if (!theme || !theme.isActive) throw new NotFoundException('Theme not available');

      const existing = await tx.userTheme.findUnique({
        where: { userId_themeId: { userId, themeId } },
      });
      if (existing) throw new BadRequestException('Theme already owned');

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      if (theme.plusOnly) {
        const now = new Date();
        if (!user.premiumBadgeUntil || user.premiumBadgeUntil < now) {
          throw new BadRequestException('Theme is Plus-only');
        }
      }

      let balanceAfter: number;
      let amount: number;

      if (currency === 'STARS') {
        if (theme.priceStars == null) throw new BadRequestException('Theme not sold for Stars');
        if (user.starsBalance < theme.priceStars) {
          throw new BadRequestException('Insufficient Stars');
        }
        amount = theme.priceStars;
        const updated = await tx.user.update({
          where: { id: userId },
          data: { starsBalance: { decrement: amount } },
        });
        balanceAfter = updated.starsBalance;
      } else {
        if (theme.priceTon == null) throw new BadRequestException('Theme not sold for TON');
        if (user.tonBalance < theme.priceTon) {
          throw new BadRequestException('Insufficient TON');
        }
        amount = theme.priceTon;
        const updated = await tx.user.update({
          where: { id: userId },
          data: { tonBalance: { decrement: amount } },
        });
        balanceAfter = updated.tonBalance;
      }

      const userTheme = await tx.userTheme.create({
        data: { userId, themeId },
        include: { theme: true },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'THEME_PURCHASE',
          currency,
          amount: -amount,
          balanceAfter,
          meta: { themeId },
        },
      });

      return userTheme;
    }).then(async (userTheme) => {
      await this.notifications.themeUnlocked(userId, userTheme.theme.name);
      return userTheme;
    });
  }

  // ─── Activation ───

  async activate(userId: string, themeId: string | null) {
    if (themeId) {
      const owned = await this.prisma.userTheme.findUnique({
        where: { userId_themeId: { userId, themeId } },
      });
      if (!owned) throw new BadRequestException('Theme not owned');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { activeThemeId: themeId },
      select: { activeThemeId: true },
    });
  }

  // ─── Admin CRUD ───

  create(dto: CreateThemeDto) {
    return this.prisma.theme.create({ data: dto });
  }

  update(id: string, dto: UpdateThemeDto) {
    return this.prisma.theme.update({ where: { id }, data: dto });
  }

  retire(id: string) {
    return this.prisma.theme.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
