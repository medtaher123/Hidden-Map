class Photo {
  final String id;
  final String url;
  final String? thumbnailUrl;
  final String? caption;

  Photo({
    required this.id,
    required this.url,
    this.thumbnailUrl,
    this.caption,
  });

  factory Photo.fromJson(Map<String, dynamic> json) {
    return Photo(
      id: json['id'].toString(),
      url: json['url'] as String,
      thumbnailUrl: json['thumbnailUrl'] as String?,
      caption: json['caption'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'url': url,
      'thumbnailUrl': thumbnailUrl,
      'caption': caption,
    };
  }
}
