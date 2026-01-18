import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location, LocationStatus } from '../../locations/entities/location.entity';
import { User } from '../../users/entities/user.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/entities/notification.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  async getPendingLocations(): Promise<Location[]> {
    return this.locationRepository.find({
      where: { status: LocationStatus.PENDING },
      relations: ['photos', 'ratings', 'comments'],
      order: { createdAt: 'ASC' },
    });
  }

  async approveLocation(id: string): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { id },
      relations: ['submittedBy'],
    });
    if (!location) {
      throw new Error(`Location with id ${id} not found`);
    }
    location.status = LocationStatus.APPROVED;
    const savedLocation = await this.locationRepository.save(location);

    // Award points to user
    if (location.submittedById) {
      const pointsAwarded = 10;
      await this.userRepository.increment(
        { id: location.submittedById },
        'points',
        pointsAwarded,
      );

      // Notify user about approval
      await this.notificationsService.create(
        location.submittedById,
        NotificationType.LOCATION_APPROVED,
        `Your location "${location.name}" has been approved!`,
        {
          locationId: location.id,
          locationName: location.name,
        },
      );

      // Notify user about points
      await this.notificationsService.create(
        location.submittedById,
        NotificationType.POINTS_AWARDED,
        `You earned ${pointsAwarded} points for your approved location!`,
        {
          locationId: location.id,
          locationName: location.name,
          points: pointsAwarded,
        },
      );
    }

    return savedLocation;
  }

  async rejectLocation(id: string): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { id },
      relations: ['submittedBy'],
    });
    if (!location) {
      throw new Error(`Location with id ${id} not found`);
    }
    location.status = LocationStatus.REJECTED;
    const savedLocation = await this.locationRepository.save(location);

    // Notify user about rejection
    if (location.submittedById) {
      await this.notificationsService.create(
        location.submittedById,
        NotificationType.LOCATION_REJECTED,
        `Your location "${location.name}" was not approved.`,
        {
          locationId: location.id,
          locationName: location.name,
        },
      );
    }

    return savedLocation;
  }
}
