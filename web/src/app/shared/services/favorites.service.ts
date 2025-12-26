import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Location } from '../models/location.model';

interface Favorite {
  id: string;
  location: Location;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private apiUrl = 'http://localhost:3000';
  private http = inject(HttpClient);

  addFavorite(locationId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/locations/${locationId}/favorite`, {});
  }

  removeFavorite(locationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/locations/${locationId}/favorite`);
  }

  isFavorite(locationId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/locations/${locationId}/favorite/check`);
  }

  getUserFavorites(): Observable<Location[]> {
    return this.http.get<Favorite[]>(`${this.apiUrl}/favorites`).pipe(
      map(favorites => favorites.map(fav => fav.location))
    );
  }
}

