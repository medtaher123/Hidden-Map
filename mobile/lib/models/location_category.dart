import 'package:flutter/material.dart';

enum LocationCategory {
  cafe,
  art,
  park,
  shop,
  restaurant,
  museum,
  viewpoint,
  nightlife,
  other;

  String get displayName {
    switch (this) {
      case LocationCategory.cafe:
        return 'Café';
      case LocationCategory.art:
        return 'Art & Culture';
      case LocationCategory.park:
        return 'Park & Nature';
      case LocationCategory.shop:
        return 'Shop & Market';
      case LocationCategory.restaurant:
        return 'Restaurant';
      case LocationCategory.museum:
        return 'Museum';
      case LocationCategory.viewpoint:
        return 'Viewpoint';
      case LocationCategory.nightlife:
        return 'Nightlife';
      case LocationCategory.other:
        return 'Other';
    }
  }

  Color get color {
    switch (this) {
      case LocationCategory.cafe:
        return const Color(0xFF8B4513);
      case LocationCategory.art:
        return const Color(0xFF9333EA);
      case LocationCategory.park:
        return const Color(0xFF10B981);
      case LocationCategory.shop:
        return const Color(0xFFEC4899);
      case LocationCategory.restaurant:
        return const Color(0xFFEF4444);
      case LocationCategory.museum:
        return const Color(0xFF3B82F6);
      case LocationCategory.viewpoint:
        return const Color(0xFF06B6D4);
      case LocationCategory.nightlife:
        return const Color(0xFF8B5CF6);
      case LocationCategory.other:
        return const Color(0xFF6B7280);
    }
  }

  String get emoji {
    switch (this) {
      case LocationCategory.cafe:
        return '☕';
      case LocationCategory.art:
        return '🎨';
      case LocationCategory.park:
        return '🌳';
      case LocationCategory.shop:
        return '🛍️';
      case LocationCategory.restaurant:
        return '🍴';
      case LocationCategory.museum:
        return '🏛️';
      case LocationCategory.viewpoint:
        return '👁️';
      case LocationCategory.nightlife:
        return '🌙';
      case LocationCategory.other:
        return '📍';
    }
  }
}
