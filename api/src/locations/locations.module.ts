import { Module } from '@nestjs/common';
import { LocationsController } from './controller/locations.controller';
import { LocationsService } from './service/locations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { User } from '../users/entities/user.entity';
import { MediaFile } from '../file/entities/file.entity';
import { FileModule } from '../file/file.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Location, User, MediaFile]),
    NotificationsModule,
    FileModule,
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
