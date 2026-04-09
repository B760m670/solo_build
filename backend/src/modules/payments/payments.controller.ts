import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsIn } from 'class-validator';

class CreateInvoiceDto {
  @IsIn(['PREMIUM_MONTHLY', 'PREMIUM_YEARLY'])
  type!: 'PREMIUM_MONTHLY' | 'PREMIUM_YEARLY';
}

interface TelegramUpdate {
  pre_checkout_query?: {
    id: string;
    from: { id: number };
    invoice_payload: string;
    total_amount: number;
    currency: string;
  };
  message?: {
    successful_payment?: {
      currency: string;
      total_amount: number;
      invoice_payload: string;
    };
    from?: { id: number };
  };
}

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private paymentsService: PaymentsService) {}

  @Post('invoice')
  @UseGuards(JwtAuthGuard)
  createInvoice(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.paymentsService.createInvoice(userId, dto.type);
  }

  @Post('webhook')
  async webhook(@Body() body: TelegramUpdate) {
    // Handle pre_checkout_query
    if (body.pre_checkout_query) {
      this.logger.log(`Pre-checkout query from user ${body.pre_checkout_query.from.id}`);
      await this.paymentsService.handlePreCheckout(body.pre_checkout_query.id);
      return { ok: true };
    }

    // Handle successful_payment
    if (body.message?.successful_payment) {
      const payment = body.message.successful_payment;
      const telegramId = body.message.from?.id;

      if (telegramId) {
        this.logger.log(`Successful payment from user ${telegramId}: ${payment.total_amount} ${payment.currency}`);

        try {
          const payload = JSON.parse(payment.invoice_payload);
          await this.paymentsService.handleSuccessfulPayment(
            BigInt(telegramId),
            payload.type || 'PREMIUM_MONTHLY',
            payment.total_amount,
          );
        } catch (error) {
          this.logger.error('Failed to process payment', error);
        }
      }
    }

    return { ok: true };
  }
}
