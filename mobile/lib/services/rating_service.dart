import 'dart:io';
import 'package:dio/dio.dart';
import '../config/constants.dart';
import '../models/rating.dart';

class RatingService {
  final Dio _dio;
  final String? _token;

  RatingService({String? token})
      : _token = token,
        _dio = Dio(
          BaseOptions(
            baseUrl: ApiConstants.baseUrl,
            connectTimeout: const Duration(seconds: 5),
            receiveTimeout: const Duration(seconds: 3),
          ),
        ) {
    if (_token != null) {
      _dio.options.headers['Authorization'] = 'Bearer $_token';
    }
  }

  Future<List<Rating>> getRatingsByLocation(String locationId) async {
    try {
      final response = await _dio.get(ApiConstants.ratingsEndpoint(locationId));
      final List<dynamic> data = response.data as List<dynamic>;
      return data.map((json) => Rating.fromJson(json as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.unauthorized) {
        throw Exception('Unauthorized - Please login');
      }
      throw Exception('Failed to load ratings: ${e.message}');
    }
  }

  Future<double> getAverageRating(String locationId) async {
    try {
      final response = await _dio.get(ApiConstants.averageRatingEndpoint(locationId));
      if (response.data is num) {
        return (response.data as num).toDouble();
      }
      return 0.0;
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.unauthorized) {
        throw Exception('Unauthorized - Please login');
      }
      throw Exception('Failed to load average rating: ${e.message}');
    }
  }

  Future<Rating?> rateLocation(String locationId, int rating) async {
    try {
      final response = await _dio.post(
        ApiConstants.ratingsEndpoint(locationId),
        data: {'rating': rating},
      );
      try {
        return Rating.fromJson(response.data as Map<String, dynamic>);
      } catch (parseError) {
        if (response.statusCode != null && response.statusCode! >= 200 && response.statusCode! < 300) {
          return null;
        }
        throw parseError;
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.unauthorized) {
        throw Exception('Unauthorized - Please login');
      }
      throw Exception('Failed to rate location: ${e.message}');
    }
  }

  Future<int?> getUserRating(String locationId, String? userId) async {
    if (userId == null) return null;
    
    try {
      final ratings = await getRatingsByLocation(locationId);
      final userRating = ratings.firstWhere(
        (rating) => rating.user?.id == userId,
        orElse: () => Rating(
          id: '',
          rating: 0,
          locationId: locationId,
          createdAt: DateTime.now(),
        ),
      );
      
      return userRating.id.isEmpty ? null : userRating.rating;
    } catch (e) {
      return null;
    }
  }
}
