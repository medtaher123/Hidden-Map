import 'package:dio/dio.dart';
import '../config/constants.dart';
import '../models/location.dart';

class LocationService {
  final Dio _dio;

  LocationService()
      : _dio = Dio(BaseOptions(
          baseUrl: ApiConstants.baseUrl,
          connectTimeout: const Duration(seconds: 5),
          receiveTimeout: const Duration(seconds: 3),
        ));

  Future<List<Location>> getLocations() async {
    try {
      final response = await _dio.get(ApiConstants.locationsEndpoint);
      final List<dynamic> data = response.data as List<dynamic>;
      return data
          .map((json) => Location.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw Exception('Failed to load locations: ${e.message}');
    }
  }

  Future<Location> createLocation(Location location) async {
    try {
      final response = await _dio.post(
        ApiConstants.locationsEndpoint,
        data: location.toJson(),
      );
      return Location.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception('Failed to create location: ${e.message}');
    }
  }
}
