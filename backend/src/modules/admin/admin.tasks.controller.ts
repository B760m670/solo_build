import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { Admin } from '../../common/decorators/admin.decorator';
import { TasksService } from '../tasks/tasks.service';

@Controller('admin/tasks')
@UseGuards(JwtAuthGuard, AdminGuard)
@Admin()
export class AdminTasksController {
  constructor(private tasksService: TasksService) {}

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
