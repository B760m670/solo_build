import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { Admin } from '../../common/decorators/admin.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@Admin()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  getRecentUsers(@Query('limit') limit?: string) {
    return this.adminService.getRecentUsers(limit ? parseInt(limit, 10) : 20);
  }
}
