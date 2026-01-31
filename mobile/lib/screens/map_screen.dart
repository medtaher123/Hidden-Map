import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'dart:async';
import '../models/location.dart';
import '../providers/locations_provider.dart';
import '../widgets/location_details_sheet.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final MapController _mapController = MapController();
  static const LatLng _tunis = LatLng(36.8065, 10.1815);
  Timer? _debounceTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Load initial locations for the default view
      _loadLocationsForCurrentViewport();
    });
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }

  void _loadLocationsForCurrentViewport() {
    final bounds = _mapController.camera.visibleBounds;
    
    context.read<LocationsProvider>().loadLocationsByViewport(
      minLat: bounds.south,
      maxLat: bounds.north,
      minLng: bounds.west,
      maxLng: bounds.east,
    );
  }

  void _onMapMoved() {
    // Cancel the previous debounce timer if it exists
    _debounceTimer?.cancel();
    
    // Create a new timer
    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      _loadLocationsForCurrentViewport();
    });
  }

  List<Marker> _buildMarkers(List<Location> locations) {
    return locations.map((location) {
      return Marker(
        point: LatLng(location.latitude, location.longitude),
        width: 40,
        height: 40,
        child: GestureDetector(
          onTap: () => _showLocationDetails(location),
          child: Container(
            decoration: BoxDecoration(
              color: location.category.color,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.3),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Center(
              child: Text(
                location.category.emoji,
                style: const TextStyle(fontSize: 20),
              ),
            ),
          ),
        ),
      );
    }).toList();
  }

  void _showLocationDetails(Location location) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => LocationDetailsSheet(location: location),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<LocationsProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.locations.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(
                    'Failed to load locations',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    provider.error!,
                    style: Theme.of(context).textTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: provider.loadLocations,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          return Stack(
            children: [
              FlutterMap(
                mapController: _mapController,
                options: MapOptions(
                  initialCenter: _tunis,
                  initialZoom: 12,
                  minZoom: 5,
                  maxZoom: 18,
                  onPositionChanged: (position, bool hasGesture) {
                    if (hasGesture) {
                      _onMapMoved();
                    }
                  },
                ),  
                children: [
                  TileLayer(
                    urlTemplate:
                        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.example.mobile',
                  ),
                  MarkerLayer(markers: _buildMarkers(provider.locations)),
                ],
              ),
              if (provider.isLoading)
                const Positioned(
                  top: 16,
                  right: 16,
                  child: Card(
                    child: Padding(
                      padding: EdgeInsets.all(8.0),
                      child: CircularProgressIndicator(),
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
