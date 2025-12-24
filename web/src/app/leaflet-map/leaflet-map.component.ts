import {
  AfterViewInit,
  Component,
  PLATFORM_ID,
  inject,
  effect,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LocationsService } from '../shared/services/locations.service';
import { Location, LOCATION_CATEGORIES } from '../shared/models/location.model';
import { LocationDetailsComponent } from '../shared/components/location-details/location-details.component';

@Component({
  selector: 'app-leaflet-map',
  imports: [CommonModule, LocationDetailsComponent],
  templateUrl: './leaflet-map.component.html',
  styleUrl: './leaflet-map.component.css',
})
export class LeafletMapComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private locationsService = inject(LocationsService);

  private map!: any;
  markers: any[] = [];

  isDetailsOpen = false;
  selectedLocation: Location | null = null;

  locationsResource = this.locationsService.locations;

  // Expose resource signals to template
  isLoading = this.locationsResource.isLoading;
  error = this.locationsResource.error;
  locations = this.locationsResource.value;

  constructor() {
    effect(() => {
      const locations = this.locationsResource.value();
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

      this.updateMapMarkers();
    });
  }

  private updateMapMarkers() {
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
          ] || LOCATION_CATEGORIES.other;

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
          .on('click', () => this.openLocationDetails(location));

        this.markers.push(marker);
      });

      this.centerMapOnMarkers();
    });
  }

  private centerMapOnMarkers() {
    if (this.map && this.markers.length > 0) {
      import('leaflet').then((L) => {
        const bounds = L.latLngBounds(
          this.markers.map((marker) => marker.getLatLng())
        );
        this.map.fitBounds(bounds, { padding: [50, 50] });
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
}
