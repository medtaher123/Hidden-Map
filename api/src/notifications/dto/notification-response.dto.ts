import { Notification } from '../entities/notification.entity';

export class NotificationResponseDto {
  notifications: Notification[];
  unreadCount: number;
}
