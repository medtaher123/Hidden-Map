import { Module } from '@nestjs/common';
import { LocationsController } from './controller/locations.controller';
import { LocationsService } from './service/locations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { Photo } from './entities/photo.entity';
import { PhotosService } from './service/photos.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Location, Photo, User]),
    NotificationsModule,
  ],
  controllers: [LocationsController],
  providers: [LocationsService, PhotosService],
})
export class LocationsModule {}
