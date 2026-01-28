import 'dart:io';
import 'package:dio/dio.dart';
import '../config/constants.dart';
import '../models/favorite.dart';
import '../models/location.dart';

class FavoriteService {
  final Dio _dio;
  final String? _token;

  FavoriteService({String? token})
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

  Future<bool> isFavorite(String locationId) async {
    try {
      final response = await _dio.get(ApiConstants.favoriteCheckEndpoint(locationId));
      // Backend returns a boolean directly
      return response.data as bool;
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.notFound) {
        return false;
      }
      if (e.response?.statusCode == HttpStatus.unauthorized) {
        throw Exception('Unauthorized - Please login');
      }
      throw Exception('Failed to check favorite status: ${e.message}');
    }
  }

  Future<List<Location>> getUserFavorites() async {
    try {
      final response = await _dio.get(ApiConstants.favoritesEndpoint);
      final List<dynamic> data = response.data as List<dynamic>;
      return data
          .where((json) => json['location'] != null)
          .map((json) => Location.fromJson(json['location'] as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.unauthorized) {
        throw Exception('Unauthorized - Please login');
      }
      throw Exception('Failed to load favorites: ${e.message}');
    }
  }

  Future<void> addFavorite(String locationId) async {
    try {
      await _dio.post(ApiConstants.favoriteEndpoint(locationId));
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.unauthorized) {
        throw Exception('Unauthorized - Please login');
      }
      throw Exception('Failed to add favorite: ${e.message}');
    }
  }

  Future<void> removeFavorite(String locationId) async {
    try {
      await _dio.delete(ApiConstants.favoriteEndpoint(locationId));
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.notFound) {
        // Already removed, treat as success
        return;
      }
      if (e.response?.statusCode == HttpStatus.unauthorized) {
        throw Exception('Unauthorized - Please login');
      }
      throw Exception('Failed to remove favorite: ${e.message}');
    }
  }
}

