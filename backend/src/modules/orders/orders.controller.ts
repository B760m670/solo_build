import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';
import {
  CancelOrderDto,
  CreateOrderDto,
  DeliverOrderDto,
  DisputeOrderDto,
} from './order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Get()
  mine(
    @CurrentUser() user: { id: string },
    @Query('role') role: 'buyer' | 'seller' | 'all' = 'all',
    @Query('status') status?: OrderStatus,
  ) {
    return this.orders.listMine(user.id, role, status);
  }

  @Get(':id')
  getOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.orders.getById(user.id, id);
  }

  @Post()
  place(@CurrentUser() user: { id: string }, @Body() dto: CreateOrderDto) {
    return this.orders.place(user.id, dto.listingId);
  }

  @Post(':id/accept')
  accept(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.orders.accept(user.id, id);
  }

  @Post(':id/deliver')
  deliver(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: DeliverOrderDto,
  ) {
    return this.orders.deliver(user.id, id, dto.deliverable);
  }

  @Post(':id/complete')
  complete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.orders.complete(user.id, id);
  }

  @Post(':id/dispute')
  dispute(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: DisputeOrderDto,
  ) {
    return this.orders.dispute(user.id, id, dto.reason);
  }

  @Post(':id/cancel')
  cancel(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.orders.cancel(user.id, id, dto.reason);
  }
}
