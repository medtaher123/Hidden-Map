import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from '../entities/location.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateLocationDto } from '../dto/create-location.dto';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/entities/notification.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  findAll(): Promise<Location[]> {
    return this.locationRepository.find({ relations: ['photos'] });
  }

  findOne(id: string): Promise<Location | null> {
    return this.locationRepository.findOne({
      where: { id },
      relations: ['photos'],
    });
  }

  async create(locationData: CreateLocationDto, userId: string): Promise<Location> {
    const location = this.locationRepository.create({
      ...locationData,
      submittedById: userId,
    });
    const savedLocation = await this.locationRepository.save(location);

    // Notify all admins about new location submission
    const admins = await this.userRepository.find({
      where: { role: UserRole.ADMIN },
    });

    for (const admin of admins) {
      await this.notificationsService.create(
        admin.id,
        NotificationType.LOCATION_APPROVED, // Reusing this type for new submissions
        `New location "${savedLocation.name}" submitted for review`,
        {
          locationId: savedLocation.id,
          locationName: savedLocation.name,
        },
      );
    }

    return savedLocation;
  }

  update(id: string, locationData: UpdateLocationDto): Promise<Location> {
    return this.locationRepository.save({ id, ...locationData });
  }

  async remove(id: string): Promise<void> {
    await this.locationRepository.softDelete(id);
  }
}
