import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { TonService } from './ton.service';

@Module({
  controllers: [WalletController],
  providers: [WalletService, TonService],
  exports: [WalletService, TonService],
})
export class WalletModule {}
