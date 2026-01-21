import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../services/admin_service.dart';
import '../services/auth_service.dart';
import '../models/location.dart';
import '../models/user.dart';
import '../providers/auth_provider.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  AdminService? _service;
  List<Location> _pendingLocations = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _checkAdminAndLoad();
  }

  Future<void> _checkAdminAndLoad() async {
    final authProvider = context.read<AuthProvider>();

    // Check if user is authenticated
    if (!authProvider.isAuthenticated) {
      setState(() {
        _error = 'Please login to access admin panel';
        _isLoading = false;
      });
      return;
    }

    // Check if user is admin
    if (!authProvider.isAdmin) {
      setState(() {
        _error = 'Admin privileges required';
        _isLoading = false;
      });
      return;
    }

    // Initialize service with token
    final authService = AuthService();
    await authService.initToken();

    if (authService.token == null) {
      setState(() {
        _error = 'Authentication required';
        _isLoading = false;
      });
      return;
    }

    _service = AdminService(token: authService.token!);
    await _loadPendingLocations();
  }

  Future<void> _loadPendingLocations() async {
    if (_service == null) {
      await _checkAdminAndLoad();
      return;
    }
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final locations = await _service!.getPendingLocations();
      setState(() {
        _pendingLocations = locations;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _approveLocation(String id) async {
    if (_service == null) return;

    try {
      await _service!.approveLocation(id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Location approved successfully')),
        );
        _loadPendingLocations();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Failed to approve: ${e.toString().replaceAll('Exception: ', '')}',
            ),
          ),
        );
      }
    }
  }

  Future<void> _rejectLocation(String id) async {
    if (_service == null) return;

    try {
      await _service!.rejectLocation(id);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Location rejected')));
        _loadPendingLocations();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Failed to reject: ${e.toString().replaceAll('Exception: ', '')}',
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('⏳ Admin - Pending Locations'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      final authProvider = context.watch<AuthProvider>();
      final isAuthError =
          _error!.contains('login') ||
          _error!.contains('privileges') ||
          _error!.contains('Authentication');

      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isAuthError ? Icons.lock : Icons.error_outline,
              size: 64,
              color: isAuthError ? Colors.orange : Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              _error!,
              style: TextStyle(
                color: isAuthError ? Colors.orange : Colors.red,
                fontSize: 16,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            if (isAuthError && !authProvider.isAuthenticated)
              ElevatedButton.icon(
                onPressed: () => context.push('/login'),
                icon: const Icon(Icons.login),
                label: const Text('Login'),
              )
            else if (isAuthError)
              ElevatedButton(
                onPressed: () => context.pop(),
                child: const Text('Go Back'),
              )
            else
              ElevatedButton(
                onPressed: _checkAdminAndLoad,
                child: const Text('Retry'),
              ),
          ],
        ),
      );
    }

    if (_pendingLocations.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.check_circle_outline,
              size: 64,
              color: Colors.green[300],
            ),
            const SizedBox(height: 16),
            const Text(
              'No pending locations',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text('All submissions have been reviewed'),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadPendingLocations,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _pendingLocations.length,
        itemBuilder: (context, index) {
          final location = _pendingLocations[index];
          return _buildLocationCard(location);
        },
      ),
    );
  }

  Widget _buildLocationCard(Location location) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image
          if (location.photos.isNotEmpty)
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(12),
              ),
              child: Image.network(
                location.photos.first.url,
                height: 200,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) =>
                    _buildPlaceholder(),
              ),
            )
          else
            _buildPlaceholder(),

          // Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        location.name,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    Chip(
                      label: Text(location.category.name),
                      backgroundColor: Colors.blue[100],
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  location.description,
                  style: const TextStyle(color: Colors.grey),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 12),
                if (location.address.isNotEmpty) ...[
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on,
                        size: 16,
                        color: Colors.grey,
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          location.address,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                ],
                if (location.city.isNotEmpty)
                  Row(
                    children: [
                      const Icon(
                        Icons.location_city,
                        size: 16,
                        color: Colors.grey,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        location.city,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                const SizedBox(height: 16),
                // Action Buttons
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _approveLocation(location.id),
                        icon: const Icon(Icons.check),
                        label: const Text('Approve'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _rejectLocation(location.id),
                        icon: const Icon(Icons.close),
                        label: const Text('Reject'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      height: 200,
      color: Colors.grey[300],
      child: const Center(
        child: Icon(Icons.location_on, size: 64, color: Colors.grey),
      ),
    );
  }
}
