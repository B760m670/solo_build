import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { Admin } from '../../common/decorators/admin.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@Admin()
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.admin.dashboard();
  }

  @Get('withdrawals/pending')
  pendingWithdrawals() {
    return this.admin.pendingWithdrawals();
  }

  @Post('withdrawals/:id/process')
  processWithdrawal(@Param('id') id: string) {
    return this.admin.processWithdrawal(id);
  }
}
