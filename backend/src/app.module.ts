import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { TonModule } from './modules/ton/ton.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { GiftsModule } from './modules/gifts/gifts.module';
import { ThemesModule } from './modules/themes/themes.module';
import { PlusModule } from './modules/plus/plus.module';
import { SocialModule } from './modules/social/social.module';
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
    WalletModule,
    ReferralsModule,
    AdminModule,
    NotificationsModule,
    GiftsModule,
    ThemesModule,
    PlusModule,
    SocialModule,
  ],
  controllers: [HealthController, VersionController],
})
export class AppModule {}
