import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TasksModule } from '../tasks/tasks.module';
import { AdminTasksController } from './admin.tasks.controller';
import { AdminRolesController } from './admin.roles.controller';

@Module({
  imports: [TasksModule],
  controllers: [AdminController, AdminTasksController, AdminRolesController],
  providers: [AdminService],
})
export class AdminModule {}
