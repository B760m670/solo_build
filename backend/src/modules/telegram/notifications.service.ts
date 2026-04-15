import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramService } from './telegram.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private telegram: TelegramService,
  ) {}

  private async chatIdFor(userId: string): Promise<bigint | null> {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { telegramId: true },
    });
    return u?.telegramId ?? null;
  }

  private async send(
    userId: string,
    text: string,
    inApp?: { type: string; title: string; body: string },
  ) {
    if (inApp) {
      try {
        await this.prisma.notification.create({
          data: {
            userId,
            type: inApp.type,
            title: inApp.title,
            body: inApp.body,
          },
        });
      } catch {
        // in-app notifications are best-effort
      }
    }
    const chatId = await this.chatIdFor(userId);
    if (chatId) {
      try {
        await this.telegram.sendMessage(chatId, text);
      } catch {
        // telegram send failures must never break business flow
      }
    }
  }

  // ─── Order lifecycle ───

  async orderPaid(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: true, buyer: true, seller: true },
    });
    if (!order) return;
    await this.send(
      order.sellerId,
      `<b>New order received</b>\n${order.listing.title}\nBuyer: ${order.buyer.firstName}\nAmount: ${order.priceStars} ★\n\nOpen Unisouq to accept.`,
      {
        type: 'ORDER_PAID_SELLER',
        title: 'New order received',
        body: `${order.listing.title} · ${order.priceStars} ★ from ${order.buyer.firstName}`,
      },
    );
    await this.send(
      order.buyerId,
      `<b>Payment confirmed</b>\n${order.listing.title}\nStars held in escrow until delivery.`,
      {
        type: 'ORDER_PAID_BUYER',
        title: 'Payment confirmed',
        body: `${order.listing.title} — Stars held in escrow`,
      },
    );
  }

  async orderDelivered(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: true },
    });
    if (!order) return;
    await this.send(
      order.buyerId,
      `<b>Order delivered</b>\n${order.listing.title}\nReview the delivery and confirm to release Stars to the seller.`,
      {
        type: 'ORDER_DELIVERED',
        title: 'Order delivered',
        body: `${order.listing.title} — confirm to release Stars`,
      },
    );
  }

  async orderCompleted(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: true },
    });
    if (!order) return;
    await this.send(
      order.sellerId,
      `<b>Order completed</b>\n${order.listing.title}\nCredited: ${order.payoutStars} ★ (commission ${order.commissionStars} ★)`,
      {
        type: 'ORDER_COMPLETED_SELLER',
        title: `+${order.payoutStars} ★ credited`,
        body: `${order.listing.title} (commission ${order.commissionStars} ★)`,
      },
    );
    await this.send(
      order.buyerId,
      `<b>Order closed</b>\n${order.listing.title}\nYou can now leave a review.`,
      {
        type: 'ORDER_COMPLETED_BUYER',
        title: 'Order closed',
        body: `${order.listing.title} — you can leave a review`,
      },
    );
  }

  async orderDisputed(orderId: string, openedBy: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: true },
    });
    if (!order) return;
    const counterparty = openedBy === order.buyerId ? order.sellerId : order.buyerId;
    await this.send(
      counterparty,
      `<b>Dispute opened</b>\n${order.listing.title}\nReason: ${order.disputeReason ?? '—'}\nAdmins have been notified.`,
      {
        type: 'ORDER_DISPUTED',
        title: 'Dispute opened',
        body: `${order.listing.title} · ${order.disputeReason ?? '—'}`,
      },
    );
  }

  async orderRefunded(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: true },
    });
    if (!order) return;
    await this.send(
      order.buyerId,
      `<b>Refund processed</b>\n${order.listing.title}\n${order.priceStars} ★ returned to your Telegram Stars balance.`,
      {
        type: 'ORDER_REFUNDED',
        title: 'Refund processed',
        body: `${order.listing.title} · ${order.priceStars} ★ returned`,
      },
    );
  }

  async taskApproved(userTaskId: string) {
    const ut = await this.prisma.userTask.findUnique({
      where: { id: userTaskId },
      include: { task: true },
    });
    if (!ut) return;
    await this.send(
      ut.userId,
      `<b>Task approved</b>\n${ut.task.brandName} — ${ut.task.title}\n+${ut.task.rewardStars} ★ credited.`,
      {
        type: 'TASK_APPROVED',
        title: `+${ut.task.rewardStars} ★ task reward`,
        body: `${ut.task.brandName} — ${ut.task.title}`,
      },
    );
  }

  async taskRejected(userTaskId: string) {
    const ut = await this.prisma.userTask.findUnique({
      where: { id: userTaskId },
      include: { task: true },
    });
    if (!ut) return;
    await this.send(
      ut.userId,
      `<b>Task rejected</b>\n${ut.task.brandName} — ${ut.task.title}\nReason: ${ut.rejectReason ?? '—'}\nYou can resubmit.`,
      {
        type: 'TASK_REJECTED',
        title: 'Task rejected',
        body: `${ut.task.brandName} — ${ut.task.title} · ${ut.rejectReason ?? '—'}`,
      },
    );
  }
}
