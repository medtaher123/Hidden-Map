import {
  AfterViewInit,
  Component,
  PLATFORM_ID,
  inject,
  effect,
  signal,
  computed,
  NgZone,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal, toObservable, rxResource } from '@angular/core/rxjs-interop';
import { debounceTime, map } from 'rxjs/operators';
import { LocationsService } from '../../shared/services/locations.service';
import { Location, LOCATION_CATEGORIES } from '../../shared/models/location.model';
import { LocationDetailsComponent } from '../location-details/location-details.component';
import { query } from 'express';

interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

@Component({
  selector: 'app-leaflet-map',
  imports: [CommonModule, LocationDetailsComponent, FormsModule],
  templateUrl: './leaflet-map.component.html',
  styleUrl: './leaflet-map.component.css',
})
export class LeafletMapComponent implements AfterViewInit {
  LOCATION_CATEGORIES = LOCATION_CATEGORIES;
  private platformId = inject(PLATFORM_ID);
  private locationsService = inject(LocationsService);
  private ngZone = inject(NgZone);

  private map!: any;
  markers: any[] = [];

  isDetailsOpen = false;
  selectedLocation: Location | null = null;

  // Signals
  private allLocations = signal<Location[]>([]);
  private isLoadingViewport = signal(false);
  private viewportBounds = signal<Bounds | null>(null);
  private selectedCategory = signal<string | null>(null);

  @ViewChild('searchContainer') searchContainer!: ElementRef;
  showDropdown = signal(false);

  searchQuery = signal<string>('');
  debouncedSearch = toSignal(
    toObservable(this.searchQuery).pipe(debounceTime(500)),
    { initialValue: '' }
  );

  searchResults = this.locationsService.searchLocations(
    this.debouncedSearch,
    this.selectedCategory
  );
  // Grid-cell coverage tracking
  private cellSize = 0.05; // degrees (~5km)
  private loadedCells = signal<Set<string>>(new Set());
  private debounceTimer: any = null;
  private isInitialLoad = true;

  // Computed filtered locations based on category and search
  filteredLocations = computed(() => {
    const locations = this.allLocations();
    let result = [...locations];

    // Filter by category if selected
    if (this.selectedCategory()) {
      result = result.filter(
        (loc) => loc.category.toLowerCase() === this.selectedCategory()?.toLowerCase()
      );
    }

    return result;
  });

  // Expose signals to template
  isLoading = computed(() => {
    const resourceLoading = this.locationsService.locations.isLoading();
    const viewportLoading = this.isLoadingViewport();
    return resourceLoading || viewportLoading;
  });
  error = this.locationsService.locations.error;
  locations = this.filteredLocations;

  constructor() {
    effect(() => {
      const locations = this.allLocations();
      if (locations && locations.length > 0 && this.map) {
        this.updateMapMarkers();
      }
    });
  }

