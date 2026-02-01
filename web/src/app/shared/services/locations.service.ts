import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '../models/location.model';
import { rxResource } from '@angular/core/rxjs-interop';
import { retry, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api-routes.config';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  private apiUrl = API_ROUTES.locations.base;
  private http = inject(HttpClient);
  private retryCount = signal(0);

  locations = rxResource({
    loader: () =>
      this.http.get<Location[]>(this.apiUrl).pipe(
        retry({
          count: 3,
          delay: 1000,
        }),
        catchError((error) => {
          console.error('Failed to load locations:', error);
          return of([]);
        })
      ),
  });

  retry() {
    this.retryCount.update((count) => count + 1);
    this.locations.reload();
  }

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(this.apiUrl).pipe(
      retry({
        count: 3,
        delay: 1000,
      }),
      catchError((error) => {
        console.error('Failed to load locations:', error);
        return of([]);
      })
    );
  }

  getLocationsByBounds(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number
  ): Observable<Location[]> {
    return this.http
      .get<Location[]>(this.apiUrl, {
        params: {
          minLat: minLat.toString(),
          maxLat: maxLat.toString(),
          minLng: minLng.toString(),
          maxLng: maxLng.toString(),
        },
      })
      .pipe(
        retry({
          count: 3,
          delay: 1000,
        }),
        catchError((error) => {
          console.error('Failed to load locations by bounds:', error);
          return of([]);
        })
      );
  }

  searchLocations(
    query: string,
    category?: string
  ): Observable<Location[]> {
    const params: any = { query };
    if (category) {
      params.category = category;
    }
    return this.http
      .get<Location[]>(`${this.apiUrl}/search`, { params })
      .pipe(
        retry({
          count: 3,
          delay: 1000,
        }),
        catchError((error) => {
          console.error('Failed to search locations:', error);
          return of([]);
        })
      );
  }

  constructor() {}
}
