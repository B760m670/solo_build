import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { TonService } from '../ton/ton.service';
import { TelegramService } from '../telegram/telegram.service';
import { ConfirmTipDto, CreateTipDto } from './tips.dto';

const DEFAULT_ESCROW_DAYS = 7;
const DEFAULT_FEE_RATE = 0.01;

@Injectable()
export class TipsService {
  private readonly logger = new Logger(TipsService.name);

  constructor(
    private prisma: PrismaService,
    private ton: TonService,
    private config: ConfigService,
    private telegram: TelegramService,
  ) {}

  private async notifyRecipientOfNewTip(tipId: string) {
    const tip = await this.prisma.tip.findUnique({
      where: { id: tipId },
      include: {
        sender: { select: { username: true, firstName: true } },
        recipient: { select: { telegramId: true } },
      },
    });
    if (!tip) return;
    const chatId = tip.recipient?.telegramId ?? tip.recipientTelegramId;
    if (!chatId) return;

    const from = tip.sender.username ? `@${tip.sender.username}` : tip.sender.firstName;
    const verb = tip.viaEscrow ? 'is waiting' : 'just arrived';
    await this.telegram.sendMessage(
      chatId,
      `You've got a tip of <b>${tip.netTon} TON</b> from ${from}. It ${verb}.`,
    );
  }

  private async notifySenderOfClaim(tipId: string) {
    const tip = await this.prisma.tip.findUnique({
      where: { id: tipId },
      include: {
        sender: { select: { telegramId: true } },
        recipient: { select: { username: true, firstName: true } },
      },
    });
    if (!tip) return;
    const target = tip.recipient?.username
      ? `@${tip.recipient.username}`
      : tip.recipient?.firstName ?? 'the recipient';
    await this.telegram.sendMessage(
      tip.sender.telegramId,
      `<b>${target}</b> claimed your tip of <b>${tip.netTon} TON</b>.`,
    );
  }

  private async notifySenderOfRefund(tipId: string) {
    const tip = await this.prisma.tip.findUnique({
      where: { id: tipId },
      include: {
        sender: { select: { telegramId: true } },
      },
    });
    if (!tip) return;
    const target = tip.recipientUsername
      ? `@${tip.recipientUsername}`
      : 'the recipient';
    await this.telegram.sendMessage(
      tip.sender.telegramId,
      `Your <b>${tip.netTon} TON</b> tip to ${target} expired unclaimed and was refunded.`,
    );
  }

  private escrowDays(): number {
    const raw = this.config.get<string>('TIP_ESCROW_DAYS');
    const n = raw ? Number(raw) : DEFAULT_ESCROW_DAYS;
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_ESCROW_DAYS;
  }

  private feeRate(): number {
    const raw = this.config.get<string>('TIP_FEE_RATE');
    const n = raw ? Number(raw) : DEFAULT_FEE_RATE;
    return Number.isFinite(n) && n >= 0 && n < 1 ? n : DEFAULT_FEE_RATE;
  }

  async create(senderId: string, dto: CreateTipDto) {
    if (!dto.recipientUsername && !dto.recipientTelegramId) {
      throw new BadRequestException('Recipient required');
    }

    const existing = await this.prisma.tip.findUnique({
      where: {
        senderId_idempotencyKey: { senderId, idempotencyKey: dto.idempotencyKey },
      },
    });
    if (existing) {
      return this.hydrateDestination(existing);
    }

    let recipientId: string | null = null;
    let recipientTgId: bigint | null = null;
    let recipientAddress: string | null = null;

    if (dto.recipientTelegramId) {
      try {
        recipientTgId = BigInt(dto.recipientTelegramId);
      } catch {
        throw new BadRequestException('Invalid recipientTelegramId');
      }
    }

    const recipient = await this.prisma.user.findFirst({
      where: dto.recipientUsername
        ? { username: dto.recipientUsername }
        : { telegramId: recipientTgId! },
      select: { id: true, telegramId: true, tonAddress: true, username: true },
    });
    if (recipient) {
      recipientId = recipient.id;
      recipientTgId = recipient.telegramId;
      recipientAddress = recipient.tonAddress;
    }

    const viaEscrow = !recipientAddress;

    const fee = +(dto.amountTon * this.feeRate()).toFixed(6);
    const net = +(dto.amountTon - fee).toFixed(6);
    const expiresAt = new Date(Date.now() + this.escrowDays() * 86_400_000);

    const tip = await this.prisma.tip.create({
      data: {
        senderId,
        recipientId,
        recipientTelegramId: recipientTgId,
        recipientUsername: dto.recipientUsername ?? recipient?.username ?? null,
        amountTon: dto.amountTon,
        feeTon: fee,
        netTon: net,
        note: dto.note,
        status: 'PENDING_SIGN',
        viaEscrow,
        expiresAt,
        idempotencyKey: dto.idempotencyKey,
      },
    });

    // Fire-and-forget notification — we want the recipient to know a tip is
    // pending even before the sender actually signs. Failing to DM shouldn't
    // block the create call.
    void this.notifyRecipientOfNewTip(tip.id).catch((err) => {
      this.logger.warn(`notifyRecipientOfNewTip failed: ${(err as Error).message}`);
    });

    return this.hydrateDestination(tip);
  }

