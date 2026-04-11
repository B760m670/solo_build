import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
// @ts-ignore
import pg from 'pg';
import dns from 'dns';

// Force IPv4 — Render free tier doesn't support IPv6
dns.setDefaultResultOrder('ipv4first');

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const pool = new pg.Pool({
      host: 'aws-1-eu-central-1.pooler.supabase.com',
      port: 6543,
      database: 'postgres',
      user: 'postgres.ksdlfjdfnptzheblempx',
      password: 'Khmrmpg@968',
      ssl: { rejectUnauthorized: false },
    });
    const adapter = new PrismaPg(pool);
    super({ adapter } as any);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
