import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}

  async create(userId: string, locationId: string, rating: number): Promise<Rating> {
    // Check if user already rated this location
    const existing = await this.ratingRepository.findOne({
      where: {
        user: { id: userId },
        location: { id: locationId },
      },
    });

    if (existing) {
      // Update existing rating
      existing.rating = rating;
      return this.ratingRepository.save(existing);
    }

    // Create new rating
    const newRating = this.ratingRepository.create({
      rating,
      user: { id: userId },
      location: { id: locationId },
    });
    return this.ratingRepository.save(newRating);
  }

  async getAverageRating(locationId: string): Promise<number> {
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'average')
      .where('rating.locationId = :locationId', { locationId })
      .getRawOne();

    return result?.average ? parseFloat(result.average) : 0;
  }

  async getRatingsByLocation(locationId: string): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: { location: { id: locationId } },
      relations: ['user'],
    });
  }
}

