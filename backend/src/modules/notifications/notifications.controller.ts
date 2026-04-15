import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: { id: string }) {
    const count = await this.prisma.notification.count({
      where: { userId: user.id, readAt: null },
    });
    return { count };
  }

  @Post('read-all')
  async readAll(@CurrentUser() user: { id: string }) {
    await this.prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }

  @Post(':id/read')
  async read(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    await this.prisma.notification.updateMany({
      where: { id, userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }
}
