import { randomUUID } from 'crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { computeCommission, tierForScore } from '../../common/reputation';
import { TelegramService } from '../telegram/telegram.service';
import { NotificationsService } from '../telegram/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private telegram: TelegramService,
    private notifications: NotificationsService,
  ) {}

  // ─── Queries ───

  async listMine(userId: string, role: 'buyer' | 'seller' | 'all', status?: OrderStatus) {
    const where: Prisma.OrderWhereInput = {};
    if (role === 'buyer') where.buyerId = userId;
    else if (role === 'seller') where.sellerId = userId;
    else where.OR = [{ buyerId: userId }, { sellerId: userId }];
    if (status) where.status = status;

    return this.prisma.order.findMany({
      where,
      include: {
        listing: true,
        buyer: { select: { id: true, username: true, firstName: true, avatarUrl: true } },
        seller: {
          select: {
            id: true,
            username: true,
            firstName: true,
            avatarUrl: true,
            reputationTier: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(userId: string, id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        listing: true,
        buyer: { select: { id: true, username: true, firstName: true, avatarUrl: true } },
        seller: {
          select: {
            id: true,
            username: true,
            firstName: true,
            avatarUrl: true,
            reputationTier: true,
          },
        },
        reviews: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenException('Not a participant');
    }
    return order;
  }

  // ─── State machine ───

  /**
   * Create a PENDING order and return a Telegram Stars invoice link.
   * The order is promoted to PAID via `markPaidByPayload` when the bot
   * webhook receives a successful_payment update.
   */
  async place(buyerId: string, listingId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || !listing.isActive) {
      throw new NotFoundException('Listing not available');
    }
    if (listing.sellerId === buyerId) {
      throw new BadRequestException('Cannot buy your own listing');
    }

    const seller = await this.prisma.user.findUnique({ where: { id: listing.sellerId } });
    if (!seller) throw new NotFoundException('Seller not found');

    const sellerTier = tierForScore(seller.reputationScore);
    const { commissionStars, payoutStars, commissionRate } = computeCommission(
      listing.priceStars,
      sellerTier,
    );

    const payload = randomUUID();

    const order = await this.prisma.order.create({
      data: {
        listingId: listing.id,
        buyerId,
        sellerId: listing.sellerId,
        priceStars: listing.priceStars,
        commissionStars,
        payoutStars,
        commissionRate,
        status: 'PENDING',
        invoicePayload: payload,
      },
    });

    const invoiceLink = await this.telegram.createStarsInvoiceLink({
      title: listing.title,
      description: listing.description || listing.title,
      payload,
      priceStars: listing.priceStars,
    });

    return { order, invoiceLink };
  }

  /**
   * Called by the Telegram webhook on successful_payment.
   * Idempotent — replaying the same payload is a no-op.
   */
  async markPaidByPayload(payload: string, telegramChargeId: string) {
    const existing = await this.prisma.order.findUnique({ where: { invoicePayload: payload } });
    if (!existing) {
      throw new NotFoundException(`No order for payload ${payload}`);
    }
    if (existing.status !== 'PENDING') {
      return existing;
    }

    const order = await this.prisma.order.update({
      where: { id: existing.id },
      data: {
        status: 'PAID',
        telegramChargeId,
        paidAt: new Date(),
      },
    });

    // Fire-and-forget notifications (method swallows its own errors)
    void this.notifications.orderPaid(order.id);
    return order;
  }

  async accept(sellerId: string, orderId: string) {
    const order = await this.requireOrder(orderId, { sellerId });
    this.requireStatus(order.status, ['PAID']);
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'IN_PROGRESS' },
    });
  }

  async deliver(sellerId: string, orderId: string, deliverable: string) {
    const order = await this.requireOrder(orderId, { sellerId });
    this.requireStatus(order.status, ['PAID', 'IN_PROGRESS']);
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DELIVERED',
        deliverable,
        deliveredAt: new Date(),
      },
    });
    void this.notifications.orderDelivered(updated.id);
    return updated;
  }

  /**
   * Buyer confirms → internal Stars balance credited to seller minus commission.
   * Platform retains commission in the bot's Stars pool (no on-chain move).
   */
  async complete(buyerId: string, orderId: string) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundException('Order not found');
      if (order.buyerId !== buyerId) throw new ForbiddenException('Not your order');
      if (order.status !== 'DELIVERED') {
        throw new BadRequestException(`Cannot complete from status ${order.status}`);
      }

      const seller = await tx.user.update({
        where: { id: order.sellerId },
        data: {
          starsBalance: { increment: order.payoutStars },
          totalEarnedStars: { increment: order.payoutStars },
          completedDeals: { increment: 1 },
          reputationScore: { increment: 10 },
        },
      });

      await tx.user.update({
        where: { id: seller.id },
        data: { reputationTier: tierForScore(seller.reputationScore) },
      });

      const buyer = await tx.user.update({
        where: { id: buyerId },
        data: {
          completedDeals: { increment: 1 },
          reputationScore: { increment: 5 },
        },
      });
      await tx.user.update({
        where: { id: buyerId },
        data: { reputationTier: tierForScore(buyer.reputationScore) },
      });

      await tx.transaction.create({
        data: {
          userId: order.sellerId,
          type: 'SALE_INCOME',
          currency: 'STARS',
          amount: order.payoutStars,
          balanceAfter: seller.starsBalance,
          meta: { orderId: order.id, commissionStars: order.commissionStars },
        },
      });

      await tx.listing.update({
        where: { id: order.listingId },
        data: { orderCount: { increment: 1 } },
      });

      return tx.order.update({
        where: { id: order.id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    });

    void this.notifications.orderCompleted(updated.id);
    return updated;
  }

  async dispute(userId: string, orderId: string, reason: string) {
    const order = await this.requireOrder(orderId, { participant: userId });
    this.requireStatus(order.status, ['PAID', 'IN_PROGRESS', 'DELIVERED']);
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'DISPUTED', disputeReason: reason },
    });
    void this.notifications.orderDisputed(updated.id, userId);
    return updated;
  }

  /**
   * Cancel before delivery. If Stars were already paid, refund via Telegram.
   */
  async cancel(userId: string, orderId: string, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { buyer: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenException('Not a participant');
    }
    if (!['PENDING', 'PAID', 'IN_PROGRESS'].includes(order.status)) {
      throw new BadRequestException(`Cannot cancel from status ${order.status}`);
    }

    // Seller cancellation penalty
    if (userId === order.sellerId && order.status !== 'PENDING') {
      const seller = await this.prisma.user.findUnique({ where: { id: order.sellerId } });
      if (seller) {
        const newScore = Math.max(0, seller.reputationScore - 15);
        await this.prisma.user.update({
          where: { id: seller.id },
          data: {
            reputationScore: newScore,
            reputationTier: tierForScore(newScore),
          },
        });
      }
    }

    const needsRefund =
      (order.status === 'PAID' || order.status === 'IN_PROGRESS') && !!order.telegramChargeId;
    if (needsRefund) {
      await this.telegram.refundStarPayment(order.buyer.telegramId, order.telegramChargeId!);
    }

    const finalStatus: OrderStatus = order.status === 'PENDING' ? 'CANCELLED' : 'REFUNDED';
    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: finalStatus,
        cancelledAt: new Date(),
        refundedAt: needsRefund ? new Date() : null,
        disputeReason: reason ?? null,
      },
    });

    if (needsRefund) void this.notifications.orderRefunded(updated.id);
    return updated;
  }

  // ─── Helpers ───

  private async requireOrder(
    id: string,
    guard: { sellerId?: string; buyerId?: string; participant?: string },
  ) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (guard.sellerId && order.sellerId !== guard.sellerId) {
      throw new ForbiddenException('Not your order');
    }
    if (guard.buyerId && order.buyerId !== guard.buyerId) {
      throw new ForbiddenException('Not your order');
    }
    if (
      guard.participant &&
      order.buyerId !== guard.participant &&
      order.sellerId !== guard.participant
    ) {
      throw new ForbiddenException('Not a participant');
    }
    return order;
  }

  private requireStatus(actual: OrderStatus, allowed: OrderStatus[]) {
    if (!allowed.includes(actual)) {
      throw new BadRequestException(`Invalid status: ${actual}`);
    }
  }
}
