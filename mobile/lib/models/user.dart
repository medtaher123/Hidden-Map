enum UserRole {
  admin('ADMIN'),
  user('USER');

  final String value;
  const UserRole(this.value);

  static UserRole fromString(String value) {
    return UserRole.values.firstWhere(
      (role) => role.value == value,
      orElse: () => UserRole.user,
    );
  }
}

class User {
  final String id;
  final String name;
  final String email;
  final String? avatarUrl;
  final String? bio;
  final int points;
  final UserRole role;
  final bool isActive;
  final int? followersCount;
  final int? followingCount;
  final bool? isFollowed;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.avatarUrl,
    this.bio,
    this.points = 0,
    this.role = UserRole.user,
    this.isActive = true,
    this.followersCount,
    this.followingCount,
    this.isFollowed,
    this.createdAt,
    this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      bio: json['bio'] as String?,
      points: json['points'] as int? ?? 0,
      role: json['role'] != null
          ? UserRole.fromString(json['role'] as String)
          : UserRole.user,
      isActive: json['isActive'] as bool? ?? true,
      followersCount: json['followersCount'] as int?,
      followingCount: json['followingCount'] as int?,
      isFollowed: json['isFollowed'] as bool?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'avatarUrl': avatarUrl,
      'bio': bio,
      'points': points,
      'role': role.value,
      'isActive': isActive,
      'followersCount': followersCount,
      'followingCount': followingCount,
      'isFollowed': isFollowed,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  User copyWith({
    String? id,
    String? name,
    String? email,
    String? avatarUrl,
    String? bio,
    int? points,
    UserRole? role,
    bool? isActive,
    int? followersCount,
    int? followingCount,
    bool? isFollowed,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      bio: bio ?? this.bio,
      points: points ?? this.points,
      role: role ?? this.role,
      isActive: isActive ?? this.isActive,
      followersCount: followersCount ?? this.followersCount,
      followingCount: followingCount ?? this.followingCount,
      isFollowed: isFollowed ?? this.isFollowed,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
