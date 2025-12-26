import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  async create(userId: string, locationId: string): Promise<Favorite> {
    const favorite = this.favoriteRepository.create({
      user: { id: userId },
      location: { id: locationId },
    });
    return this.favoriteRepository.save(favorite);
  }

  async remove(userId: string, locationId: string): Promise<void> {
    await this.favoriteRepository.delete({
      user: { id: userId },
      location: { id: locationId },
    });
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

