import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rating } from '../models/location.model';

@Injectable({
  providedIn: 'root',
})
export class RatingsService {
  private apiUrl = 'http://localhost:3000';
  private http = inject(HttpClient);

  rateLocation(locationId: string, rating: number): Observable<Rating> {
    return this.http.post<Rating>(`${this.apiUrl}/locations/${locationId}/ratings`, {
      rating,
    });
  }

  getRatings(locationId: string): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/locations/${locationId}/ratings`);
  }

  getAverageRating(locationId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/locations/${locationId}/ratings/average`);
  }
}

