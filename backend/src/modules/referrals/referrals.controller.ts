import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private referralsService: ReferralsService) {}

  @Get()
  getInfo(@CurrentUser('id') userId: string) {
    return this.referralsService.getReferralInfo(userId);
  }

  @Post('bonus')
  claimBonus(@CurrentUser('id') userId: string) {
    return this.referralsService.claimBonus(userId);
  }
}
