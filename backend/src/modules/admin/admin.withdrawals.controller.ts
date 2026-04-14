import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { Admin } from '../../common/decorators/admin.decorator';
import { WalletService } from '../wallet/wallet.service';

@Controller('admin/withdrawals')
@UseGuards(JwtAuthGuard, AdminGuard)
@Admin()
export class AdminWithdrawalsController {
  constructor(private walletService: WalletService) {}

  @Get()
  list(@Query('status') status?: 'PENDING' | 'APPROVED' | 'SENT' | 'FAILED', @Query('limit') limit?: string) {
    return this.walletService.listWithdrawalQueue(
      status,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Post(':id/approve')
  approve(@Param('id') withdrawalId: string) {
    return this.walletService.approveWithdrawal(withdrawalId);
  }

  @Post(':id/send')
  send(@Param('id') withdrawalId: string) {
    return this.walletService.sendApprovedWithdrawal(withdrawalId);
  }

  @Post(':id/fail')
  fail(@Param('id') withdrawalId: string, @Body() body: { reason?: string }) {
    return this.walletService.markWithdrawalFailed(withdrawalId, body?.reason);
  }
}
