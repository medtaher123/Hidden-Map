import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../services/notification_service.dart';
import '../models/notification.dart';
import '../providers/auth_provider.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  NotificationResponse? _notificationResponse;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    final authProvider = context.read<AuthProvider>();

    if (!authProvider.isAuthenticated) {
      setState(() {
        _error = 'Please login to view notifications';
        _isLoading = false;
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final service = NotificationService(token: authProvider.token);
      final response = await service.getNotifications();
      setState(() {
        _notificationResponse = response;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _markAsRead(int notificationId, String type, Map<String, dynamic>? metadata) async {
    final authProvider = context.read<AuthProvider>();
    final service = NotificationService(token: authProvider.token);

    try {
      await service.markAsRead(notificationId);
      
      // Navigate based on notification type
      if (mounted) {
        _navigateByType(type, metadata);
      }

      // Reload notifications
      _loadNotifications();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    }
  }

  void _navigateByType(String type, Map<String, dynamic>? metadata) {
    final authProvider = context.read<AuthProvider>();
    
    if (type == 'location_approved') {
      // Check if admin is being notified about a new submission or user about approval
      if (authProvider.isAdmin && metadata?['locationId'] != null) {
        // Admin notification about new location - go to pending locations
        context.go('/admin');
      } else {
        // User notification about their approved location - go to map
        context.go('/');
      }
    } else if (type == 'points_awarded') {
      context.go('/leaderboard');
    }
  }

  Future<void> _markAllAsRead() async {
    final authProvider = context.read<AuthProvider>();
    final service = NotificationService(token: authProvider.token);

    try {
      await service.markAllAsRead();
      _loadNotifications();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          if (_notificationResponse != null && _notificationResponse!.unreadCount > 0)
            TextButton(
              onPressed: _markAllAsRead,
              child: const Text('Mark all read'),
            ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(_error!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadNotifications,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_notificationResponse == null || _notificationResponse!.notifications.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.notifications_none, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'No notifications',
              style: TextStyle(fontSize: 18, color: Colors.grey[600]),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadNotifications,
      child: ListView.separated(
        itemCount: _notificationResponse!.notifications.length,
        separatorBuilder: (context, index) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final notification = _notificationResponse!.notifications[index];
          return _buildNotificationTile(notification);
        },
      ),
    );
  }

  Widget _buildNotificationTile(NotificationModel notification) {
    return ListTile(
      leading: _getNotificationIcon(notification.type),
      title: Text(
        notification.message,
        style: TextStyle(
          fontWeight: notification.read ? FontWeight.normal : FontWeight.bold,
        ),
      ),
      subtitle: Text(
        _formatTimestamp(notification.createdAt),
        style: const TextStyle(fontSize: 12, color: Colors.grey),
      ),
      trailing: notification.read
          ? null
          : Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: Colors.blue,
                shape: BoxShape.circle,
              ),
            ),
      onTap: () => _markAsRead(notification.id, notification.type, notification.metadata),
      tileColor: notification.read ? null : Colors.blue[50],
    );
  }

  Widget _getNotificationIcon(String type) {
    IconData icon;
    Color color;

    switch (type) {
      case 'location_approved':
        icon = Icons.check_circle;
        color = Colors.green;
        break;
      case 'location_rejected':
        icon = Icons.cancel;
        color = Colors.red;
        break;
      case 'comment':
        icon = Icons.comment;
        color = Colors.orange;
        break;
      case 'rating':
        icon = Icons.star;
        color = Colors.amber;
        break;
      case 'points_awarded':
        icon = Icons.emoji_events;
        color = Colors.purple;
        break;
      default:
        icon = Icons.info;
        color = Colors.grey;
    }

    return Icon(icon, color: color);
  }

  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inHours < 1) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inDays < 1) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return '${timestamp.day}/${timestamp.month}/${timestamp.year}';
    }
  }
}
