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

  final List<Location> _locations = [];
  bool _isLoading = false;
  String? _error;

  // Grid-based coverage tracking to avoid redundant requests
  // Each cell is a small lat/lng rectangle identified by integer indices
  static const double _cellSize = 0.05; // degrees (~5km) - tune as needed
  final Set<String> _loadedCells = {};

  String _cellKey(int latIndex, int lngIndex) => '$latIndex:$lngIndex';

  Set<String> _cellsForBounds(
      double minLat, double maxLat, double minLng, double maxLng) {
    final Set<String> cells = {};
    final latStart = (minLat / _cellSize).floor();
    final latEnd = (maxLat / _cellSize).floor();
    final lngStart = (minLng / _cellSize).floor();
    final lngEnd = (maxLng / _cellSize).floor();

    for (var i = latStart; i <= latEnd; i++) {
      for (var j = lngStart; j <= lngEnd; j++) {
        cells.add(_cellKey(i, j));
      }
    }
    return cells;
  }

  List<Location> get locations => List.unmodifiable(_locations);
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadLocations() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _locationService ??= LocationService(token: _token);
      final fetched = await _locationService!.getLocations();
      _locations.clear();
      _locations.addAll(fetched);
      // Reset loaded cells when doing a full load
      _loadedCells.clear();
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

    // Compute which grid cells cover the buffered area
    final requestedCells =
        _cellsForBounds(bufferedMinLat, bufferedMaxLat, bufferedMinLng, bufferedMaxLng);

    // If all requested cells have been loaded already, skip the request
    final allLoaded = requestedCells.every((c) => _loadedCells.contains(c));
    if (allLoaded) return;

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
      for (final loc in newLocations) {
        if (!existingIds.contains(loc.id)) _locations.add(loc);
      }

      // Mark all requested cells as loaded
      _loadedCells.addAll(requestedCells);
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      if (!wasLoading) _isLoading = false;
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
