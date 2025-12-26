import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('locations/:locationId/ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  rateLocation(
    @Param('locationId') locationId: string,
    @Body() createRatingDto: CreateRatingDto,
    @CurrentUser() user: User,
  ) {
    return this.ratingsService.create(user.id, locationId, createRatingDto.rating);
  }

  @Public()
  @Get()
  getRatings(@Param('locationId') locationId: string) {
    return this.ratingsService.getRatingsByLocation(locationId);
  }

  @Public()
  @Get('average')
  getAverageRating(@Param('locationId') locationId: string) {
    return this.ratingsService.getAverageRating(locationId);
  }
}

