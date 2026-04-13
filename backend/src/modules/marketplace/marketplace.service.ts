import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TasksService } from '../tasks/tasks.service';

type TxClient = Prisma.TransactionClient;
import { CreateListingDto, UpdateListingDto } from './listing.dto';

const COMMISSION_RATE = 0.03;

@Injectable()
export class MarketplaceService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private tasksService: TasksService,
  ) {}

  async findAll(search?: string, category?: string) {
    return this.prisma.listing.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        seller: {
          select: { id: true, username: true, firstName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        seller: {
          select: { id: true, username: true, firstName: true, avatarUrl: true },
        },
      },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async create(sellerId: string, dto: CreateListingDto) {
    const listing = await this.prisma.listing.create({
      data: { ...dto, sellerId },
    });

    // Fire and forget: auto-complete "first listing" tasks if started.
    this.tasksService.autoCompleteActiveTasks(sellerId, 'AUTO_FIRST_LISTING');

    return listing;
  }

  async update(userId: string, listingId: string, dto: UpdateListingDto) {
    const listing = await this.findById(listingId);
    if (listing.sellerId !== userId) {
      throw new ForbiddenException('Not your listing');
    }
    return this.prisma.listing.update({
      where: { id: listingId },
      data: dto,
    });
  }

  async remove(userId: string, listingId: string) {
    const listing = await this.findById(listingId);
    if (listing.sellerId !== userId) {
      throw new ForbiddenException('Not your listing');
    }
    return this.prisma.listing.update({
      where: { id: listingId },
      data: { isActive: false },
    });
  }

  async buy(buyerId: string, listingId: string) {
    const listing = await this.findById(listingId);

    if (listing.sellerId === buyerId) {
      throw new BadRequestException('Cannot buy your own listing');
    }

    const order = await this.prisma.$transaction(async (tx: TxClient) => {
      const buyer = await tx.user.findUniqueOrThrow({
        where: { id: buyerId },
      });

      if (buyer.brbBalance < listing.price) {
        throw new BadRequestException('Insufficient BRB balance');
      }

      const commission = listing.price * COMMISSION_RATE;
      const sellerAmount = listing.price - commission;

      const seller = await tx.user.findUniqueOrThrow({
        where: { id: listing.sellerId },
      });

      // Deduct from buyer
      await tx.user.update({
        where: { id: buyerId },
        data: { brbBalance: { decrement: listing.price } },
      });

      // Credit seller (minus commission)
      await tx.user.update({
        where: { id: listing.sellerId },
        data: {
          brbBalance: { increment: sellerAmount },
          totalEarned: { increment: sellerAmount },
        },
      });

      // Create order
      const order = await tx.order.create({
        data: {
          buyerId,
          listingId,
          amount: listing.price,
          commission,
          status: 'COMPLETED',
        },
      });

      // Buyer transaction
      await tx.transaction.create({
        data: {
          userId: buyerId,
          type: 'MARKETPLACE_PURCHASE',
          amount: -listing.price,
          balanceBefore: buyer.brbBalance,
          balanceAfter: buyer.brbBalance - listing.price,
          meta: { listingId, listingTitle: listing.title },
        },
      });

      // Seller transaction
      await tx.transaction.create({
        data: {
          userId: listing.sellerId,
          type: 'MARKETPLACE_SALE',
          amount: sellerAmount,
          balanceBefore: seller.brbBalance,
          balanceAfter: seller.brbBalance + sellerAmount,
          meta: { listingId, listingTitle: listing.title, commission },
        },
      });

      // Notify seller
      this.notifications.sendMarketplaceSale(
        seller.telegramId,
        listing.title,
        sellerAmount,
      );

      return order;
    });

    // Fire and forget: auto-complete "first purchase" tasks if started.
    this.tasksService.autoCompleteActiveTasks(buyerId, 'AUTO_FIRST_PURCHASE');

    return order;
  }

  async getMyListings(sellerId: string) {
    return this.prisma.listing.findMany({
      where: { sellerId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
