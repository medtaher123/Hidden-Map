import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FavoritesService } from '../shared/services/favorites.service';
import { AuthService } from '../auth/services/auth.service';
import { Location, LOCATION_CATEGORIES } from '../shared/models/location.model';
import { LocationDetailsComponent } from '../discover/location-details/location-details.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, LocationDetailsComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
})
export class FavoritesComponent implements OnInit, OnDestroy {
  favoritesService = inject(FavoritesService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  isDetailsOpen = false;
  selectedLocation: Location | null = null;

  ngOnInit() {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.favoritesService.reloadUserFavorites();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
      this.favoritesService.reloadUserFavorites();
      this.closeLocationDetails();
    }
  }

  retry() {
    this.favoritesService.reloadUserFavorites();
  }
}

