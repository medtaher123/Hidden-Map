class ApiConstants {
  // Use 10.0.2.2 for Android emulator to access localhost
  //static const String baseUrl = 'http://10.0.2.2:3000';
  static const String baseUrl = 'http://localhost:3000';
  // static const String baseUrl = 'http://192.168.1.101:3000';

  static String resolveImageUrl(String url) {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return baseUrl + (url.startsWith('/') ? url : '/$url');
  }

  static const String locationsEndpoint = '/locations';
  static const String fileUploadEndpoint = '/files/upload';
  static const String leaderboardEndpoint = '/leaderboard';
  static const String adminPendingEndpoint = '/admin/pending-locations';
  static const String adminDashboardEndpoint = '/admin/dashboard';
  static const String adminDashboardStatsEndpoint = '/admin/dashboard/stats';
  static const String authEndpoint = '/auth';
  static const String usersEndpoint = '/users';
  static const String notificationsEndpoint = '/notifications';
  static const String markAllNotificationsAsReadEndpoint =
      '/notifications/mark-all-read';
  static const String favoritesEndpoint = '/favorites';

  // Helper method to get approve/reject endpoints
  static String adminApproveEndpoint(String id) =>
      '/admin/approve-location/$id';
  static String adminRejectEndpoint(String id) => '/admin/reject-location/$id';
  static String markNotificationAsReadEndpoint(int id) =>
      '/notifications/$id/read';

  // Ratings endpoints
  static String ratingsEndpoint(String locationId) =>
      '/locations/$locationId/ratings';
  static String averageRatingEndpoint(String locationId) =>
      '/locations/$locationId/ratings/average';

  // Comments endpoints
  static String commentsEndpoint(String locationId) =>
      '/locations/$locationId/comments';
  static String commentByIdEndpoint(String locationId, String commentId) =>
      '/locations/$locationId/comments/$commentId';

  // Favorites endpoints
  static String favoriteEndpoint(String locationId) =>
      '/locations/$locationId/favorite';
  static String favoriteCheckEndpoint(String locationId) =>
      '/locations/$locationId/favorite/check';
}
