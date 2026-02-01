import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../models/user.dart';
import '../services/user_service.dart';
import '../services/follower_service.dart';

class ProfileScreen extends StatefulWidget {
  final String? userId; // null means current user's profile

  const ProfileScreen({super.key, this.userId});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  User? _profileUser;
  bool _isLoading = true;
  bool _isFollowing = false;
  bool _isFollowLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final authProvider = context.read<AuthProvider>();
      final currentUser = authProvider.currentUser;
      final userService = context.read<UserService>();

      if (widget.userId == null) {
        final (user, isFollowed) = await userService.getUserProfile(
          currentUser!.id,
          currentUserId: currentUser?.id,
        );
        // Show current user's profile
        setState(() {
          _profileUser = user;
          _isLoading = false;
        });
      } else {
        // Load user profile - returns (User, isFollowed)
        final (user, isFollowed) = await userService.getUserProfile(
          widget.userId!,
          currentUserId: currentUser?.id,
        );

        setState(() {
          _profileUser = user;
          _isFollowing = isFollowed; // Backend tells us if we're following
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _toggleFollow() async {
    final authProvider = context.read<AuthProvider>();
    final currentUser = authProvider.currentUser;

    if (currentUser == null || _profileUser == null) return;

    setState(() {
      _isFollowLoading = true;
    });
    print('currentUser.id = ${currentUser.id}');
    print('_profileUser!.id = ${_profileUser!.id}');

    try {
      final followerService = context.read<FollowerService>();

      if (_isFollowing) {
        await followerService.unfollowUser(_profileUser!.id, currentUser.id);
      } else {
        await followerService.followUser(_profileUser!.id, currentUser.id);
      }

      setState(() {
        _isFollowing = !_isFollowing;
        // Update follower count
        if (_profileUser!.followersCount != null) {
          _profileUser = _profileUser!.copyWith(
            followersCount:
                _profileUser!.followersCount! + (_isFollowing ? 1 : -1),
          );
        }
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Failed to ${_isFollowing ? 'unfollow' : 'follow'}: $e',
            ),
          ),
        );
      }
    } finally {
      setState(() {
        _isFollowLoading = false;
      });
    }
  }

  Future<void> _showFollowersList() async {
    if (_profileUser == null) return;

    final followerService = context.read<FollowerService>();

    try {
      final followers = await followerService.getFollowers(_profileUser!.id);

      if (!mounted) return;

      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        builder: (context) => DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.4,
          maxChildSize: 0.9,
          expand: false,
          builder: (context, scrollController) => Container(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Followers (${followers.length})',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: followers.isEmpty
                      ? Center(
                          child: Text(
                            'No followers yet',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                        )
                      : ListView.builder(
                          controller: scrollController,
                          itemCount: followers.length,
                          itemBuilder: (context, index) {
                            final follower = followers[index];
                            return ListTile(
                              leading: CircleAvatar(
                                backgroundImage: follower.avatarUrl != null
                                    ? NetworkImage(follower.avatarUrl!)
                                    : null,
                                child: follower.avatarUrl == null
                                    ? Text(follower.name[0].toUpperCase())
                                    : null,
                              ),
                              title: Text(follower.name),
                              subtitle: follower.email.isNotEmpty
                                  ? Text(follower.email)
                                  : null,
                              onTap: () {
                                Navigator.pop(context);
                                context.go('/profile/${follower.id}');
                              },
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to load followers: $e')));
      }
    }
  }

  Future<void> _showFollowingList() async {
    if (_profileUser == null) return;

    final followerService = context.read<FollowerService>();

    try {
      final following = await followerService.getFollowing(_profileUser!.id);

      if (!mounted) return;

      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        builder: (context) => DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.4,
          maxChildSize: 0.9,
          expand: false,
          builder: (context, scrollController) => Container(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Following (${following.length})',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: following.isEmpty
                      ? Center(
                          child: Text(
                            'Not following anyone yet',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                        )
                      : ListView.builder(
                          controller: scrollController,
                          itemCount: following.length,
                          itemBuilder: (context, index) {
                            final user = following[index];
                            return ListTile(
                              leading: CircleAvatar(
                                backgroundImage: user.avatarUrl != null
                                    ? NetworkImage(user.avatarUrl!)
                                    : null,
                                child: user.avatarUrl == null
                                    ? Text(user.name[0].toUpperCase())
                                    : null,
                              ),
                              title: Text(user.name),
                              subtitle: user.email.isNotEmpty
                                  ? Text(user.email)
                                  : null,
                              onTap: () {
                                Navigator.pop(context);
                                context.go('/profile/${user.id}');
                              },
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to load following: $e')));
      }
    }
  }

  bool get _isOwnProfile {
    final authProvider = context.watch<AuthProvider>();
    final currentUser = authProvider.currentUser;
    return widget.userId == null ||
        (currentUser != null && currentUser.id == widget.userId);
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final currentUser = authProvider.currentUser;

    // If trying to view own profile but not logged in
    if (widget.userId == null && currentUser == null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.person_off, size: 80, color: Colors.grey),
              const SizedBox(height: 16),
              const Text(
                'Not logged in',
                style: TextStyle(fontSize: 18, color: Colors.grey),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.push('/login'),
                child: const Text('Login'),
              ),
            ],
          ),
        ),
      );
    }

    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_error != null) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 80, color: Colors.red),
              const SizedBox(height: 16),
              Text(
                'Error loading profile',
                style: TextStyle(fontSize: 18, color: Colors.grey[600]),
              ),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Text(
                  _error!,
                  style: TextStyle(fontSize: 14, color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _loadProfile,
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    final user = _profileUser;
    if (user == null) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: Text('User not found')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        actions: [
          if (_isOwnProfile) ...[
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () => context.push('/profile/edit'),
              tooltip: 'Edit Profile',
            ),
            IconButton(
              icon: const Icon(Icons.logout),
              onPressed: () async {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Logout'),
                    content: const Text('Are you sure you want to logout?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(false),
                        child: const Text('Cancel'),
                      ),
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(true),
                        child: const Text('Logout'),
                      ),
                    ],
                  ),
                );

                if (confirm == true && context.mounted) {
                  await authProvider.logout();
                  if (context.mounted) {
                    context.go('/');
                  }
                }
              },
              tooltip: 'Logout',
            ),
          ],
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const SizedBox(height: 20),
            CircleAvatar(
              radius: 60,
              backgroundColor: Theme.of(context).colorScheme.primary,
              backgroundImage: user.avatarUrl != null
                  ? NetworkImage(user.avatarUrl!)
                  : null,
              child: user.avatarUrl == null
                  ? Text(
                      user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                      style: const TextStyle(fontSize: 40, color: Colors.white),
                    )
                  : null,
            ),
            const SizedBox(height: 16),
            Text(
              user.name,
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            if (user.email.isNotEmpty) ...[
              Text(
                user.email,
                style: Theme.of(
                  context,
                ).textTheme.bodyLarge?.copyWith(color: Colors.grey[600]),
              ),
              const SizedBox(height: 8),
            ],
            if (user.role != UserRole.user)
              Chip(
                label: Text(user.role.value),
                backgroundColor: user.role == UserRole.admin
                    ? Colors.purple[100]
                    : Colors.blue[100],
              ),
            const SizedBox(height: 24),
            // Follow/Unfollow button for other users' profiles
            if (!_isOwnProfile && currentUser != null) ...[
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isFollowLoading ? null : _toggleFollow,
                  icon: _isFollowLoading
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Icon(
                          _isFollowing ? Icons.person_remove : Icons.person_add,
                        ),
                  label: Text(_isFollowing ? 'Unfollow' : 'Follow'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isFollowing
                        ? Colors.grey[300]
                        : Theme.of(context).colorScheme.primary,
                    foregroundColor: _isFollowing
                        ? Colors.black87
                        : Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
            if (user.bio != null && user.bio!.isNotEmpty) ...[
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Bio',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(user.bio!),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    if (user.points > 0)
                      _StatCard(
                        icon: Icons.star,
                        label: 'Points',
                        value: user.points.toString(),
                        color: Colors.amber,
                        onTap: null,
                      ),
                    if (user.followersCount != null)
                      _StatCard(
                        icon: Icons.people,
                        label: 'Followers',
                        value: user.followersCount.toString(),
                        color: Colors.blue,
                        onTap: _showFollowersList,
                      ),
                    if (user.followingCount != null)
                      _StatCard(
                        icon: Icons.person_add,
                        label: 'Following',
                        value: user.followingCount.toString(),
                        color: Colors.green,
                        onTap: _showFollowingList,
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            if (user.createdAt != null)
              Card(
                child: ListTile(
                  leading: const Icon(Icons.calendar_today),
                  title: const Text('Member Since'),
                  subtitle: Text(_formatDate(user.createdAt!)),
                ),
              ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;
  final VoidCallback? onTap;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final child = Column(
      children: [
        Icon(icon, size: 32, color: color),
        const SizedBox(height: 8),
        Text(
          value,
          style: Theme.of(
            context,
          ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
        ),
        Text(
          label,
          style: Theme.of(
            context,
          ).textTheme.bodySmall?.copyWith(color: Colors.grey[600]),
        ),
      ],
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(padding: const EdgeInsets.all(8.0), child: child),
      );
    }

    return child;
  }
}
