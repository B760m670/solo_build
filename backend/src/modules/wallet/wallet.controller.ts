import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WithdrawDto, ConnectWalletDto } from './withdraw.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get()
  getWallet(@CurrentUser('id') userId: string) {
    return this.walletService.getWallet(userId);
  }

  @Get('transactions')
  getTransactions(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.walletService.getTransactions(
      userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('connect')
  connectWallet(
    @CurrentUser('id') userId: string,
    @Body() dto: ConnectWalletDto,
  ) {
    return this.walletService.connectWallet(userId, dto.tonAddress);
  }

  @Delete('connect')
  disconnectWallet(@CurrentUser('id') userId: string) {
    return this.walletService.disconnectWallet(userId);
  }

  @Post('withdraw')
  withdraw(@CurrentUser('id') userId: string, @Body() dto: WithdrawDto) {
    return this.walletService.withdraw(userId, dto.tonAddress, dto.amount);
  }
}
