import 'dart:io';
import 'package:dio/dio.dart';
import '../config/constants.dart';
import '../models/user.dart';

class UserService {
  final Dio _dio;
  final String? _token;

  UserService({String? token})
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

  // Get all users
  Future<List<User>> getAllUsers() async {
    try {
      final response = await _dio.get(ApiConstants.usersEndpoint);
      final List<dynamic> data = response.data as List<dynamic>;
      return data
          .map((json) => User.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw Exception('Failed to load users: ${e.message}');
    }
  }

  // Get user by ID
  Future<User> getUserById(String id) async {
    try {
      final response = await _dio.get('${ApiConstants.usersEndpoint}/$id');
      return User.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.notFound) {
        throw Exception('User not found');
      }
      throw Exception('Failed to load user: ${e.message}');
    }
  }

  // Get user profile (includes followers/following counts)
  Future<User> getUserProfile(String id, {String? currentUserId}) async {
    try {
      final queryParams = currentUserId != null
          ? {'currentUserId': currentUserId}
          : <String, dynamic>{};

      final response = await _dio.get(
        '${ApiConstants.usersEndpoint}/$id/profile',
        queryParameters: queryParams,
      );
      return User.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.notFound) {
        throw Exception('User not found');
      }
      throw Exception('Failed to load user profile: ${e.message}');
    }
  }

  // Update user
  Future<void> updateUser(String id, Map<String, dynamic> data) async {
    try {
      await _dio.put('${ApiConstants.usersEndpoint}/$id', data: data);
      // Note: Backend returns partial user data, so we don't parse the response
      // The caller should refresh the full user data after update if needed
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.notFound) {
        throw Exception('User not found');
      }
      throw Exception('Failed to update user: ${e.message}');
    }
  }

  // Delete user
  Future<void> deleteUser(String id) async {
    try {
      await _dio.delete('${ApiConstants.usersEndpoint}/$id');
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.notFound) {
        throw Exception('User not found');
      }
      throw Exception('Failed to delete user: ${e.message}');
    }
  }
}
