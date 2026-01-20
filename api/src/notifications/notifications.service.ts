import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { NotificationResponseDto } from './dto/notification-response.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async findAllByUser(userId: string): Promise<NotificationResponseDto> {
    const notifications = await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
      notifications,
      unreadCount,
    };
  }

  async markAsRead(id: number, userId: string): Promise<void> {
    await this.notificationRepository.update(
      { id, userId },
      { read: true },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, read: false },
      { read: true },
    );
  }

  async create(
    userId: string,
    type: NotificationType,
    message: string,
    metadata?: {
      locationId?: string;
      locationName?: string;
      points?: number;
    },
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      type,
      message,
      metadata,
    });

    return this.notificationRepository.save(notification);
  }
}
