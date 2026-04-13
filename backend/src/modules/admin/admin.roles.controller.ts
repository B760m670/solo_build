import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { Admin } from '../../common/decorators/admin.decorator';
import { SuperAdmin } from '../../common/decorators/superadmin.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('admin/roles')
@UseGuards(JwtAuthGuard, AdminGuard)
@Admin()
export class AdminRolesController {
  constructor(private prisma: PrismaService) {}

  @Get('admins')
  listAdmins() {
    return this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'MODERATOR'] } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        role: true,
        createdAt: true,
      },
    }).then((rows) =>
      rows.map((u) => ({
        ...u,
        telegramId: Number(u.telegramId),
      })),
    );
  }

  @Patch('users/:id')
  @SuperAdmin()
  setUserRole(
    @Param('id') userId: string,
    @Body() body: { role: 'USER' | 'ADMIN' | 'MODERATOR' },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: body.role },
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        role: true,
      },
    }).then((u) => ({ ...u, telegramId: Number(u.telegramId) }));
  }
}

