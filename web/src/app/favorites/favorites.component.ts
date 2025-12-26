import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationsService } from '../shared/services/locations.service';
import { FavoritesService } from '../shared/services/favorites.service';
import { Location, LOCATION_CATEGORIES } from '../shared/models/location.model';
import { LocationDetailsComponent } from '../discover/location-details/location-details.component';
import { Subject, takeUntil, switchMap, catchError, of, forkJoin } from 'rxjs';

// Mock current user ID - in a real app, this would come from auth service
const CURRENT_USER_ID = '00000000-0000-0000-0000-000000000001';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, LocationDetailsComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
})
export class FavoritesComponent implements OnInit, OnDestroy {
  private locationsService = inject(LocationsService);
  private favoritesService = inject(FavoritesService);
  private destroy$ = new Subject<void>();

  favoriteLocations = signal<Location[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  
  isDetailsOpen = false;
  selectedLocation: Location | null = null;

  ngOnInit() {
    this.loadFavorites();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFavorites() {
    this.isLoading.set(true);
    this.error.set(null);

    // Get all locations and filter favorites
    this.locationsService.getLocations()
      .pipe(
        switchMap((locations: Location[]) => {
          if (locations.length === 0) {
            return of([]);
          }

          // For each location, check if it's a favorite
          const favoriteChecks = locations.map((location: Location) =>
            this.favoritesService.isFavorite(location.id, CURRENT_USER_ID).pipe(
              catchError(() => of(false)),
              switchMap((isFav: boolean) => of({ location, isFav }))
            )
          );

          // Combine all observables
          return forkJoin(favoriteChecks);
        }),
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error loading favorites:', err);
          this.error.set('Failed to load favorites. Please try again.');
          this.isLoading.set(false);
          return of([]);
        })
      )
      .subscribe((results: Array<{ location: Location; isFav: boolean }>) => {
        const favorites = results
          .filter(result => result.isFav)
          .map(result => result.location);
        this.favoriteLocations.set(favorites);
        this.isLoading.set(false);
      });
  }

  getCategoryInfo(category: string) {
    return LOCATION_CATEGORIES[category.toLowerCase() as keyof typeof LOCATION_CATEGORIES] 
      || LOCATION_CATEGORIES.other;
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
    if (!event.isFavorite) {
      // Remove from favorites list
      const currentFavorites = this.favoriteLocations();
      this.favoriteLocations.set(
        currentFavorites.filter(loc => loc.id !== event.locationId)
      );
      this.closeLocationDetails();
    }
  }

  retry() {
    this.loadFavorites();
  }
}

