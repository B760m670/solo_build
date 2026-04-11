import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    const checks: Record<string, string> = { api: 'ok' };

    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
      checks.database = 'ok';
    } catch (e) {
      checks.database = `error: ${e instanceof Error ? e.message : String(e)}`;
    }

    try {
      const count = await this.prisma.user.count();
      checks.users = `${count} users in DB`;
    } catch (e) {
      checks.users = `error: ${e instanceof Error ? e.message : String(e)}`;
    }

    // Show masked DB host for debugging
    const dbUrl = process.env.DATABASE_URL || '';
    const hostMatch = dbUrl.match(/@([^:/]+):(\d+)/);
    const dbHost = hostMatch ? `${hostMatch[1]}:${hostMatch[2]}` : 'unknown';

    return { status: checks.database === 'ok' ? 'ok' : 'degraded', checks, dbHost, uptime: process.uptime() };
  }
}
