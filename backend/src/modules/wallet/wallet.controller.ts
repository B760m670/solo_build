import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WithdrawTonDto } from './wallet.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private wallet: WalletService) {}

  @Get()
  get(@CurrentUser() user: { id: string }) {
    return this.wallet.getWallet(user.id);
  }

  @Get('transactions')
  transactions(
    @CurrentUser() user: { id: string },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.wallet.transactions(
      user.id,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Post('withdraw/ton')
  withdrawTon(@CurrentUser() user: { id: string }, @Body() dto: WithdrawTonDto) {
    return this.wallet.requestTonWithdrawal(
      user.id,
      dto.tonAddress,
      dto.amount,
      dto.idempotencyKey,
    );
  }
}
