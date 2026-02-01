import 'dart:io';
import 'package:dio/dio.dart';
import '../config/constants.dart';
import '../models/user.dart';

class FollowerService {
  final Dio _dio;
  final String? Function() _getToken;

  FollowerService({required String? Function() getToken})
    : _getToken = getToken,
      _dio = Dio(
        BaseOptions(
          baseUrl: ApiConstants.baseUrl,
          connectTimeout: const Duration(seconds: 5),
          receiveTimeout: const Duration(seconds: 3),
        ),
      ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = _getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
      ),
    );
  }

  // Follow a user
  ///
  /// POST /users/:targetUserId/follow
  /// Body: { "userId": targetUserId, "followerUserId": currentUserId }
  ///
  /// The backend expects:
  /// - userId: the ID of the user who is following (current user)
  /// - The targetUserId is in the URL path
  Future<void> followUser(String currentUserId, String targetUserId) async {
    try {
      await _dio.post(
        '/users/$currentUserId/follow',
        data: {'userId': currentUserId, 'followerUserId': targetUserId},
      );
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.unauthorized) {
        throw Exception('Unauthorized - please login again');
      } else if (e.response?.statusCode == HttpStatus.badRequest) {
        // Extract detailed error message from backend
        final errorMessage = e.response?.data['message'];
        if (errorMessage is List) {
          throw Exception(errorMessage.join(', '));
        }
        throw Exception(errorMessage ?? 'Cannot follow this user');
      } else if (e.response?.statusCode == HttpStatus.conflict) {
        throw Exception('Already following this user');
      }
      throw Exception('Failed to follow user: ${e.message}');
    }
  }

  /// Unfollow a user
  ///
  /// DELETE /users/:targetUserId/follow
  /// Body: { "followerUserId": currentUserId }
  ///
  /// The backend expects:
  /// - userId: the ID of the user who is unfollowing (current user)
  /// - The targetUserId is in the URL path
  Future<void> unfollowUser(String currentUserId, String targetUserId) async {
    try {
      await _dio.delete(
        '/users/$currentUserId/follow',
        data: {'followerUserId': targetUserId},
      );
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.unauthorized) {
        throw Exception('Unauthorized - please login again');
      } else if (e.response?.statusCode == HttpStatus.notFound) {
        throw Exception('Not following this user');
      } else if (e.response?.statusCode == HttpStatus.badRequest) {
        final errorMessage = e.response?.data['message'];
        if (errorMessage is List) {
          throw Exception(errorMessage.join(', '));
        }
        throw Exception(errorMessage ?? 'Cannot unfollow this user');
      }
      throw Exception('Failed to unfollow user: ${e.message}');
    }
  }

  /// Get list of followers for a user
  ///
  /// GET /users/:userId/follow/followers
  /// Returns list of User objects who follow the specified user
  Future<List<User>> getFollowers(String userId) async {
    try {
      final response = await _dio.get('/users/$userId/follow/followers');

      final List<dynamic> data = response.data as List<dynamic>;
      return data
          .map((json) => User.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.unauthorized) {
        throw Exception('Unauthorized - please login again');
      } else if (e.response?.statusCode == HttpStatus.notFound) {
        throw Exception('User not found');
      }
      throw Exception('Failed to get followers: ${e.message}');
    }
  }

  /// Get list of users that this user is following
  ///
  /// GET /users/:userId/follow/following
  /// Returns list of User objects that the specified user follows
  Future<List<User>> getFollowing(String userId) async {
    try {
      final response = await _dio.get('/users/$userId/follow/following');

      final List<dynamic> data = response.data as List<dynamic>;
      return data
          .map((json) => User.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.unauthorized) {
        throw Exception('Unauthorized - please login again');
      } else if (e.response?.statusCode == HttpStatus.notFound) {
        throw Exception('User not found');
      }
      throw Exception('Failed to get following: ${e.message}');
    }
  }

  /// Check if a user is following another user
  ///
  /// GET /users/:userId/follow/is-following/:followerUserId
  /// Returns true if followerUserId is following userId
  Future<bool> isFollowing(String followerUserId, String userId) async {
    try {
      final response = await _dio.get(
        '/users/$userId/follow/is-following/$followerUserId',
      );

      // Handle different response formats from backend
      if (response.data is Map<String, dynamic>) {
        final data = response.data as Map<String, dynamic>;
        // Check for common response keys
        if (data.containsKey('isFollowing')) {
          return data['isFollowing'] as bool;
        } else if (data.containsKey('following')) {
          return data['following'] as bool;
        }
      } else if (response.data is bool) {
        return response.data as bool;
      }

      return false;
    } on DioException catch (e) {
      // Return false instead of throwing for this query
      // This makes it easier to use in UI
      if (e.response?.statusCode == HttpStatus.unauthorized) {
        // Still throw for auth errors
        throw Exception('Unauthorized - please login again');
      }
      // For other errors (not found, network issues), return false
      return false;
    }
  }
}
