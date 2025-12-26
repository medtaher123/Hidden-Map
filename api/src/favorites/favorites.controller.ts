import { Controller, Post, Delete, Param, Get } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('locations/:locationId/favorite')
  addFavorite(
    @Param('locationId') locationId: string,
    @CurrentUser() user: User,
  ) {
    return this.favoritesService.create(user.id, locationId);
  }

  @Delete('locations/:locationId/favorite')
  removeFavorite(
    @Param('locationId') locationId: string,
    @CurrentUser() user: User,
  ) {
    return this.favoritesService.remove(user.id, locationId);
  }

  @Get('locations/:locationId/favorite/check')
  checkFavorite(
    @Param('locationId') locationId: string,
    @CurrentUser() user: User,
  ) {
    return this.favoritesService.isFavorite(user.id, locationId);
  }

  @Get('favorites')
  getUserFavorites(@CurrentUser() user: User) {
    return this.favoritesService.getFavoritesByUser(user.id);
  }
}

