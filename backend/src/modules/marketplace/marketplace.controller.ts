import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import {
  CreateListingDto,
  UpdateListingDto,
  ListingFilterDto,
} from './listing.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('marketplace')
@UseGuards(JwtAuthGuard)
export class MarketplaceController {
  constructor(private marketplaceService: MarketplaceService) {}

  @Get('listings')
  findAll(@Query() filter: ListingFilterDto) {
    return this.marketplaceService.findAll(filter.search, filter.category);
  }

  @Get('listings/my')
  myListings(@CurrentUser('id') userId: string) {
    return this.marketplaceService.getMyListings(userId);
  }

  @Get('listings/:id')
  findOne(@Param('id') id: string) {
    return this.marketplaceService.findById(id);
  }

  @Post('listings')
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateListingDto,
  ) {
    return this.marketplaceService.create(userId, dto);
  }

  @Patch('listings/:id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateListingDto,
  ) {
    return this.marketplaceService.update(userId, id, dto);
  }

  @Delete('listings/:id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.marketplaceService.remove(userId, id);
  }

  @Post('listings/:id/buy')
  buy(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.marketplaceService.buy(userId, id);
  }
}
