import 'package:flutter/material.dart';
import '../models/location.dart';
import '../services/location_service.dart';

class LocationsProvider extends ChangeNotifier {
  final LocationService _locationService = LocationService();
  
  List<Location> _locations = [];
  bool _isLoading = false;
  String? _error;

  List<Location> get locations => _locations;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadLocations() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _locations = await _locationService.getLocations();
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addLocation(Location location) async {
    try {
      await _locationService.createLocation(location);
      await loadLocations(); // Reload locations after adding
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }
}
