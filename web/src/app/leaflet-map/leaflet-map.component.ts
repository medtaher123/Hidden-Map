import {
  AfterViewInit,
  Component,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-leaflet-map',
  imports: [],
  templateUrl: './leaflet-map.component.html',
  styleUrl: './leaflet-map.component.css',
})
export class LeafletMapComponent implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private map!: any;
  markers: any[] = [];

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
      this.centerMap();
    }
  }

  private initMap() {
    // Import Leaflet only in browser environment
    import('leaflet').then((L) => {
      const baseMapURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      this.map = L.map('map');
      L.tileLayer(baseMapURL).addTo(this.map);

      // Initialize markers
      this.markers = [L.marker([36.842836, 10.197503])];

      this.centerMap();
    });
  }

  private centerMap() {
    if (this.map && this.markers.length > 0) {
      import('leaflet').then((L) => {
        const bounds = L.latLngBounds(
          this.markers.map((marker) => marker.getLatLng())
        );
        this.map.fitBounds(bounds);
      });
    }
  }
}
