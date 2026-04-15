import { Module } from '@nestjs/common';
import { PlusService } from './plus.service';
import { PlusController, PlusAdminController } from './plus.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PlusService],
  controllers: [PlusController, PlusAdminController],
})
export class PlusModule {}
