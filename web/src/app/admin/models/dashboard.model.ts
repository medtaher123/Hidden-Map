export interface DashboardStats {
  totalLocations: number;
  totalUsers: number;
  totalComments: number;
  totalRatings: number;
  pendingLocations: number;
  approvedLocations: number;
  rejectedLocations: number;
}

export interface ActivityItem {
  id: number;
  type: 'location_submitted' | 'location_approved' | 'location_rejected' | 'comment_added' | 'rating_added' | 'user_registered';
  message: string;
  timestamp: Date;
  userId?: number;
  username?: string;
  locationId?: number;
  locationName?: string;
}

export interface LocationsByCategory {
  category: string;
  count: number;
}

export interface UserGrowthData {
  month: string;
  users: number;
  locations: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  locationsByCategory: LocationsByCategory[];
  userGrowth: UserGrowthData[];
  topContributors: {
    userId: number;
    username: string;
    locationCount: number;
    points: number;
  }[];
}