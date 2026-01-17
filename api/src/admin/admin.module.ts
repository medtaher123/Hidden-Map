import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from '../locations/entities/location.entity';
import { AdminController } from './controller/admin.controller';
import { AdminService } from './service/admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Location])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
