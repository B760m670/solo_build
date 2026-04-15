import { randomUUID } from 'crypto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StarsPurchaseType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';

const BOOST_PRICE_STARS = 200;
const BOOST_DURATION_DAYS = 7;
const PREMIUM_PRICE_STARS = 500;
const PREMIUM_DURATION_DAYS = 30;

@Injectable()
export class PurchasesService {
  constructor(
    private prisma: PrismaService,
    private telegram: TelegramService,
  ) {}

  async boostListing(userId: string, listingId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.sellerId !== userId) throw new ForbiddenException('Not your listing');

    const payload = randomUUID();
    const purchase = await this.prisma.starsPurchase.create({
      data: {
        userId,
        type: StarsPurchaseType.BOOST_LISTING,
        priceStars: BOOST_PRICE_STARS,
        invoicePayload: payload,
        listingId,
        durationDays: BOOST_DURATION_DAYS,
      },
    });

    const invoiceLink = await this.telegram.createStarsInvoiceLink({
      title: `Boost: ${listing.title}`.slice(0, 32),
      description: `Feature this listing at the top of the marketplace for ${BOOST_DURATION_DAYS} days.`,
      payload,
      priceStars: BOOST_PRICE_STARS,
    });

    return { purchase, invoiceLink };
  }

  async purchasePremium(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const payload = randomUUID();
    const purchase = await this.prisma.starsPurchase.create({
      data: {
        userId,
        type: StarsPurchaseType.PREMIUM_BADGE,
        priceStars: PREMIUM_PRICE_STARS,
        invoicePayload: payload,
        durationDays: PREMIUM_DURATION_DAYS,
      },
    });

    const invoiceLink = await this.telegram.createStarsInvoiceLink({
      title: 'Unisouq Premium',
      description: `Verified seller badge for ${PREMIUM_DURATION_DAYS} days.`,
      payload,
      priceStars: PREMIUM_PRICE_STARS,
    });

    return { purchase, invoiceLink };
  }

  /** Called from the Telegram webhook after a successful_payment whose
   *  payload matched a StarsPurchase (not an Order). */
  async fulfillByPayload(payload: string, telegramChargeId: string) {
    const purchase = await this.prisma.starsPurchase.findUnique({
      where: { invoicePayload: payload },
    });
    if (!purchase) throw new NotFoundException('Purchase not found');
    if (purchase.status !== 'PENDING') return purchase;

    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const until = new Date(now.getTime() + purchase.durationDays * 86_400_000);

      if (purchase.type === 'BOOST_LISTING' && purchase.listingId) {
        const listing = await tx.listing.findUnique({ where: { id: purchase.listingId } });
        const base =
          listing?.featuredUntil && listing.featuredUntil > now
            ? listing.featuredUntil
            : now;
        const newUntil = new Date(base.getTime() + purchase.durationDays * 86_400_000);
        await tx.listing.update({
          where: { id: purchase.listingId },
          data: { featuredUntil: newUntil },
        });
      } else if (purchase.type === 'PREMIUM_BADGE') {
        const user = await tx.user.findUnique({ where: { id: purchase.userId } });
        const base =
          user?.premiumBadgeUntil && user.premiumBadgeUntil > now
            ? user.premiumBadgeUntil
            : now;
        const newUntil = new Date(base.getTime() + purchase.durationDays * 86_400_000);
        await tx.user.update({
          where: { id: purchase.userId },
          data: { premiumBadgeUntil: newUntil },
        });
      }

      const txType =
        purchase.type === 'BOOST_LISTING' ? 'FEATURED_BOOST' : 'PREMIUM_BADGE';
      await tx.transaction.create({
        data: {
          userId: purchase.userId,
          type: txType,
          currency: 'STARS',
          amount: -purchase.priceStars,
          balanceAfter: 0,
          meta: { purchaseId: purchase.id, until: until.toISOString() },
        },
      });

      return tx.starsPurchase.update({
        where: { id: purchase.id },
        data: {
          status: 'PAID',
          telegramChargeId,
          paidAt: now,
        },
      });
    });
  }
}
