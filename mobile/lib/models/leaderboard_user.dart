class LeaderboardUser {
  final String id;
  final String name;
  final int points;
  final int rank;
  final String? avatarUrl;

  LeaderboardUser({
    required this.id,
    required this.name,
    required this.points,
    required this.rank,
    this.avatarUrl,
  });

  factory LeaderboardUser.fromJson(Map<String, dynamic> json) {
    return LeaderboardUser(
      id: json['id'] as String,
      name: json['name'] as String,
      points: json['points'] as int,
      rank: json['rank'] as int,
      avatarUrl: json['avatarUrl'] as String?,
    );
  }
}
