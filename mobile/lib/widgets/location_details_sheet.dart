import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/location.dart';
import '../models/rating.dart';
import '../models/comment.dart';
import '../providers/auth_provider.dart';
import '../services/rating_service.dart';
import '../services/comment_service.dart';
import '../services/favorite_service.dart';

class LocationDetailsSheet extends StatefulWidget {
  final Location location;
  final bool? initialIsFavorite;
  final VoidCallback? onFavoriteToggled;

  const LocationDetailsSheet({
    super.key,
    required this.location,
    this.initialIsFavorite,
    this.onFavoriteToggled,
  });

  @override
  State<LocationDetailsSheet> createState() => _LocationDetailsSheetState();
}

class _LocationDetailsSheetState extends State<LocationDetailsSheet> {
  List<Rating> _ratings = [];
  List<Comment> _comments = [];
  bool _isFavorite = false;
  bool _isLoadingRatings = true;
  bool _isLoadingComments = true;
  bool _isLoadingFavorite = true;
  int? _userRating;
  final TextEditingController _commentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.initialIsFavorite != null) {
      _isFavorite = widget.initialIsFavorite!;
      _isLoadingFavorite = false;
    }
    _loadData();
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    await Future.wait([
      _loadRatings(),
      _loadComments(),
      _loadFavoriteStatus(),
    ]);
  }

  Future<void> _loadRatings() async {
    try {
      final authProvider = context.read<AuthProvider>();
      final ratingService = RatingService(token: authProvider.token);
      final ratings = await ratingService.getRatingsByLocation(widget.location.id);
      final userRating = await ratingService.getUserRating(
        widget.location.id,
        authProvider.currentUser?.id,
      );
      
      setState(() {
        _ratings = ratings;
        _userRating = userRating;
        _isLoadingRatings = false;
      });
    } catch (e) {
      setState(() => _isLoadingRatings = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load ratings: $e')),
        );
      }
    }
  }

  Future<void> _loadComments() async {
    try {
      final authProvider = context.read<AuthProvider>();
      final commentService = CommentService(token: authProvider.token);
      final comments = await commentService.getCommentsByLocation(widget.location.id);
      setState(() {
        _comments = comments;
        _isLoadingComments = false;
      });
    } catch (e) {
      setState(() => _isLoadingComments = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load comments: $e')),
        );
      }
    }
  }

  Future<void> _loadFavoriteStatus() async {
    if (widget.initialIsFavorite != null) {
      return;
    }
    
    try {
      final authProvider = context.read<AuthProvider>();
      final favoriteService = FavoriteService(token: authProvider.token);
      final isFavorite = await favoriteService.isFavorite(widget.location.id);
      setState(() {
        _isFavorite = isFavorite;
        _isLoadingFavorite = false;
      });
    } catch (e) {
      setState(() => _isLoadingFavorite = false);
    }
  }

  Future<void> _toggleFavorite() async {
    final wasAlreadyFavorite = _isFavorite;
    
    setState(() => _isFavorite = !wasAlreadyFavorite);
    
    try {
      final authProvider = context.read<AuthProvider>();
      final favoriteService = FavoriteService(token: authProvider.token);
      
      if (wasAlreadyFavorite) {
        await favoriteService.removeFavorite(widget.location.id);
      } else {
        await favoriteService.addFavorite(widget.location.id);
      }
      
      widget.onFavoriteToggled?.call();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_isFavorite ? 'Added to favorites' : 'Removed from favorites'),
            duration: const Duration(seconds: 1),
          ),
        );
      }
    } catch (e) {
      setState(() => _isFavorite = wasAlreadyFavorite);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update favorite: ${e.toString().replaceFirst('Exception: ', '')}'),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }

  Future<void> _submitRating(int rating) async {
    try {
      final authProvider = context.read<AuthProvider>();
      final ratingService = RatingService(token: authProvider.token);
      await ratingService.rateLocation(widget.location.id, rating);
      setState(() => _userRating = rating);
      await _loadRatings();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Rating submitted successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to submit rating: $e')),
        );
      }
    }
  }

  Future<void> _submitComment() async {
    if (_commentController.text.trim().isEmpty) return;

    try {
      final authProvider = context.read<AuthProvider>();
      final commentService = CommentService(token: authProvider.token);
      await commentService.addComment(widget.location.id, _commentController.text.trim());
      _commentController.clear();
      await _loadComments();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Comment added successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to add comment: $e')),
        );
      }
    }
  }

  double get _averageRating {
    if (_ratings.isEmpty) return 0;
    return _ratings.map((r) => r.rating).reduce((a, b) => a + b) / _ratings.length;
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      minChildSize: 0.4,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: ListView(
            controller: scrollController,
            padding: const EdgeInsets.all(16),
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Stack(
                children: [
                  if (widget.location.photos.isNotEmpty)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        widget.location.photos.first.url,
                        height: 200,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            height: 200,
                            color: Colors.grey[300],
                            child: const Icon(Icons.image_not_supported, size: 48),
                          );
                        },
                      ),
                    ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: _isLoadingFavorite
                        ? const CircularProgressIndicator()
                        : IconButton(
                            onPressed: _toggleFavorite,
                            icon: Icon(
                              _isFavorite ? Icons.favorite : Icons.favorite_border,
                              color: _isFavorite ? Colors.red : Colors.white,
                              size: 32,
                            ),
                            style: IconButton.styleFrom(
                              backgroundColor: Colors.black.withValues(alpha: 0.5),
                            ),
                          ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: widget.location.category.color.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      widget.location.category.emoji,
                      style: const TextStyle(fontSize: 24),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.location.name,
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        Text(
                          widget.location.category.displayName,
                          style: Theme.of(context).textTheme.bodyMedium
                              ?.copyWith(color: widget.location.category.color),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                widget.location.description,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              _buildInfoRow(
                Icons.location_on,
                '${widget.location.address}, ${widget.location.city}',
              ),
              const SizedBox(height: 8),
              _buildInfoRow(
                Icons.gps_fixed,
                '${widget.location.latitude.toStringAsFixed(6)}, ${widget.location.longitude.toStringAsFixed(6)}',
              ),
              const SizedBox(height: 24),
              _buildRatingsSection(),
              const SizedBox(height: 24),
              _buildCommentsSection(),
            ],
          ),
        );
      },
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 20, color: Colors.grey[600]),
        const SizedBox(width: 8),
        Expanded(
          child: Text(text, style: TextStyle(color: Colors.grey[600])),
        ),
      ],
    );
  }

  Widget _buildRatingsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Ratings',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 12),
        if (_isLoadingRatings)
          const Center(child: CircularProgressIndicator())
        else ...[
          Row(
            children: [
              Icon(Icons.star, color: Colors.amber[700], size: 28),
              const SizedBox(width: 8),
              Text(
                _averageRating.toStringAsFixed(1),
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(width: 8),
              Text(
                '(${_ratings.length} ${_ratings.length == 1 ? 'rating' : 'ratings'})',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            'Rate this location:',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 8),
          Row(
            children: List.generate(5, (index) {
              final rating = index + 1;
              return IconButton(
                onPressed: () => _submitRating(rating),
                icon: Icon(
                  rating <= (_userRating ?? 0) ? Icons.star : Icons.star_border,
                  color: Colors.amber[700],
                  size: 32,
                ),
              );
            }),
          ),
        ],
      ],
    );
  }

  Widget _buildCommentsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Comments',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _commentController,
                decoration: InputDecoration(
                  hintText: 'Add a comment...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                ),
                maxLines: 2,
              ),
            ),
            const SizedBox(width: 8),
            IconButton(
              onPressed: _submitComment,
              icon: const Icon(Icons.send),
              style: IconButton.styleFrom(
                backgroundColor: Theme.of(context).primaryColor,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (_isLoadingComments)
          const Center(child: CircularProgressIndicator())
        else if (_comments.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                'No comments yet. Be the first to comment!',
                style: TextStyle(color: Colors.grey[600]),
              ),
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _comments.length,
            separatorBuilder: (context, index) => const Divider(),
            itemBuilder: (context, index) {
              final comment = _comments[index];
              final userName = comment.user?.name ?? 'Anonymous';
              final userAvatar = comment.user?.avatarUrl;
              
              return ListTile(
                contentPadding: EdgeInsets.zero,
                leading: CircleAvatar(
                  backgroundImage: userAvatar != null
                      ? NetworkImage(userAvatar)
                      : null,
                  child: userAvatar == null
                      ? Text(userName[0].toUpperCase())
                      : null,
                ),
                title: Text(
                  userName,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 4),
                    Text(comment.commentText),
                    const SizedBox(height: 4),
                    Text(
                      _formatDate(comment.createdAt),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
      ],
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 7) {
      return '${date.day}/${date.month}/${date.year}';
    } else if (difference.inDays > 0) {
      return '${difference.inDays} ${difference.inDays == 1 ? 'day' : 'days'} ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} ${difference.inHours == 1 ? 'hour' : 'hours'} ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} ${difference.inMinutes == 1 ? 'minute' : 'minutes'} ago';
    } else {
      return 'Just now';
    }
  }
}
