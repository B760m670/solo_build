import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const BOOST_STARS_PER_HOUR = 5;
const LIKE_REP_BONUS = 1;
const COMMENT_REP_BONUS = 3;

const AUTHOR_SELECT = {
  id: true,
  username: true,
  firstName: true,
  avatarUrl: true,
  reputationTier: true,
} as const;

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService) {}

  // ─── Feed ───

  async feed(userId: string, limit = 30, offset = 0) {
    const now = new Date();
    const posts = await this.prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [
        // Boosted posts surface first while their boost window is active
        { boostedUntil: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
      include: { author: { select: AUTHOR_SELECT } },
    });

    if (posts.length === 0) return [];

    const liked = await this.prisma.postLike.findMany({
      where: { userId, postId: { in: posts.map((p) => p.id) } },
      select: { postId: true },
    });
    const likedSet = new Set(liked.map((l) => l.postId));

    return posts.map((p) => ({
      ...p,
      likedByMe: likedSet.has(p.id),
      // Expire boost flag in the response if the window has passed
      boostedUntil: p.boostedUntil && p.boostedUntil > now ? p.boostedUntil : null,
    }));
  }

  async byUser(authorId: string, limit = 30, offset = 0) {
    return this.prisma.post.findMany({
      where: { authorId, status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: { author: { select: AUTHOR_SELECT } },
    });
  }

  // ─── Write ───

  createPost(userId: string, body: string, imageUrl?: string) {
    return this.prisma.post.create({
      data: { authorId: userId, body, imageUrl: imageUrl ?? null },
      include: { author: { select: AUTHOR_SELECT } },
    });
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('Not your post');
    await this.prisma.post.update({
      where: { id: postId },
      data: { status: 'REMOVED' },
    });
    return { ok: true };
  }

  // ─── Likes ───

  async toggleLike(userId: string, postId: string) {
    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.findUnique({ where: { id: postId } });
      if (!post || post.status !== 'PUBLISHED') {
        throw new NotFoundException('Post not found');
      }

      const existing = await tx.postLike.findUnique({
        where: { postId_userId: { postId, userId } },
      });

      if (existing) {
        await tx.postLike.delete({ where: { id: existing.id } });
        await tx.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        });
        return { liked: false };
      }

      await tx.postLike.create({ data: { postId, userId } });
      await tx.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      });
      // Reputation: author gains +1 per like received
      if (post.authorId !== userId) {
        await tx.user.update({
          where: { id: post.authorId },
          data: { reputationScore: { increment: LIKE_REP_BONUS } },
        });
      }
      return { liked: true };
    });
  }

  // ─── Comments ───

  comments(postId: string, limit = 50, offset = 0) {
    return this.prisma.postComment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async addComment(userId: string, postId: string, body: string) {
    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.findUnique({ where: { id: postId } });
      if (!post || post.status !== 'PUBLISHED') {
        throw new NotFoundException('Post not found');
      }
      const comment = await tx.postComment.create({
        data: { postId, userId, body },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              avatarUrl: true,
            },
          },
        },
      });
      await tx.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      });
      if (post.authorId !== userId) {
        await tx.user.update({
          where: { id: post.authorId },
          data: { reputationScore: { increment: COMMENT_REP_BONUS } },
        });
      }
      return comment;
    });
  }

  // ─── Boost ───

  async boost(userId: string, postId: string, hours: number) {
    const cost = hours * BOOST_STARS_PER_HOUR;
    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.findUnique({ where: { id: postId } });
      if (!post || post.status !== 'PUBLISHED') {
        throw new NotFoundException('Post not found');
      }
      if (post.authorId !== userId) {
        throw new ForbiddenException('Only the author can boost');
      }
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      if (user.starsBalance < cost) {
        throw new BadRequestException('Insufficient Stars');
      }

      const updated = await tx.user.update({
        where: { id: userId },
        data: { starsBalance: { decrement: cost } },
      });

      const now = new Date();
      const base =
        post.boostedUntil && post.boostedUntil > now ? post.boostedUntil : now;
      const boostedUntil = new Date(base.getTime() + hours * 3600_000);

      const boosted = await tx.post.update({
        where: { id: postId },
        data: { boostedUntil },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'SOCIAL_BOOST',
          currency: 'STARS',
          amount: -cost,
          balanceAfter: updated.starsBalance,
          meta: { postId, hours, boostedUntil: boostedUntil.toISOString() },
        },
      });

      return boosted;
    });
  }
}
