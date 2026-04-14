import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { ServicesModule } from './modules/services/services.module';
import { HealthController } from './health.controller';
import { VersionController } from './version.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    NotificationsModule,
    AuthModule,
    UsersModule,
    TasksModule,
    MarketplaceModule,
    WalletModule,
    PaymentsModule,
    ReferralsModule,
    AdminModule,
    ServicesModule,
  ],
  controllers: [HealthController, VersionController],
})
export class AppModule {}
