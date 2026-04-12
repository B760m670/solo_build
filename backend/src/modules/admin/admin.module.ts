import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TasksModule } from '../tasks/tasks.module';
import { AdminTasksController } from './admin.tasks.controller';

@Module({
  imports: [TasksModule],
  controllers: [AdminController, AdminTasksController],
  providers: [AdminService],
})
export class AdminModule {}