  retry() {
    this.locationsService.retry();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  private initMap() {
    this.ngZone.runOutsideAngular(() => {
      import('leaflet').then((L) => {
        const baseMapURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        this.map = L.map('map', {
          zoom: 12,
          center: [36.842836, 10.197503], // Default center (Tunis)
          zoomControl: true,
          scrollWheelZoom: true,
        });

        L.tileLayer(baseMapURL, {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(this.map);

        // Load initial viewport
        this.ngZone.run(() => {
          this.isLoadingViewport.set(true);
          this.loadViewportLocations();
        });

        // Listen to map movement
        this.map.on('moveend', () => this.onMapMoved());
      });
    });
  }

  private onMapMoved() {
    // Debounce viewport loading
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.ngZone.run(() => {
        this.loadViewportLocations();
      });
    }, 500);
  }

  private loadViewportLocations() {
    if (!this.map) return;

    const bounds = this.map.getBounds();
    const bufferedBounds = this.addBuffer(bounds, 0.3); // 30% buffer

    this.viewportBounds.set({
      minLat: bufferedBounds.getSouth(),
      maxLat: bufferedBounds.getNorth(),
      minLng: bufferedBounds.getWest(),
      maxLng: bufferedBounds.getEast(),
    });

    const currentBounds = this.viewportBounds();
    if (!currentBounds) return;

    // Check if all cells in buffered bounds are already loaded
    const requiredCells = this.cellsForBounds(
      currentBounds.minLat,
      currentBounds.maxLat,
      currentBounds.minLng,
      currentBounds.maxLng
    );

    const loadedCellsSet = this.loadedCells();
    const allLoaded = Array.from(requiredCells).every((cell) =>
      loadedCellsSet.has(cell)
    );

    if (allLoaded) {
      return; // All cells already loaded
    }

    // Load locations for the buffered bounds
    this.locationsService
      .getLocationsByBounds(
        currentBounds.minLat,
        currentBounds.maxLat,
        currentBounds.minLng,
        currentBounds.maxLng
      )
      .subscribe({
        next: (locations) => {
          // Merge with existing locations (avoid duplicates)
          const existingIds = new Set(this.allLocations().map((l) => l.id));
          const newLocations = locations.filter(
            (l) => !existingIds.has(l.id)
          );
          this.allLocations.set([...this.allLocations(), ...newLocations]);

          // Mark cells as loaded
          const newLoadedCells = new Set(loadedCellsSet);
          requiredCells.forEach((cell) => newLoadedCells.add(cell));
          this.loadedCells.set(newLoadedCells);

          this.isLoadingViewport.set(false);
        },
        error: (err) => {
          console.error('Failed to load viewport locations:', err);
          this.isLoadingViewport.set(false);
        },
      });
  }

  private cellsForBounds(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number
  ): Set<string> {
    const cells = new Set<string>();
    const latStart = Math.floor(minLat / this.cellSize);
    const latEnd = Math.floor(maxLat / this.cellSize);
    const lngStart = Math.floor(minLng / this.cellSize);
    const lngEnd = Math.floor(maxLng / this.cellSize);

    for (let i = latStart; i <= latEnd; i++) {
      for (let j = lngStart; j <= lngEnd; j++) {
        cells.add(`${i}:${j}`);
      }
    }
    return cells;
  }

  private addBuffer(bounds: any, percentage: number) {
    const latDelta = bounds.getNorth() - bounds.getSouth();
    const lngDelta = bounds.getEast() - bounds.getWest();
    const latBuffer = latDelta * percentage;
    const lngBuffer = lngDelta * percentage;

    return {
      getNorth: () => bounds.getNorth() + latBuffer,
      getSouth: () => bounds.getSouth() - latBuffer,
      getEast: () => bounds.getEast() + lngBuffer,
      getWest: () => bounds.getWest() - lngBuffer,
    };
  }

  private updateMapMarkers() {
    this.ngZone.runOutsideAngular(() => {
      import('leaflet').then((L) => {
        // Clear existing markers
        this.markers.forEach((marker) => this.map.removeLayer(marker));
        this.markers = [];

        const _locations = this.locations();
        if (!_locations || _locations.length === 0) {
          return;
        }

        // Add new markers
        _locations.forEach((location) => {
          const categoryInfo =
            LOCATION_CATEGORIES[
              location.category.toLowerCase() as keyof typeof LOCATION_CATEGORIES
            ] || LOCATION_CATEGORIES['other'];

          // Create custom icon
          const markerIcon = L.divIcon({
            html: `
              <div class="custom-marker" style="background-color: ${categoryInfo.color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer; font-size: 20px;">
                ${categoryInfo.icon}
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20],
            className: 'custom-marker-icon',
          });

          const marker = L.marker([location.latitude, location.longitude], {
            icon: markerIcon,
          })
            .addTo(this.map)
            .on('click', () =>
              this.ngZone.run(() => this.openLocationDetails(location))
            );

          this.markers.push(marker);
        });

        // Only fit bounds on initial load
        if (this.isInitialLoad) {
          this.centerMapOnMarkers();
          this.isInitialLoad = false;
        }
      });
    });
  }

  private centerMapOnMarkers() {
    if (this.map && this.markers.length > 0) {
      this.ngZone.runOutsideAngular(() => {
        import('leaflet').then((L) => {
          const bounds = L.latLngBounds(
            this.markers.map((marker) => marker.getLatLng())
          );
          this.map.fitBounds(bounds, { padding: [50, 50] });
        });
      });
    }
  }

  openLocationDetails(location: Location) {
    this.selectedLocation = location;
    this.isDetailsOpen = true;
  }

  closeLocationDetails() {
    this.isDetailsOpen = false;
    setTimeout(() => {
      this.selectedLocation = null;
    }, 300);
  }

  onFavoriteChanged(event: { locationId: string; isFavorite: boolean }) {
    // Optional: You could update the marker appearance or show a notification
    console.log('Favorite status changed:', event);
  }

  // Public methods for filtering (can be called from template if needed)
  setCategory(category: string | null) {
    this.selectedCategory.set(category);
  }

  setSearchQuery(query: string) {
    this.searchQuery.set(query);
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    console.log("cliiickkkk", this.searchContainer);
    if (this.searchContainer && !this.searchContainer.nativeElement.contains(event.target)) {
      console.log("cliiickkkk outside")
      this.showDropdown.set(false);
    }
  }

  onSearchFocus() {
    this.showDropdown.set(true);
  }

  onSearchInput(value: string) {
    this.searchQuery.set(value);
  }

  onSearchResultClick(location: Location) {
    if (this.map) {
      this.map.flyTo([location.latitude, location.longitude], 16, {
        duration: 1.5,
      });
    }
    this.openLocationDetails(location);
    this.searchQuery.set(''); // Clear search
  }
}