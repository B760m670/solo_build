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

  private async send(userId: string, text: string) {
    const chatId = await this.chatIdFor(userId);
    if (chatId) await this.telegram.sendMessage(chatId, text);
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
    );
    await this.send(
      order.buyerId,
      `<b>Payment confirmed</b>\n${order.listing.title}\nStars held in escrow until delivery.`,
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
    );
    await this.send(
      order.buyerId,
      `<b>Order closed</b>\n${order.listing.title}\nYou can now leave a review.`,
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
    );
  }
}
