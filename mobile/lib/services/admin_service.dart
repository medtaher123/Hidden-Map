import 'package:dio/dio.dart';
import '../config/constants.dart';
import '../models/location.dart';

class AdminService {
  final Dio _dio;

  AdminService()
      : _dio = Dio(BaseOptions(
          baseUrl: ApiConstants.baseUrl,
          connectTimeout: const Duration(seconds: 5),
          receiveTimeout: const Duration(seconds: 3),
        ));

  Future<List<Location>> getPendingLocations() async {
    try {
      final response = await _dio.get(ApiConstants.adminPendingEndpoint);
      final List<dynamic> data = response.data as List<dynamic>;
      return data
          .map((json) => Location.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw Exception('Failed to load pending locations: ${e.message}');
    }
  }

  Future<void> approveLocation(String id) async {
    try {
      await _dio.post(ApiConstants.adminApproveEndpoint(id));
    } on DioException catch (e) {
      throw Exception('Failed to approve location: ${e.message}');
    }
  }

  Future<void> rejectLocation(String id) async {
    try {
      await _dio.post(ApiConstants.adminRejectEndpoint(id));
    } on DioException catch (e) {
      throw Exception('Failed to reject location: ${e.message}');
    }
  }
}
