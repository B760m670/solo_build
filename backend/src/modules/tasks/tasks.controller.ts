import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserTaskStatus } from '@prisma/client';
import { TasksService } from './tasks.service';
import { SubmitProofDto } from './task.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('tasks')
export class TasksController {
  constructor(private tasks: TasksService) {}

  @Get()
  listAvailable() {
    return this.tasks.listAvailable();
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() user: { id: string }, @Query('status') status?: UserTaskStatus) {
    return this.tasks.mine(user.id, status);
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard)
  start(@CurrentUser() user: { id: string }, @Param('id') taskId: string) {
    return this.tasks.start(user.id, taskId);
  }

  @Post('mine/:id/submit')
  @UseGuards(JwtAuthGuard)
  submit(
    @CurrentUser() user: { id: string },
    @Param('id') userTaskId: string,
    @Body() dto: SubmitProofDto,
  ) {
    return this.tasks.submitProof(user.id, userTaskId, dto.proof);
  }
}
