import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class PurchasesController {
  constructor(private purchases: PurchasesService) {}

  @Post('marketplace/listings/:id/boost')
  boostListing(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.purchases.boostListing(user.id, id);
  }

  @Post('wallet/premium')
  purchasePremium(@CurrentUser() user: { id: string }) {
    return this.purchases.purchasePremium(user.id);
  }
}
