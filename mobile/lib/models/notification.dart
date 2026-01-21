enum NotificationType {
  locationApproved('location_approved'),
  locationRejected('location_rejected'),
  comment('comment'),
  rating('rating'),
  pointsAwarded('points_awarded');

  final String value;
  const NotificationType(this.value);

  static NotificationType fromString(String value) {
    return NotificationType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => NotificationType.comment,
    );
  }
}

class NotificationModel {
  final int id;
  final String type;
  final String message;
  final bool read;
  final DateTime createdAt;
  final Map<String, dynamic>? metadata;

  NotificationModel({
    required this.id,
    required this.type,
    required this.message,
    required this.read,
    required this.createdAt,
    this.metadata,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] as int,
      type: json['type'] as String,
      message: json['message'] as String,
      read: json['read'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }

  String? get locationId => metadata?['locationId'] as String?;
  String? get locationName => metadata?['locationName'] as String?;
  int? get points => metadata?['points'] as int?;
}

class NotificationResponse {
  final List<NotificationModel> notifications;
  final int unreadCount;

  NotificationResponse({
    required this.notifications,
    required this.unreadCount,
  });

  factory NotificationResponse.fromJson(Map<String, dynamic> json) {
    return NotificationResponse(
      notifications: (json['notifications'] as List<dynamic>)
          .map((item) => NotificationModel.fromJson(item as Map<String, dynamic>))
          .toList(),
      unreadCount: json['unreadCount'] as int,
    );
  }
}
