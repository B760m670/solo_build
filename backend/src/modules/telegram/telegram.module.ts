import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TipsModule } from '../tips/tips.module';
import { TelegramService } from './telegram.service';
import { NotificationsService } from './notifications.service';
import { TelegramWebhookController } from './telegram.webhook.controller';

@Global()
@Module({
  imports: [PrismaModule, TipsModule],
  controllers: [TelegramWebhookController],
  providers: [TelegramService, NotificationsService],
  exports: [TelegramService, NotificationsService],
})
export class TelegramModule {}
