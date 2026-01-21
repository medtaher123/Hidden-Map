export class DashboardStatsDto {
  totalLocations: number;
  totalUsers: number;
  totalComments: number;
  totalRatings: number;
  pendingLocations: number;
  approvedLocations: number;
  rejectedLocations: number;
}

export class ActivityItemDto {
  id: number;
  type: 'location_submitted' | 'location_approved' | 'location_rejected' | 'comment_added' | 'rating_added' | 'user_registered';
  message: string;
  timestamp: Date;
  userId?: string;
  username?: string;
  locationId?: string;
  locationName?: string;
}

export class LocationsByCategoryDto {
  category: string;
  count: number;
}

export class UserGrowthDataDto {
  month: string;
  users: number;
  locations: number;
}

export class TopContributorDto {
  userId: string;
  username: string;
  locationCount: number;
  points: number;
}

export class DashboardDataDto {
  stats: DashboardStatsDto;
  recentActivity: ActivityItemDto[];
  locationsByCategory: LocationsByCategoryDto[];
  userGrowth: UserGrowthDataDto[];
  topContributors: TopContributorDto[];
}
