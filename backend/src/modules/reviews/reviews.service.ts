import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { tierForScore } from '../../common/reputation';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async listForUser(userId: string) {
    return this.prisma.review.findMany({
      where: { targetId: userId },
      include: {
        author: {
          select: { id: true, username: true, firstName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async create(authorId: string, orderId: string, rating: number, comment?: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundException('Order not found');
      if (order.status !== 'COMPLETED') {
        throw new BadRequestException('Can only review completed orders');
      }
      if (order.buyerId !== authorId && order.sellerId !== authorId) {
        throw new ForbiddenException('Not a participant');
      }

      const targetId = order.buyerId === authorId ? order.sellerId : order.buyerId;

      const existing = await tx.review.findUnique({
        where: { orderId_authorId: { orderId, authorId } },
      });
      if (existing) throw new ConflictException('Already reviewed');

      const review = await tx.review.create({
        data: { orderId, authorId, targetId, rating, comment },
      });

      // Recompute target's average rating from all their reviews
      const agg = await tx.review.aggregate({
        where: { targetId },
        _avg: { rating: true },
        _count: { _all: true },
      });

      // Reputation delta: +5 for 5-star, +2 for 4-star, 0 otherwise
      const scoreDelta = rating === 5 ? 5 : rating === 4 ? 2 : 0;

      const target = await tx.user.findUnique({ where: { id: targetId } });
      if (target) {
        const newScore = target.reputationScore + scoreDelta;
        await tx.user.update({
          where: { id: targetId },
          data: {
            averageRating: agg._avg.rating ?? 0,
            reviewCount: agg._count._all,
            reputationScore: newScore,
            reputationTier: tierForScore(newScore),
          },
        });
      }

      return review;
    });
  }
}
