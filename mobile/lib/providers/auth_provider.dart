import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  User? _currentUser;
  bool _isLoading = false;
  String? _error;

  User? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _currentUser != null;
  bool get isAdmin => _currentUser?.role == UserRole.admin;

  AuthProvider() {
    _initAuth();
  }

  Future<void> _initAuth() async {
    await _authService.initToken();
    if (_authService.isAuthenticated) {
      try {
        await refreshCurrentUser();
      } catch (e) {
        // Token might be expired, clear it
        await logout();
      }
    }
  }

  Future<void> login(String email, String password) async {
    _setLoading(true);
    _error = null;

    try {
      final user = await _authService.login(email, password);
      _currentUser = user;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> register(String name, String email, String password) async {
    _setLoading(true);
    _error = null;

    try {
      final user = await _authService.register(name, email, password);
      _currentUser = user;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    _setLoading(true);

    try {
      await _authService.logout();
      _currentUser = null;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
    } finally {
      _setLoading(false);
    }
  }

  Future<void> refreshCurrentUser() async {
    _setLoading(true);

    try {
      final user = await _authService.getCurrentUser();
      _currentUser = user;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _currentUser = null;
      notifyListeners();
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
