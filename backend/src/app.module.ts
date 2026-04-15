import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { TonModule } from './modules/ton/ton.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { AdminModule } from './modules/admin/admin.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { HealthController } from './health.controller';
import { VersionController } from './version.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    TelegramModule,
    TonModule,
    AuthModule,
    UsersModule,
    MarketplaceModule,
    OrdersModule,
    ReviewsModule,
    TasksModule,
    WalletModule,
    ReferralsModule,
    AdminModule,
    PurchasesModule,
  ],
  controllers: [HealthController, VersionController],
})
export class AppModule {}
