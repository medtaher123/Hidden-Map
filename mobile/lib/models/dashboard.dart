class DashboardStats {
  final int totalLocations;
  final int totalUsers;
  final int totalComments;
  final int totalRatings;
  final int pendingLocations;
  final int approvedLocations;
  final int rejectedLocations;

  DashboardStats({
    required this.totalLocations,
    required this.totalUsers,
    required this.totalComments,
    required this.totalRatings,
    required this.pendingLocations,
    required this.approvedLocations,
    required this.rejectedLocations,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalLocations: json['totalLocations'] as int,
      totalUsers: json['totalUsers'] as int,
      totalComments: json['totalComments'] as int,
      totalRatings: json['totalRatings'] as int,
      pendingLocations: json['pendingLocations'] as int,
      approvedLocations: json['approvedLocations'] as int,
      rejectedLocations: json['rejectedLocations'] as int,
    );
  }
}

class ActivityItem {
  final String type;
  final String message;
  final DateTime timestamp;
  final String? username;
  final String? locationName;

  ActivityItem({
    required this.type,
    required this.message,
    required this.timestamp,
    this.username,
    this.locationName,
  });

  factory ActivityItem.fromJson(Map<String, dynamic> json) {
    return ActivityItem(
      type: json['type'] as String,
      message: json['message'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      username: json['username'] as String?,
      locationName: json['locationName'] as String?,
    );
  }
}

class LocationsByCategory {
  final String category;
  final int count;

  LocationsByCategory({
    required this.category,
    required this.count,
  });

  factory LocationsByCategory.fromJson(Map<String, dynamic> json) {
    return LocationsByCategory(
      category: json['category'] as String,
      count: json['count'] as int,
    );
  }
}

class DashboardData {
  final DashboardStats stats;
  final List<ActivityItem> recentActivity;
  final List<LocationsByCategory> locationsByCategory;

  DashboardData({
    required this.stats,
    required this.recentActivity,
    required this.locationsByCategory,
  });

  factory DashboardData.fromJson(Map<String, dynamic> json) {
    return DashboardData(
      stats: DashboardStats.fromJson(json['stats'] as Map<String, dynamic>),
      recentActivity: (json['recentActivity'] as List<dynamic>)
          .map((item) => ActivityItem.fromJson(item as Map<String, dynamic>))
          .toList(),
      locationsByCategory: (json['locationsByCategory'] as List<dynamic>)
          .map((item) => LocationsByCategory.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}
