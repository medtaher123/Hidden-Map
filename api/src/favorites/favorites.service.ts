import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userId: string, locationId: string): Promise<Favorite> {
    const favorite = this.favoriteRepository.create({
      user: { id: userId },
      location: { id: locationId },
    });
    const savedFavorite = await this.favoriteRepository.save(favorite);

    // Award points for favoriting a location
    const pointsAwarded = 2;
    await this.userRepository.increment(
      { id: userId },
      'points',
      pointsAwarded,
    );

    return savedFavorite;
  }

  async remove(userId: string, locationId: string): Promise<void> {
    await this.favoriteRepository.delete({
      user: { id: userId },
      location: { id: locationId },
    });

    // Deduct points when unfavoriting
    const pointsDeducted = 2;
    await this.userRepository.decrement(
      { id: userId },
      'points',
      pointsDeducted,
    );
  }

  async isFavorite(userId: string, locationId: string): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        user: { id: userId },
        location: { id: locationId },
      },
    });
    return !!favorite;
  }

  async getFavoritesByUser(userId: string): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['location', 'location.photos'],
    });
  }
}

