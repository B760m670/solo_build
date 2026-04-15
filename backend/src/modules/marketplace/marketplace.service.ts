import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListingCategory, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateListingDto, UpdateListingDto } from './listing.dto';

const SELLER_SELECT = {
  id: true,
  username: true,
  firstName: true,
  avatarUrl: true,
  reputationTier: true,
  reputationScore: true,
  averageRating: true,
  reviewCount: true,
} as const;

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  async list(params: {
    category?: ListingCategory;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.ListingWhereInput = { isActive: true };
    if (params.category) where.category = params.category;
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const listings = await this.prisma.listing.findMany({
      where,
      include: { seller: { select: SELLER_SELECT } },
      orderBy: [{ featuredUntil: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
      take: params.limit ?? 30,
      skip: params.offset ?? 0,
    });

    return listings;
  }

  async getById(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { seller: { select: SELLER_SELECT } },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async mine(sellerId: string) {
    return this.prisma.listing.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(sellerId: string, dto: CreateListingDto) {
    return this.prisma.listing.create({
      data: {
        sellerId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        priceStars: dto.priceStars,
        deliveryDays: dto.deliveryDays,
        coverImage: dto.coverImage,
        images: dto.images ?? [],
      },
    });
  }

  async update(sellerId: string, id: string, dto: UpdateListingDto) {
    const existing = await this.prisma.listing.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Listing not found');
    if (existing.sellerId !== sellerId) {
      throw new ForbiddenException('Not your listing');
    }
    return this.prisma.listing.update({ where: { id }, data: dto });
  }

  async remove(sellerId: string, id: string) {
    const existing = await this.prisma.listing.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Listing not found');
    if (existing.sellerId !== sellerId) {
      throw new ForbiddenException('Not your listing');
    }
    await this.prisma.listing.update({
      where: { id },
      data: { isActive: false },
    });
    return { ok: true };
  }
}
