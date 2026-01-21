import 'dart:io';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/constants.dart';
import '../models/user.dart';

class AuthService {
  final Dio _dio;
  String? _token;

  AuthService()
    : _dio = Dio(
        BaseOptions(
          baseUrl: ApiConstants.baseUrl,
          connectTimeout: const Duration(seconds: 5),
          receiveTimeout: const Duration(seconds: 3),
        ),
      ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          if (_token != null) {
            options.headers['Authorization'] = 'Bearer $_token';
          }
          return handler.next(options);
        },
      ),
    );
  }

  // Initialize token from storage
  Future<void> initToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
  }

  // Save token to storage
  Future<void> _saveToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  // Clear token from storage
  Future<void> _clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  // Login
  Future<User> login(String email, String password) async {
    try {
      final response = await _dio.post(
        '${ApiConstants.authEndpoint}/login',
        data: {'email': email, 'password': password},
      );

      final token = response.data['access_token'] as String;
      await _saveToken(token);

      // Get user profile after login
      return await getCurrentUser();
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.unauthorized) {
        throw Exception('Invalid credentials');
      }
      throw Exception('Failed to login: ${e.message}');
    }
  }

  // Register
  Future<User> register(String name, String email, String password) async {
    try {
      final response = await _dio.post(
        '${ApiConstants.authEndpoint}/register',
        data: {'name': name, 'email': email, 'password': password},
      );

      final token = response.data['access_token'] as String;
      await _saveToken(token);

      // Get user profile after registration
      return await getCurrentUser();
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.conflict) {
        throw Exception('Email already in use');
      }
      throw Exception('Failed to register: ${e.message}');
    }
  }

  // Get current user profile
  Future<User> getCurrentUser() async {
    try {
      final response = await _dio.post('${ApiConstants.authEndpoint}/me');
      return User.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      if (e.response?.statusCode == HttpStatus.unauthorized) {
        await _clearToken();
        throw Exception('Unauthorized - please login again');
      }
      throw Exception('Failed to get user profile: ${e.message}');
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      await _dio.post('${ApiConstants.authEndpoint}/logout');
    } catch (e) {
      // Ignore errors on logout
    } finally {
      await _clearToken();
    }
  }

  // Check if user is authenticated
  bool get isAuthenticated => _token != null;

  // Get current token
  String? get token => _token;
}
