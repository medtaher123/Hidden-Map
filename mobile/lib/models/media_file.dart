class MediaFile {
  final String id;
  final String originalName;
  final String filename;
  final String mimeType;
  final int size;
  final String url;
  final DateTime createdAt;

  MediaFile({
    required this.id,
    required this.originalName,
    required this.filename,
    required this.mimeType,
    required this.size,
    required this.url,
    required this.createdAt,
  });

  factory MediaFile.fromJson(Map<String, dynamic> json) {
    return MediaFile(
      id: json['id'] as String,
      originalName: json['originalName'] as String? ?? '',
      filename: json['filename'] as String? ?? '',
      mimeType: json['mimeType'] as String? ?? '',
      size: json['size'] as int? ?? 0,
      url: json['url'] as String? ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }

  /// Minimal MediaFile when only the id is known (e.g. after upload).
  factory MediaFile.fromId(String id) {
    return MediaFile(
      id: id,
      originalName: '',
      filename: '',
      mimeType: '',
      size: 0,
      url: '',
      createdAt: DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'originalName': originalName,
      'filename': filename,
      'mimeType': mimeType,
      'size': size,
      'url': url,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
