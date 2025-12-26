import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from '../entities/location.entity';
import { Repository } from 'typeorm';
import { CreateLocationDto } from '../dto/create-location.dto';
import { UpdateLocationDto } from '../dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
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

  create(locationData: CreateLocationDto): Promise<Location> {
    const location = this.locationRepository.create(locationData);
    return this.locationRepository.save(location);
  }

  update(id: string, locationData: UpdateLocationDto): Promise<Location> {
    return this.locationRepository.save({ id, ...locationData });
  }

  async remove(id: string): Promise<void> {
    await this.locationRepository.softDelete(id);
  }
}
