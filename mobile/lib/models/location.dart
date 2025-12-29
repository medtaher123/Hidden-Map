import 'photo.dart';
import 'location_category.dart';

class Location {
  final String id;
  final String name;
  final String description;
  final LocationCategory category;
  final double latitude;
  final double longitude;
  final String address;
  final String city;
  final List<Photo> photos;

  Location({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.latitude,
    required this.longitude,
    required this.address,
    required this.city,
    required this.photos,
  });

  factory Location.fromJson(Map<String, dynamic> json) {
    return Location(
      id: json['id'].toString(),
      name: json['name'] as String,
      description: json['description'] as String,
      category: LocationCategory.values.firstWhere(
        (e) => e.name == json['category'],
        orElse: () => LocationCategory.other,
      ),
      latitude: double.parse(json['latitude'].toString()),
      longitude: double.parse(json['longitude'].toString()),
      address: json['address'] as String,
      city: json['city'] as String,
      photos: (json['photos'] as List<dynamic>?)
              ?.map((p) => Photo.fromJson(p as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'description': description,
      'category': category.name,
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'city': city,
      'photos': photos.map((p) => p.toJson()).toList(),
    };
  }
}
