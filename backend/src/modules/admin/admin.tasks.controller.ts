import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { Admin } from '../../common/decorators/admin.decorator';
import { TasksService } from '../tasks/tasks.service';
import { CreateTaskDto, UpdateTaskDto } from '../tasks/task.dto';

@Controller('admin/tasks')
@UseGuards(JwtAuthGuard, AdminGuard)
@Admin()
export class AdminTasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  listTasks(@Query('limit') limit?: string) {
    return this.tasksService.adminList(limit ? parseInt(limit, 10) : 50);
  }

  @Post()
  createTask(@Body() dto: CreateTaskDto) {
    return this.tasksService.adminCreate(dto);
  }

  @Patch(':id')
  updateTask(@Param('id') taskId: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.adminUpdate(taskId, dto);
  }

  @Post(':id/toggle')
  toggleTask(@Param('id') taskId: string) {
    return this.tasksService.adminToggle(taskId);
  }

  @Get('submissions')
  listSubmissions(@Query('limit') limit?: string) {
    return this.tasksService.listSubmissions(limit ? parseInt(limit, 10) : 50);
  }

  @Post('submissions/:id/approve')
  approve(@Param('id') userTaskId: string) {
    return this.tasksService.approveSubmission(userTaskId);
  }

  @Post('submissions/:id/reject')
  reject(@Param('id') userTaskId: string, @Body() body: { reason?: string }) {
    return this.tasksService.rejectSubmissionWithReason(userTaskId, body?.reason);
  }
}
