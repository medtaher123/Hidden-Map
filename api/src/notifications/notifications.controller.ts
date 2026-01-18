import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { NotificationResponseDto } from './dto/notification-response.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Request() req): Promise<NotificationResponseDto> {
    const userId = req.user.id;
    return this.notificationsService.findAllByUser(userId);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req): Promise<void> {
    const userId = req.user.id;
    await this.notificationsService.markAsRead(+id, userId);
  }

  @Post('mark-all-read')
  async markAllAsRead(@Request() req): Promise<void> {
    const userId = req.user.id;
    await this.notificationsService.markAllAsRead(userId);
  }
}
