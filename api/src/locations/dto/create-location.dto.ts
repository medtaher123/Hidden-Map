import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Max,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePhotoDto } from './create-photo.dto';

export class CreateLocationDto {
  @ApiProperty({
    description: 'Name of the location',
    example: 'Secret Beach Cove',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Detailed description of the location',
    example: 'A hidden beach cove with crystal clear water',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Category of the location',
    example: 'Beach',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 34.0522,
    minimum: -90,
    maximum: 90,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: -118.2437,
    minimum: -180,
    maximum: 180,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({
    description: 'Street address of the location',
    example: '123 Beach Road',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'City where the location is situated',
    example: 'Los Angeles',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Array of photos for the location',
    type: [CreatePhotoDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePhotoDto)
  photos: CreatePhotoDto[];
}
