import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location, LocationStatus } from '../../locations/entities/location.entity';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Rating } from '../../ratings/entities/rating.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/entities/notification.entity';
import {
  DashboardDataDto,
  DashboardStatsDto,
  ActivityItemDto,
  LocationsByCategoryDto,
  UserGrowthDataDto,
  TopContributorDto,
} from '../dto/dashboard.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    private notificationsService: NotificationsService,
  ) {}

  async getPendingLocations(): Promise<Location[]> {
    return this.locationRepository.find({
      where: { status: LocationStatus.PENDING },
      relations: ['photos', 'ratings', 'comments'],
      order: { createdAt: 'ASC' },
    });
  }

  async approveLocation(id: string): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { id },
      relations: ['submittedBy'],
    });
    
    if (!location) {
      throw new Error(`Location with id ${id} not found`);
    }
    
    location.status = LocationStatus.APPROVED;
    const savedLocation = await this.locationRepository.save(location);

    // Award points to user
    if (location.submittedById) {
      const pointsAwarded = 10;
      
      await this.userRepository.increment(
        { id: location.submittedById },
        'points',
        pointsAwarded,
      );

      // Notify user about approval
      await this.notificationsService.create(
        location.submittedById,
        NotificationType.LOCATION_APPROVED,
        `Your location "${location.name}" has been approved!`,
        {
          locationId: location.id,
          locationName: location.name,
        },
      );

      // Notify user about points
      await this.notificationsService.create(
        location.submittedById,
        NotificationType.POINTS_AWARDED,
        `You earned ${pointsAwarded} points for your approved location!`,
        {
          locationId: location.id,
          locationName: location.name,
          points: pointsAwarded,
        },
      );
    }

    return savedLocation;
  }

  async rejectLocation(id: string): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { id },
      relations: ['submittedBy'],
    });
    if (!location) {
      throw new Error(`Location with id ${id} not found`);
    }
    location.status = LocationStatus.REJECTED;
    const savedLocation = await this.locationRepository.save(location);

    // Notify user about rejection
    if (location.submittedById) {
      await this.notificationsService.create(
        location.submittedById,
        NotificationType.LOCATION_REJECTED,
        `Your location "${location.name}" was not approved.`,
        {
          locationId: location.id,
          locationName: location.name,
        },
      );
    }

    return savedLocation;
  }

  async getDashboardData(): Promise<DashboardDataDto> {
    const [stats, recentActivity, locationsByCategory, userGrowth, topContributors] = await Promise.all([
      this.getDashboardStats(),
      this.getRecentActivity(),
      this.getLocationsByCategory(),
      this.getUserGrowth(),
      this.getTopContributors(),
    ]);

    return {
      stats,
      recentActivity,
      locationsByCategory,
      userGrowth,
      topContributors,
    };
  }

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const [
      totalLocations,
      totalUsers,
      totalComments,
      totalRatings,
      pendingLocations,
      approvedLocations,
      rejectedLocations,
    ] = await Promise.all([
      this.locationRepository.count(),
      this.userRepository.count(),
      this.commentRepository.count(),
      this.ratingRepository.count(),
      this.locationRepository.count({ where: { status: LocationStatus.PENDING } }),
      this.locationRepository.count({ where: { status: LocationStatus.APPROVED } }),
      this.locationRepository.count({ where: { status: LocationStatus.REJECTED } }),
    ]);

    return {
      totalLocations,
      totalUsers,
      totalComments,
      totalRatings,
      pendingLocations,
      approvedLocations,
      rejectedLocations,
    };
  }

  private async getRecentActivity(): Promise<ActivityItemDto[]> {
    const recentLocations = await this.locationRepository.find({
      take: 10,
      order: { createdAt: 'DESC' },
      relations: ['submittedBy'],
    });

    const recentComments = await this.commentRepository.find({
      take: 5,
      order: { createdAt: 'DESC' },
      relations: ['user', 'location'],
    });

    const recentUsers = await this.userRepository.find({
      take: 5,
      order: { createdAt: 'DESC' },
    });

    const activities: ActivityItemDto[] = [];

    // Add location activities
    recentLocations.forEach((location, index) => {
      let type: ActivityItemDto['type'] = 'location_submitted';
      let message = `Location "${location.name}" was submitted`;

      if (location.status === LocationStatus.APPROVED) {
        type = 'location_approved';
        message = `Location "${location.name}" was approved`;
      } else if (location.status === LocationStatus.REJECTED) {
        type = 'location_rejected';
        message = `Location "${location.name}" was rejected`;
      }

      activities.push({
        id: index,
        type,
        message,
        timestamp: location.createdAt,
        userId: location.submittedById,
        username: location.submittedBy?.name,
        locationId: location.id,
        locationName: location.name,
      });
    });

    // Add comment activities
    recentComments.forEach((comment, index) => {
      activities.push({
        id: recentLocations.length + index,
        type: 'comment_added',
        message: `${comment.user?.name || 'User'} commented on "${comment.location?.name || 'a location'}"`,
        timestamp: comment.createdAt,
        userId: comment.user?.id,
        username: comment.user?.name,
        locationId: comment.location?.id,
        locationName: comment.location?.name,
      });
    });

    // Add user registration activities
    recentUsers.forEach((user, index) => {
      activities.push({
        id: recentLocations.length + recentComments.length + index,
        type: 'user_registered',
        message: `${user.name} joined the platform`,
        timestamp: user.createdAt,
        userId: user.id,
        username: user.name,
      });
    });

    // Sort by timestamp and return top 15
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 15);
  }

  private async getLocationsByCategory(): Promise<LocationsByCategoryDto[]> {
    const result = await this.locationRepository
      .createQueryBuilder('location')
      .select('location.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('location.status = :status', { status: LocationStatus.APPROVED })
      .groupBy('location.category')
      .getRawMany();

    return result.map((row) => ({
      category: row.category,
      count: parseInt(row.count, 10),
    }));
  }

  private async getUserGrowth(): Promise<UserGrowthDataDto[]> {
    // Get data for the last 12 months
    const result = await this.userRepository
      .createQueryBuilder('user')
      .select("TO_CHAR(user.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'users')
      .groupBy('month')
      .orderBy('month', 'DESC')
      .limit(12)
      .getRawMany();

    const locationResult = await this.locationRepository
      .createQueryBuilder('location')
      .select("TO_CHAR(location.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'locations')
      .groupBy('month')
      .orderBy('month', 'DESC')
      .limit(12)
      .getRawMany();

    // Merge the results
    const growthMap = new Map<string, UserGrowthDataDto>();

    result.forEach((row) => {
      growthMap.set(row.month, {
        month: row.month,
        users: parseInt(row.users, 10),
        locations: 0,
      });
    });

    locationResult.forEach((row) => {
      const existing = growthMap.get(row.month);
      if (existing) {
        existing.locations = parseInt(row.locations, 10);
      } else {
        growthMap.set(row.month, {
          month: row.month,
          users: 0,
          locations: parseInt(row.locations, 10),
        });
      }
    });

    return Array.from(growthMap.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  }

  private async getTopContributors(): Promise<TopContributorDto[]> {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin(Location, 'location', 'location.submittedById = user.id')
      .select('user.id', 'userId')
      .addSelect('user.name', 'username')
      .addSelect('user.points', 'points')
      .addSelect('COUNT(location.id)', 'locationCount')
      .groupBy('user.id')
      .addGroupBy('user.name')
      .addGroupBy('user.points')
      .orderBy('user.points', 'DESC')
      .limit(10)
      .getRawMany();

    return result.map((row) => ({
      userId: row.userId,
      username: row.username,
      points: parseInt(row.points, 10) || 0,
      locationCount: parseInt(row.locationCount, 10) || 0,
    }));
  }
}
