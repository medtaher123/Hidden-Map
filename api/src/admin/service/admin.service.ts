import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location, LocationStatus } from '../../locations/entities/location.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async getPendingLocations(): Promise<Location[]> {
    return this.locationRepository.find({
      where: { status: LocationStatus.PENDING },
      relations: ['photos', 'ratings', 'comments'],
      order: { createdAt: 'ASC' },
    });
  }

  async approveLocation(id: string): Promise<Location> {
    const location = await this.locationRepository.findOneBy({ id });
    if (!location) {
      throw new Error(`Location with id ${id} not found`);
    }
    location.status = LocationStatus.APPROVED;
    return this.locationRepository.save(location);
  }

  async rejectLocation(id: string): Promise<Location> {
    const location = await this.locationRepository.findOneBy({ id });
    if (!location) {
      throw new Error(`Location with id ${id} not found`);
    }
    location.status = LocationStatus.REJECTED;
    return this.locationRepository.save(location);
  }
}
