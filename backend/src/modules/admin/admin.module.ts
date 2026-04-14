import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TasksModule } from '../tasks/tasks.module';
import { AdminTasksController } from './admin.tasks.controller';
import { AdminRolesController } from './admin.roles.controller';
import { WalletModule } from '../wallet/wallet.module';
import { AdminWithdrawalsController } from './admin.withdrawals.controller';

@Module({
  imports: [TasksModule, WalletModule],
  controllers: [AdminController, AdminTasksController, AdminRolesController, AdminWithdrawalsController],
  providers: [AdminService],
})
export class AdminModule {}
