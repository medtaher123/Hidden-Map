import 'package:flutter/material.dart';
import '../services/leaderboard_service.dart';
import '../models/leaderboard_user.dart';
import 'package:go_router/go_router.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  final LeaderboardService _service = LeaderboardService();
  List<LeaderboardUser> _users = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadLeaderboard();
  }

  Future<void> _loadLeaderboard() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final users = await _service.getLeaderboard();
      setState(() {
        _users = users;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🏆 Leaderboard'),
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
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(_error!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadLeaderboard,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_users.isEmpty) {
      return const Center(
        child: Text('No users found yet. Be the first to contribute!'),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadLeaderboard,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _users.length,
        itemBuilder: (context, index) {
          final user = _users[index];
          return _buildUserCard(context, user);
        },
      ),
    );
  }

  Widget _buildUserCard(BuildContext context, LeaderboardUser user) {
    final isTopThree = user.rank <= 3;

    return InkWell(
      onTap: () {
        context.push('/profile/${user.id}');
      },
      child: Card(
        margin: const EdgeInsets.only(bottom: 12),
        elevation: isTopThree ? 4 : 1,
        child: ListTile(
          contentPadding: const EdgeInsets.all(16),
          leading: _buildRankWidget(user.rank),
          title: Row(
            children: [
              _buildAvatar(user),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  user.name,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          trailing: _buildPointsBadge(user.points),
        ),
      ),
    );
  }

  Widget _buildRankWidget(int rank) {
    if (rank == 1) return const Text('🥇', style: TextStyle(fontSize: 32));
    if (rank == 2) return const Text('🥈', style: TextStyle(fontSize: 32));
    if (rank == 3) return const Text('🥉', style: TextStyle(fontSize: 32));

    return SizedBox(
      width: 40,
      child: Text(
        '#$rank',
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        textAlign: TextAlign.center,
      ),
    );
  }

  Widget _buildAvatar(LeaderboardUser user) {
    if (user.avatarUrl != null && user.avatarUrl!.isNotEmpty) {
      return CircleAvatar(
        radius: 24,
        backgroundImage: NetworkImage(user.avatarUrl!),
      );
    }

    return CircleAvatar(
      radius: 24,
      backgroundColor: Colors.blue,
      child: Text(
        user.name.isNotEmpty ? user.name[0].toUpperCase() : '?',
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildPointsBadge(int points) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Colors.orange, Colors.deepOrange],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            points.toString(),
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          const SizedBox(width: 4),
          const Text(
            'pts',
            style: TextStyle(color: Colors.white, fontSize: 12),
          ),
        ],
      ),
    );
  }
}
