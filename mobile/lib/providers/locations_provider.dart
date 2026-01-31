import 'package:flutter/material.dart';
import '../models/location.dart';
import '../services/location_service.dart';

class LocationsProvider extends ChangeNotifier {
  LocationService? _locationService;
  String? _token;

  void setToken(String? token) {
    _token = token;
    _locationService = LocationService(token: token);
  }
  
  List<Location> _locations = [];
  bool _isLoading = false;
  String? _error;
  
  // Track viewport bounds and loaded areas
  double? _minLat;
  double? _maxLat;
  double? _minLng;
  double? _maxLng;
  final Set<String> _loadedCells = {};

  List<Location> get locations => _locations;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadLocations() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _locationService ??= LocationService(token: _token);
      _locations = await _locationService!.getLocations();
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load locations based on viewport bounds with a buffer
  /// The buffer adds extra space around the visible area for smoother interactions
  Future<void> loadLocationsByViewport({
    required double minLat,
    required double maxLat,
    required double minLng,
    required double maxLng,
  }) async {
    // Add a buffer (approximately 30% of the current bounds)
    final latDelta = maxLat - minLat;
    final lngDelta = maxLng - minLng;
    final latBuffer = latDelta * 0.3;
    final lngBuffer = lngDelta * 0.3;

    final bufferedMinLat = minLat - latBuffer;
    final bufferedMaxLat = maxLat + latBuffer;
    final bufferedMinLng = minLng - lngBuffer;
    final bufferedMaxLng = maxLng + lngBuffer;

    // Create a cell key to track loaded areas and avoid duplicate requests
    final cellKey = '${bufferedMinLat.toStringAsFixed(2)}_${bufferedMaxLat.toStringAsFixed(2)}_${bufferedMinLng.toStringAsFixed(2)}_${bufferedMaxLng.toStringAsFixed(2)}';

    // Skip if this area has already been loaded
    if (_loadedCells.contains(cellKey)) {
      return;
    }

    _error = null;
    final wasLoading = _isLoading;
    if (!wasLoading) {
      _isLoading = true;
      notifyListeners();
    }

    try {
      _locationService ??= LocationService(token: _token);
      final newLocations = await _locationService!.getLocationsByBounds(
        minLat: bufferedMinLat,
        maxLat: bufferedMaxLat,
        minLng: bufferedMinLng,
        maxLng: bufferedMaxLng,
      );

      // Merge new locations with existing ones (avoid duplicates)
      final existingIds = _locations.map((l) => l.id).toSet();
      final uniqueNewLocations = newLocations.where((l) => !existingIds.contains(l.id)).toList();
      
      _locations.addAll(uniqueNewLocations);
      _loadedCells.add(cellKey);
      _minLat = bufferedMinLat;
      _maxLat = bufferedMaxLat;
      _minLng = bufferedMinLng;
      _maxLng = bufferedMaxLng;
      
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      if (!wasLoading) {
        _isLoading = false;
      }
      notifyListeners();
    }
  }

  Future<void> addLocation(Location location) async {
    try {
      _locationService ??= LocationService(token: _token);
      await _locationService!.createLocation(location);
      await loadLocations(); // Reload locations after adding
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }
}
