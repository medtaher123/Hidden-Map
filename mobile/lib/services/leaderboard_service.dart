import 'package:dio/dio.dart';
import '../config/constants.dart';
import '../models/leaderboard_user.dart';

class LeaderboardService {
  final Dio _dio;

  LeaderboardService()
      : _dio = Dio(BaseOptions(
          baseUrl: ApiConstants.baseUrl,
          connectTimeout: const Duration(seconds: 5),
          receiveTimeout: const Duration(seconds: 3),
        ));

  Future<List<LeaderboardUser>> getLeaderboard() async {
    try {
      final response = await _dio.get(ApiConstants.leaderboardEndpoint);
      final List<dynamic> data = response.data as List<dynamic>;
      
      // Add rank to each user
      return data.asMap().entries.map((entry) {
        final json = entry.value as Map<String, dynamic>;
        json['rank'] = entry.key + 1;
        return LeaderboardUser.fromJson(json);
      }).toList();
    } on DioException catch (e) {
      throw Exception('Failed to load leaderboard: ${e.message}');
    }
  }
}