  private async hydrateDestination(tip: {
    id: string;
    viaEscrow: boolean;
    recipientId: string | null;
    amountTon: number;
    netTon: number;
    note: string | null;
  }) {
    let destination: string;
    if (tip.viaEscrow) {
      destination = await this.ton.platformAddress();
    } else {
      const recipient = await this.prisma.user.findUnique({
        where: { id: tip.recipientId ?? '' },
        select: { tonAddress: true },
      });
      if (!recipient?.tonAddress) {
        // Recipient unlinked between create and confirm — fall back to escrow.
        destination = await this.ton.platformAddress();
      } else {
        destination = recipient.tonAddress;
      }
    }
    return {
      tipId: tip.id,
      destination,
      amountTon: tip.amountTon,
      viaEscrow: tip.viaEscrow,
      comment: `tip:${tip.id}`,
    };
  }

  async confirm(senderId: string, tipId: string, dto: ConfirmTipDto) {
    const tip = await this.prisma.tip.findUnique({ where: { id: tipId } });
    if (!tip) throw new NotFoundException('Tip not found');
    if (tip.senderId !== senderId) throw new NotFoundException('Tip not found');
    if (tip.status !== 'PENDING_SIGN') {
      return tip;
    }

    const nextStatus = tip.viaEscrow ? 'PENDING_CLAIM' : 'CLAIMED';
    return this.prisma.tip.update({
      where: { id: tipId },
      data: {
        sendTxHash: dto.sendTxHash,
        confirmedAt: new Date(),
        status: nextStatus,
        claimedAt: nextStatus === 'CLAIMED' ? new Date() : null,
      },
    });
  }

  listSent(senderId: string, limit = 50) {
    return this.prisma.tip.findMany({
      where: { senderId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async listReceived(userId: string, limit = 50) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { telegramId: true },
    });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.tip.findMany({
      where: {
        OR: [
          { recipientId: userId },
          { recipientTelegramId: user.telegramId, recipientId: null },
        ],
        status: { in: ['PENDING_CLAIM', 'CLAIMED'] },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async claim(userId: string, tipId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, telegramId: true, tonAddress: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (!user.tonAddress) {
      throw new BadRequestException('Link a TON address before claiming');
    }

    const tip = await this.prisma.tip.findUnique({ where: { id: tipId } });
    if (!tip) throw new NotFoundException('Tip not found');
    if (tip.status !== 'PENDING_CLAIM') {
      throw new BadRequestException(`Tip cannot be claimed in status ${tip.status}`);
    }

    const belongsToUser =
      tip.recipientId === user.id ||
      (tip.recipientId === null && tip.recipientTelegramId === user.telegramId);
    if (!belongsToUser) throw new NotFoundException('Tip not found');

    // Backfill recipientId if the tip was created before the user existed.
    if (!tip.recipientId) {
      await this.prisma.tip.update({
        where: { id: tipId },
        data: { recipientId: user.id },
      });
    }

    // Dispatch escrow payout. If this throws, state stays PENDING_CLAIM and
    // the user can retry. The unique fee/net guards against double-spend
    // because CLAIMED transitions are checked above.
    let claimTxHash: string;
    try {
      const result = await this.ton.sendTon({
        destination: user.tonAddress,
        amountTon: tip.netTon,
        comment: `tip:${tip.id}`,
      });
      claimTxHash = `seqno:${result.seqno}`;
    } catch (err) {
      this.logger.error(`Escrow payout failed for tip ${tip.id}`, err as Error);
      throw new BadRequestException('Payout dispatch failed — try again');
    }

    const updated = await this.prisma.tip.update({
      where: { id: tipId },
      data: {
        status: 'CLAIMED',
        claimedAt: new Date(),
        claimTxHash,
      },
    });

    void this.notifySenderOfClaim(updated.id).catch((err) => {
      this.logger.warn(`notifySenderOfClaim failed: ${(err as Error).message}`);
    });

    return updated;
  }

  /**
   * Cron-friendly expiry sweep. Marks PENDING_CLAIM tips past `expiresAt` as
   * EXPIRED, then attempts to refund each. Idempotent per tip.
   */
  async expireOverdue(now = new Date()) {
    const overdue = await this.prisma.tip.findMany({
      where: {
        status: 'PENDING_CLAIM',
        viaEscrow: true,
        expiresAt: { lte: now },
      },
      take: 50,
    });

    const results: Array<{ id: string; status: string; error?: string }> = [];

    for (const tip of overdue) {
      await this.prisma.tip.update({
        where: { id: tip.id },
        data: { status: 'EXPIRED' },
      });

      const sender = await this.prisma.user.findUnique({
        where: { id: tip.senderId },
        select: { tonAddress: true },
      });
      if (!sender?.tonAddress) {
        results.push({ id: tip.id, status: 'EXPIRED', error: 'sender unlinked' });
        continue;
      }

      try {
        const result = await this.ton.sendTon({
          destination: sender.tonAddress,
          amountTon: tip.netTon,
          comment: `tip-refund:${tip.id}`,
        });
        await this.prisma.tip.update({
          where: { id: tip.id },
          data: {
            status: 'REFUNDED',
            refundedAt: new Date(),
            refundTxHash: `seqno:${result.seqno}`,
          },
        });
        void this.notifySenderOfRefund(tip.id).catch((err) => {
          this.logger.warn(`notifySenderOfRefund failed: ${(err as Error).message}`);
        });
        results.push({ id: tip.id, status: 'REFUNDED' });
      } catch (err) {
        this.logger.error(`Refund failed for tip ${tip.id}`, err as Error);
        results.push({ id: tip.id, status: 'EXPIRED', error: (err as Error).message });
      }
    }

    return { swept: overdue.length, results };
  }
}
