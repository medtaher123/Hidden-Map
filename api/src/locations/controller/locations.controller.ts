import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Locations')
@ApiBearerAuth('JWT-auth')
@Public()
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({
    status: 200,
    description: 'Returns all locations with photos',
  })
  @Get()
  getAllLocations() {
    return this.locationsService.findAll();
  }

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
  createLocation(@Body() createLocationDto: CreateLocationDto) {
    return this.locationsService.create(createLocationDto);
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
