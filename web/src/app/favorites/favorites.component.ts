import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FavoritesService } from '../shared/services/favorites.service';
import { AuthService } from '../auth/services/auth.service';
import { Location, LOCATION_CATEGORIES } from '../shared/models/location.model';
import { LocationDetailsComponent } from '../discover/location-details/location-details.component';
import { Subject, takeUntil, catchError, of } from 'rxjs';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, LocationDetailsComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
})
export class FavoritesComponent implements OnInit, OnDestroy {
  private favoritesService = inject(FavoritesService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  favoriteLocations = signal<Location[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  isDetailsOpen = false;
  selectedLocation: Location | null = null;

  ngOnInit() {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadFavorites();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFavorites() {
    this.isLoading.set(true);
    this.error.set(null);

    // Get user's favorite locations directly from the API
    this.favoritesService.getUserFavorites()
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error loading favorites:', err);
          this.error.set('Failed to load favorites. Please try again.');
          this.isLoading.set(false);
          return of([]);
        })
      )
      .subscribe((favorites: Location[]) => {
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

