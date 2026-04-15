import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { TelegramWebhookController } from '../telegram/telegram.webhook.controller';
import { PurchasesModule } from '../purchases/purchases.module';

@Module({
  imports: [PrismaModule, PurchasesModule],
  providers: [OrdersService],
  controllers: [OrdersController, TelegramWebhookController],
  exports: [OrdersService],
})
export class OrdersModule {}
