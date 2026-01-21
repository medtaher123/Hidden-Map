import { Injectable, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Location } from '../models/location.model';
import { API_ROUTES } from '../../config/api-routes.config';

interface Favorite {
  id: string;
  location: Location;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private http = inject(HttpClient);

  private locationIdSignal = signal<string | null>(null);

  private userFavoritesReloadTrigger = signal(0);

  isFavoriteResource = rxResource({
    request: () => ({ locationId: this.locationIdSignal() }),
    loader: ({ request }) => {
      if (!request.locationId) {
        throw new Error('Location ID is required');
      }
      return this.http.get<boolean>(API_ROUTES.favorites.check(request.locationId));
    },
  });

  userFavoritesResource = rxResource({
    request: () => ({ trigger: this.userFavoritesReloadTrigger() }),
    loader: () => {
      return this.http.get<Favorite[]>(API_ROUTES.favorites.base).pipe(
        map(favorites => favorites.map(fav => fav.location))
      );
    },
  });

  setLocationId(locationId: string | null) {
    this.locationIdSignal.set(locationId);
  }

  reloadFavoriteStatus() {
    this.isFavoriteResource.reload();
  }

  reloadUserFavorites() {
    this.userFavoritesReloadTrigger.update(v => v + 1);
  }

  addFavorite(locationId: string): Observable<any> {
    return this.http.post(API_ROUTES.favorites.byLocation(locationId), {});
  }

  removeFavorite(locationId: string): Observable<any> {
    return this.http.delete(API_ROUTES.favorites.byLocation(locationId));
  }
}

