class ApiConstants {
  // Use 10.0.2.2 for Android emulator to access localhost
  //static const String baseUrl = 'http://10.0.2.2:3000';
  static const String baseUrl = 'http://localhost:3000';
  static const String locationsEndpoint = '/locations';
  static const String leaderboardEndpoint = '/leaderboard';
  static const String adminPendingEndpoint = '/admin/pending-locations';
  static const String authEndpoint = '/auth';
  static const String usersEndpoint = '/users';

  // Helper method to get approve/reject endpoints
  static String adminApproveEndpoint(String id) =>
      '/admin/approve-location/$id';
  static String adminRejectEndpoint(String id) => '/admin/reject-location/$id';
}
