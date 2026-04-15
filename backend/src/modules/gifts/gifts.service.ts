import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../telegram/notifications.service';
import { CreateGiftDto, UpdateGiftDto } from './gifts.dto';

@Injectable()
export class GiftsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // ─── Public catalog ───

  list() {
    return this.prisma.gift.findMany({
      where: { isActive: true },
      orderBy: [{ rarity: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async myInventory(userId: string) {
    return this.prisma.userGift.findMany({
      where: { userId },
      include: { gift: true },
      orderBy: { acquiredAt: 'desc' },
    });
  }

  // ─── Purchase ───

  async buy(userId: string, giftId: string, currency: 'STARS' | 'TON') {
    return this.prisma.$transaction(async (tx) => {
      const gift = await tx.gift.findUnique({ where: { id: giftId } });
      if (!gift || !gift.isActive) throw new NotFoundException('Gift not available');

      if (gift.editionSize != null && gift.editionMinted >= gift.editionSize) {
        throw new BadRequestException('Edition sold out');
      }

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      let balanceAfter: number;
      let amount: number;

      if (currency === 'STARS') {
        if (gift.priceStars == null) throw new BadRequestException('Gift not sold for Stars');
        if (user.starsBalance < gift.priceStars) {
          throw new BadRequestException('Insufficient Stars');
        }
        amount = gift.priceStars;
        const updated = await tx.user.update({
          where: { id: userId },
          data: { starsBalance: { decrement: amount } },
        });
        balanceAfter = updated.starsBalance;
      } else {
        if (gift.priceTon == null) throw new BadRequestException('Gift not sold for TON');
        if (user.tonBalance < gift.priceTon) {
          throw new BadRequestException('Insufficient TON');
        }
        amount = gift.priceTon;
        const updated = await tx.user.update({
          where: { id: userId },
          data: { tonBalance: { decrement: amount } },
        });
        balanceAfter = updated.tonBalance;
      }

      const minted = await tx.gift.update({
        where: { id: giftId },
        data: { editionMinted: { increment: 1 } },
      });

      const userGift = await tx.userGift.create({
        data: {
          userId,
          giftId,
          serialNo: minted.editionMinted,
        },
        include: { gift: true },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'GIFT_PURCHASE',
          currency,
          amount: -amount,
          balanceAfter,
          meta: { giftId, serialNo: userGift.serialNo },
        },
      });

      return userGift;
    }).then(async (userGift) => {
      await this.notifications.giftAcquired(userId, userGift.gift.name);
      return userGift;
    });
  }

  // ─── Admin CRUD (guarded at controller level) ───

  create(dto: CreateGiftDto) {
    return this.prisma.gift.create({ data: dto });
  }

  update(id: string, dto: UpdateGiftDto) {
    return this.prisma.gift.update({ where: { id }, data: dto });
  }

  retire(id: string) {
    return this.prisma.gift.update({ where: { id }, data: { isActive: false } });
  }
}
