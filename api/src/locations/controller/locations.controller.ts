import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { LocationsService } from '../service/locations.service';
import { CreateLocationDto } from '../dto/create-location.dto';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { GetLocationsByBoundsDto } from '../dto/get-locations-by-bounds.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

@ApiTags('Locations')
@ApiBearerAuth('JWT-auth')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Public()
  @ApiOperation({ summary: 'Get all locations or filter by bounds' })
  @ApiResponse({
    status: 200,
    description: 'Returns all locations or locations within bounds with photos',
  })
  @Get()
  getAllLocations(@Query() boundsDto: GetLocationsByBoundsDto) {
    // If bounds are provided, filter by them
    if (
      boundsDto.minLat !== undefined &&
      boundsDto.maxLat !== undefined &&
      boundsDto.minLng !== undefined &&
      boundsDto.maxLng !== undefined
    ) {
      // Validate that min < max
      if (boundsDto.minLat >= boundsDto.maxLat) {
        throw new Error('minLat must be less than maxLat');
      }
      if (boundsDto.minLng >= boundsDto.maxLng) {
        throw new Error('minLng must be less than maxLng');
      }

      return this.locationsService.findByBounds(
        boundsDto.minLat,
        boundsDto.maxLat,
        boundsDto.minLng,
        boundsDto.maxLng,
      );
    }

    // Otherwise return all locations
    return this.locationsService.findAll();
  }

  @Public()
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiParam({ name: 'id', description: 'Location UUID' })
  @ApiResponse({
    status: 200,
    description: 'Returns location details with photos',
  })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @Get(':id')
  getLocationById(@Param('id') id: string) {
    return this.locationsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new location' })
  @ApiResponse({ status: 201, description: 'Location created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @Post()
  createLocation(
    @Body() createLocationDto: CreateLocationDto,
    @CurrentUser() user: User,
  ) {
    return this.locationsService.create(createLocationDto, user.id);
  }

  @ApiOperation({ summary: 'Update location' })
  @ApiParam({ name: 'id', description: 'Location UUID' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @Put(':id')
  updateLocation(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationsService.update(id, updateLocationDto);
  }

  @ApiOperation({ summary: 'Delete location' })
  @ApiParam({ name: 'id', description: 'Location UUID' })
  @ApiResponse({ status: 200, description: 'Location deleted successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @Delete(':id')
  deleteLocation(@Param('id') id: string) {
    return this.locationsService.remove(id);
  }
}
