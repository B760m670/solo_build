import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GiftsService } from './gifts.service';
import { BuyGiftDto, CreateGiftDto, UpdateGiftDto } from './gifts.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { Admin } from '../../common/decorators/admin.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('gifts')
@UseGuards(JwtAuthGuard)
export class GiftsController {
  constructor(private gifts: GiftsService) {}

  @Get()
  list() {
    return this.gifts.list();
  }

  @Get('mine')
  mine(@CurrentUser() user: { id: string }) {
    return this.gifts.myInventory(user.id);
  }

  @Post(':id/buy')
  buy(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: BuyGiftDto,
  ) {
    return this.gifts.buy(user.id, id, dto.currency);
  }
}

@Controller('admin/gifts')
@UseGuards(JwtAuthGuard, AdminGuard)
@Admin()
export class GiftsAdminController {
  constructor(private gifts: GiftsService) {}

  @Post()
  create(@Body() dto: CreateGiftDto) {
    return this.gifts.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGiftDto) {
    return this.gifts.update(id, dto);
  }

  @Delete(':id')
  retire(@Param('id') id: string) {
    return this.gifts.retire(id);
  }
}
