import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'dart:async';
import '../models/location.dart';
import '../models/location_category.dart';
import '../providers/locations_provider.dart';
import '../widgets/location_details_sheet.dart';
import '../services/location_service.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final MapController _mapController = MapController();
  static const LatLng _tunis = LatLng(36.8065, 10.1815);
  Timer? _debounceTimer;
  
  final TextEditingController _searchController = TextEditingController();
  List<Location> _searchResults = [];
  bool _isSearching = false;
  Timer? _searchDebounceTimer;
  bool _isSearchLoading = false;
  LocationCategory? _selectedCategory;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      setState(() {});
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Load initial locations for the default view
      _loadLocationsForCurrentViewport();
    });
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchDebounceTimer?.cancel();
    _searchController.dispose();
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

  void _searchLocations(String query) {
    if (query.isEmpty) {
      setState(() {
        _searchResults = [];
        _isSearching = false;
        _isSearchLoading = false;
      });
      return;
    }

    // Cancel previous search debounce
    _searchDebounceTimer?.cancel();

    setState(() {
      _isSearchLoading = true;
    });

    // Debounce search with 300ms delay
    _searchDebounceTimer = Timer(const Duration(milliseconds: 300), () async {
      try {
        // Get token from shared preferences or auth provider
        final locationService = LocationService();
        final results = await locationService.searchLocations(
          query,
          category: _selectedCategory?.name,
        );
        setState(() {
          _searchResults = results;
          _isSearching = true;
          _isSearchLoading = false;
        });
      } catch (e) {
        setState(() {
          _searchResults = [];
          _isSearching = true;
          _isSearchLoading = false;
        });
      }
    });
  }

  void _navigateToLocation(Location location) {
    _mapController.move(
      LatLng(location.latitude, location.longitude),
      16,
    );
    print('Navigating to location: ${location.name}\n Location details: ${location.toJson()}');
    _showLocationDetails(location);
    setState(() {
      _searchController.clear();
      _searchResults = [];
      _isSearching = false;
    });
  }

  List<Location> _getFilteredLocations(List<Location> locations) {
    if (_selectedCategory == null) {
      return locations;
    }
    return locations
        .where((location) => location.category == _selectedCategory)
        .toList();
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
                  MarkerLayer(markers: _buildMarkers(_getFilteredLocations(provider.locations))),
                ],
              ),
              // Search bar at the top
              Positioned(
                top: 16,
                left: 16,
                right: 16,
                child: Column(
                  children: [
                    // Search input
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: TextField(
                        controller: _searchController,
                        onChanged: _searchLocations,
                        decoration: InputDecoration(
                          hintText: 'Search locations...',
                          prefixIcon: const Icon(Icons.search),
                          suffixIcon: _isSearchLoading
                              ? const Padding(
                                  padding: EdgeInsets.all(8.0),
                                  child: SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  ),
                                )
                              : _searchController.text.isNotEmpty
                                  ? IconButton(
                                      icon: const Icon(Icons.clear),
                                      onPressed: () {
                                        _searchController.clear();
                                        _searchLocations('');
                                      },
                                    )
                                  : null,
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Category filter chips
                    SizedBox(
                      height: 40,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: [
                          const SizedBox(width: 8),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            child: ChoiceChip(
                              label: const Text('All'),
                              selected: _selectedCategory == null,
                              onSelected: (_) {
                                setState(() {
                                  _selectedCategory = null;
                                });
                                if (_searchController.text.isNotEmpty) {
                                  _searchLocations(_searchController.text);
                                }
                              },
                            ),
                          ),
                          ...LocationCategory.values.map((cat) => Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                child: ChoiceChip(
                                  label: Text(cat.displayName),
                                  selected: _selectedCategory == cat,
                                  onSelected: (sel) {
                                    setState(() {
                                      _selectedCategory = sel ? cat : null;
                                    });
                                    if (_searchController.text.isNotEmpty) {
                                      _searchLocations(_searchController.text);
                                    }
                                  },
                                ),
                              )),
                          const SizedBox(width: 8),
                        ],
                      ),
                    ),
                    // Search results dropdown
                    if (_isSearching && _searchResults.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.1),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          constraints: const BoxConstraints(maxHeight: 300),
                          child: ListView.builder(
                            shrinkWrap: true,
                            itemCount: _searchResults.length,
                            itemBuilder: (context, index) {
                              final location = _searchResults[index];
                              return ListTile(
                                onTap: () => _navigateToLocation(location),
                                leading: Container(
                                  width: 32,
                                  height: 32,
                                  decoration: BoxDecoration(
                                    color: location.category.color,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Center(
                                    child: Text(
                                      location.category.emoji,
                                      style: const TextStyle(fontSize: 16),
                                    ),
                                  ),
                                ),
                                title: Text(location.name),
                                subtitle: Text(
                                  location.address,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              );
                            },
                          ),
                        ),
                      )
                    else if (_isSearching && _searchResults.isEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.1),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          padding: const EdgeInsets.all(16),
                          child: Text(
                            'No results found',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.grey,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
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
