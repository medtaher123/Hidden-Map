import { Injectable, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rating } from '../models/location.model';
import { API_ROUTES } from '../../config/api-routes.config';

@Injectable({
  providedIn: 'root',
})
export class RatingsService {
  private http = inject(HttpClient);

  private locationIdSignal = signal<string | null>(null);

  ratingsResource = rxResource({
    request: () => ({ locationId: this.locationIdSignal() }),
    loader: ({ request }) => {
      if (!request.locationId) {
        throw new Error('Location ID is required');
      }
      return this.http.get<Rating[]>(API_ROUTES.ratings.byLocation(request.locationId));
    },
  });

  averageRatingResource = rxResource({
    request: () => ({ locationId: this.locationIdSignal() }),
    loader: ({ request }) => {
      if (!request.locationId) {
        throw new Error('Location ID is required');
      }
      return this.http.get<number>(API_ROUTES.ratings.average(request.locationId));
    },
  });

  setLocationId(locationId: string | null) {
    this.locationIdSignal.set(locationId);
  }

  reloadRatings() {
    this.ratingsResource.reload();
  }

  reloadAverageRating() {
    this.averageRatingResource.reload();
  }

  reloadAll() {
    this.ratingsResource.reload();
    this.averageRatingResource.reload();
  }

  rateLocation(locationId: string, rating: number): Observable<Rating> {
    return this.http.post<Rating>(API_ROUTES.ratings.byLocation(locationId), {
      rating,
    });
  }
}

