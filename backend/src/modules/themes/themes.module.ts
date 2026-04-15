import { Module } from '@nestjs/common';
import { ThemesService } from './themes.service';
import { ThemesController, ThemesAdminController } from './themes.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ThemesService],
  controllers: [ThemesController, ThemesAdminController],
})
export class ThemesModule {}
