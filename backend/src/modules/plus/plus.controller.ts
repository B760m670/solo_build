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
import { PlusService } from './plus.service';
import {
  CreatePlusPlanDto,
  SubscribePlusDto,
  UpdatePlusPlanDto,
} from './plus.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { Admin } from '../../common/decorators/admin.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('plus')
@UseGuards(JwtAuthGuard)
export class PlusController {
  constructor(private plus: PlusService) {}

  @Get('plans')
  plans() {
    return this.plus.listPlans();
  }

  @Get('me')
  me(@CurrentUser() user: { id: string }) {
    return this.plus.mySubscription(user.id);
  }

  @Post('subscribe')
  subscribe(
    @CurrentUser() user: { id: string },
    @Body() dto: SubscribePlusDto,
  ) {
    return this.plus.subscribe(user.id, dto.planId, dto.currency);
  }
}

@Controller('admin/plus')
@UseGuards(JwtAuthGuard, AdminGuard)
@Admin()
export class PlusAdminController {
  constructor(private plus: PlusService) {}

  @Post('plans')
  create(@Body() dto: CreatePlusPlanDto) {
    return this.plus.createPlan(dto);
  }

  @Patch('plans/:id')
  update(@Param('id') id: string, @Body() dto: UpdatePlusPlanDto) {
    return this.plus.updatePlan(id, dto);
  }

  @Delete('plans/:id')
  retire(@Param('id') id: string) {
    return this.plus.retirePlan(id);
  }
}
