import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { TasksService } from '../tasks/tasks.service';
import { CreateBrandTaskDto, RejectTaskDto } from '../tasks/task.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { Admin } from '../../common/decorators/admin.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@Admin()
export class AdminController {
  constructor(
    private admin: AdminService,
    private tasks: TasksService,
  ) {}

  @Get('dashboard')
  dashboard() {
    return this.admin.dashboard();
  }

  @Get('tasks/pending')
  pendingTasks() {
    return this.admin.pendingTaskSubmissions();
  }

  @Post('tasks/:id/approve')
  approveTask(@Param('id') id: string) {
    return this.tasks.approve(id);
  }

  @Post('tasks/:id/reject')
  rejectTask(@Param('id') id: string, @Body() dto: RejectTaskDto) {
    return this.tasks.reject(id, dto.reason);
  }

  @Get('disputes')
  disputes() {
    return this.admin.pendingDisputes();
  }

  @Get('withdrawals/pending')
  pendingWithdrawals() {
    return this.admin.pendingWithdrawals();
  }

  @Post('withdrawals/:id/process')
  processWithdrawal(@Param('id') id: string) {
    return this.admin.processWithdrawal(id);
  }

  @Post('tasks')
  createBrandTask(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateBrandTaskDto,
  ) {
    return this.admin.createBrandTask(user.id, dto);
  }
}
