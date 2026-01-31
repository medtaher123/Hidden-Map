import { IsNumber, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetLocationsByBoundsDto {
  @ApiPropertyOptional({
    description: 'Minimum latitude of the bounding box',
    example: 36.5,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  minLat?: number;

  @ApiPropertyOptional({
    description: 'Maximum latitude of the bounding box',
    example: 37.0,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  maxLat?: number;

  @ApiPropertyOptional({
    description: 'Minimum longitude of the bounding box',
    example: 9.5,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  minLng?: number;

  @ApiPropertyOptional({
    description: 'Maximum longitude of the bounding box',
    example: 10.5,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  maxLng?: number;
}
