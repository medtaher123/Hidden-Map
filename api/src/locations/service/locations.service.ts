import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from '../entities/location.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateLocationDto } from '../dto/create-location.dto';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/entities/notification.entity';
import { MediaFile } from '../../file/entities/file.entity';

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

  findByBounds(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
  ): Promise<Location[]> {
    return this.locationRepository
      .createQueryBuilder('location')
      .where('location.latitude BETWEEN :minLat AND :maxLat', { minLat, maxLat })
      .andWhere('location.longitude BETWEEN :minLng AND :maxLng', { minLng, maxLng })
      .leftJoinAndSelect('location.photos', 'photos')
      .getMany();
  }

  findOne(id: string): Promise<Location | null> {
    return this.locationRepository.findOne({
      where: { id },
      relations: ['photos'],
    });
  }

  async create(locationData: CreateLocationDto, userId: string): Promise<Location> {

    const { photos, ...rest } = locationData;

  const location = this.locationRepository.create({
    ...rest,
    submittedById: userId,
    photos: photos ? photos.map(id => ({ id } as MediaFile)) : [],
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

  async update(id: string, updateLocationDto: UpdateLocationDto) {
  const { photos, ...locationData } = updateLocationDto;

  return this.locationRepository.save({
    id,
    ...locationData,
    photos: photos?.map((photoId) => ({ id: photoId }))
  });
}

  async remove(id: string): Promise<void> {
    await this.locationRepository.softDelete(id);
  }
}
