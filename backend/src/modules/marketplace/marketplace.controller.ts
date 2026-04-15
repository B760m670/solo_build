import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ListingCategory } from '@prisma/client';
import { MarketplaceService } from './marketplace.service';
import { CreateListingDto, UpdateListingDto } from './listing.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private marketplace: MarketplaceService) {}

  @Get('listings')
  list(
    @Query('category') category?: ListingCategory,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.marketplace.list({
      category,
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('listings/mine')
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() user: { id: string }) {
    return this.marketplace.mine(user.id);
  }

  @Get('listings/:id')
  getOne(@Param('id') id: string) {
    return this.marketplace.getById(id);
  }

  @Post('listings')
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateListingDto) {
    return this.marketplace.create(user.id, dto);
  }

  @Patch('listings/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateListingDto,
  ) {
    return this.marketplace.update(user.id, id, dto);
  }

  @Delete('listings/:id')
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.marketplace.remove(user.id, id);
  }
}
