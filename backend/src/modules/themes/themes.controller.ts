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
import { ThemesService } from './themes.service';
import {
  ActivateThemeDto,
  BuyThemeDto,
  CreateThemeDto,
  UpdateThemeDto,
} from './themes.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { Admin } from '../../common/decorators/admin.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('themes')
@UseGuards(JwtAuthGuard)
export class ThemesController {
  constructor(private themes: ThemesService) {}

  @Get()
  list() {
    return this.themes.list();
  }

  @Get('mine')
  mine(@CurrentUser() user: { id: string }) {
    return this.themes.myThemes(user.id);
  }

  @Post(':id/buy')
  buy(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: BuyThemeDto,
  ) {
    return this.themes.buy(user.id, id, dto.currency);
  }

  @Post('activate')
  activate(@CurrentUser() user: { id: string }, @Body() dto: ActivateThemeDto) {
    return this.themes.activate(user.id, dto.themeId ?? null);
  }
}

@Controller('admin/themes')
@UseGuards(JwtAuthGuard, AdminGuard)
@Admin()
export class ThemesAdminController {
  constructor(private themes: ThemesService) {}

  @Post()
  create(@Body() dto: CreateThemeDto) {
    return this.themes.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateThemeDto) {
    return this.themes.update(id, dto);
  }

  @Delete(':id')
  retire(@Param('id') id: string) {
    return this.themes.retire(id);
  }
}
