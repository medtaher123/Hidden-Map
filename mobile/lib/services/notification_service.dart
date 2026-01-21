import 'dart:io';
import 'package:dio/dio.dart';
import '../config/constants.dart';
import '../models/notification.dart';

class NotificationService {
  final Dio _dio;
  final String? _token;

  NotificationService({String? token})
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

  Future<NotificationResponse> getNotifications() async {
    try {
      final response = await _dio.get(ApiConstants.notificationsEndpoint);
      return NotificationResponse.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.unauthorized) {
        throw Exception('Unauthorized - Please login');
      }
      throw Exception('Failed to load notifications: ${e.message}');
    }
  }

  Future<void> markAsRead(int notificationId) async {
    try {
      await _dio.put(
        ApiConstants.markNotificationAsReadEndpoint(notificationId),
      );
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.unauthorized) {
        throw Exception('Unauthorized - Please login');
      }
      throw Exception('Failed to mark notification as read: ${e.message}');
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await _dio.post(ApiConstants.markAllNotificationsAsReadEndpoint);
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.unauthorized) {
        throw Exception('Unauthorized - Please login');
      }
      throw Exception('Failed to mark all as read: ${e.message}');
    }
  }
}
