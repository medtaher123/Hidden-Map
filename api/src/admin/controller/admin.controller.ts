import { Controller, Get, Post, Param, UseGuards, Inject } from '@nestjs/common';
import { AdminService } from '../service/admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Location } from '../../locations/entities/location.entity';
import { DashboardDataDto, DashboardStatsDto } from '../dto/dashboard.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard(): Promise<DashboardDataDto> {
    return this.adminService.getDashboardData();
  }

  @Get('dashboard/stats')
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.adminService.getDashboardStats();
  }

  @Get('pending-locations')
  async getPendingLocations(): Promise<Location[]> {
    return this.adminService.getPendingLocations();
  }

  @Post('approve-location/:id')
  async approveLocation(@Param('id') id: string): Promise<Location> {
    return this.adminService.approveLocation(id);
  }

  @Post('reject-location/:id')
  async rejectLocation(@Param('id') id: string): Promise<Location> {
    return this.adminService.rejectLocation(id);
  }
}
