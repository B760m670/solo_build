import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { Admin } from '../../common/decorators/admin.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ConfirmTipDto, CreateTipDto } from './tips.dto';
import { TipsService } from './tips.service';

@Controller('tips')
@UseGuards(JwtAuthGuard)
export class TipsController {
  constructor(private tips: TipsService) {}

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateTipDto) {
    return this.tips.create(user.id, dto);
  }

  @Post(':id/confirm')
  confirm(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: ConfirmTipDto,
  ) {
    return this.tips.confirm(user.id, id, dto);
  }

  @Post(':id/claim')
  claim(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.tips.claim(user.id, id);
  }

  @Get('sent')
  sent(@CurrentUser() user: { id: string }, @Query('limit') limit?: string) {
    return this.tips.listSent(user.id, limit ? Number(limit) : undefined);
  }

  @Get('received')
  received(@CurrentUser() user: { id: string }, @Query('limit') limit?: string) {
    return this.tips.listReceived(user.id, limit ? Number(limit) : undefined);
  }

  @Post('expire')
  @Admin()
  @UseGuards(AdminGuard)
  expire() {
    return this.tips.expireOverdue();
  }
}
