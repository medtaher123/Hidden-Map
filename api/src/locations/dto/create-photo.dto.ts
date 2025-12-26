import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePhotoDto {
  @ApiProperty({
    description: 'URL of the photo',
    example: 'https://example.com/photo.jpg',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({
    description: 'URL of the thumbnail version',
    example: 'https://example.com/thumb.jpg',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Caption or description for the photo',
    example: 'Beautiful sunset view',
  })
  @IsOptional()
  @IsString()
  caption?: string;
}
