import 'dart:io';
import 'package:dio/dio.dart';
import '../config/constants.dart';
import '../models/comment.dart';

class CommentService {
  final Dio _dio;
  final String? _token;

  CommentService({String? token})
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

  Future<List<Comment>> getCommentsByLocation(String locationId) async {
    try {
      final response = await _dio.get(ApiConstants.commentsEndpoint(locationId));
      final List<dynamic> data = response.data as List<dynamic>;
      return data.map((json) => Comment.fromJson(json as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.unauthorized) {
        throw Exception('Unauthorized - Please login');
      }
      throw Exception('Failed to load comments: ${e.message}');
    }
  }

  Future<Comment?> addComment(String locationId, String commentText) async {
    try {
      final response = await _dio.post(
        ApiConstants.commentsEndpoint(locationId),
        data: {'commentText': commentText},
      );
      try {
        return Comment.fromJson(response.data as Map<String, dynamic>);
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
      throw Exception('Failed to add comment: ${e.message}');
    }
  }

  Future<void> deleteComment(String locationId, String commentId) async {
    try {
      await _dio.delete(ApiConstants.commentByIdEndpoint(locationId, commentId));
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.unauthorized) {
        throw Exception('Unauthorized - Please login');
      }
      throw Exception('Failed to delete comment: ${e.message}');
    }
  }
}

