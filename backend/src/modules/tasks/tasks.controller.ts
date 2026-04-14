import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CompleteTaskDto, TaskFilterDto } from './task.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  findAll(@Query() filter: TaskFilterDto) {
    return this.tasksService.findAll(filter.category);
  }

  @Get('history')
  history(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
  ) {
    return this.tasksService.getUserTasks(userId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findById(id);
  }

  @Post(':id/start')
  start(@CurrentUser('id') userId: string, @Param('id') taskId: string) {
    return this.tasksService.start(userId, taskId);
  }

  @Post(':id/complete')
  complete(
    @CurrentUser('id') userId: string,
    @Param('id') taskId: string,
    @Body() dto: CompleteTaskDto,
  ) {
    return this.tasksService.complete(userId, taskId, dto.proof, dto.proofData, dto.deviceFingerprint);
  }
}
