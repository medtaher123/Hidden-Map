import { Component, EventEmitter, Input, Output, OnInit, OnChanges, OnDestroy, inject, signal, effect, runInInjectionContext, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location, Comment, Rating, LOCATION_CATEGORIES } from '../../shared/models/location.model';
import { RatingsService } from '../../shared/services/ratings.service';
import { CommentsService } from '../../shared/services/comments.service';
import { FavoritesService } from '../../shared/services/favorites.service';
import { AuthService } from '../../auth/services/auth.service';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { UsersService } from '../../shared/services/users.service';
import { User } from '../../shared/models/location.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-location-details',
  imports: [CommonModule, RouterModule],
  templateUrl: './location-details.component.html',
  styleUrl: './location-details.component.css',
})
export class LocationDetailsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() location: Location | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() favoriteChanged = new EventEmitter<{ locationId: string; isFavorite: boolean }>();

  ratingsService = inject(RatingsService);
  commentsService = inject(CommentsService);
  favoritesService = inject(FavoritesService);
  userService = inject(UsersService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();
  private injector = inject(Injector);

  currentPhotoIndex = signal(0);
  userRating = signal(0);
  newComment = signal('');
  isSubmittingComment = signal(false);
  isTogglingFavorite = signal(false);
  currentUserId = signal<string | null>(null);
  submittingUser = signal<User | null>(null);
  


  ngOnInit() {
    // Load current user profile to get user ID
    this.authService.getProfile().pipe(
      takeUntil(this.destroy$),
      catchError(() => of(null))
    ).subscribe(profile => {
      if (profile) {
        this.currentUserId.set(profile.id);
      }
    });

    if (this.location) {
      this.loadLocationData();
    }
      runInInjectionContext(this.injector, () => {
    effect(() => {
      const ratings = this.ratingsService.ratingsResource.value();
      if (ratings) {
        const userId = this.currentUserId();
        const userRatingObj = userId ? ratings.find(r => r.user.id === userId) : null;
        this.userRating.set(userRatingObj?.rating || 0);
      }
      const user = this.userService.userResource.value();
      if (user) {
        this.submittingUser.set(user);
      }
    });
  });
  }

  ngOnChanges() {
    if (this.location) {
      this.currentPhotoIndex.set(0);
      this.loadLocationData();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLocationData() {
    if (!this.location) return;

    const locationId = this.location.id;

    
    this.ratingsService.setLocationId(locationId);
    this.commentsService.setLocationId(locationId);
    this.favoritesService.setLocationId(locationId);
    if (this.location.submittedById) {
      this.userService.setUserId(this.location.submittedById);
    }
  }

  get categoryInfo() {
    if (!this.location) return null;
    const category = this.location.category.toLowerCase();
    return (
      LOCATION_CATEGORIES[category as keyof typeof LOCATION_CATEGORIES] ||
      LOCATION_CATEGORIES.other
    );
  }

  averageRating(): number {
    const ratingsArray = this.ratingsService.ratingsResource.value() || [];
    if (ratingsArray.length === 0) return 0;
    const sum = ratingsArray.reduce((acc: number, r: Rating) => acc + r.rating, 0);
    return sum / ratingsArray.length;
  }

  previousPhoto() {
    if (!this.location?.photos) return;
    const current = this.currentPhotoIndex();
    this.currentPhotoIndex.set(
      current === 0 ? this.location.photos.length - 1 : current - 1
    );
  }

  nextPhoto() {
    if (!this.location?.photos) return;
    const current = this.currentPhotoIndex();
    this.currentPhotoIndex.set(
      current === this.location.photos.length - 1 ? 0 : current + 1
    );
  }

  rateLocation(rating: number) {
    if (!this.location || this.ratingsService.ratingsResource.isLoading() || !this.authService.isAuthenticated()) return;

    const locationId = this.location.id;

    this.ratingsService.rateLocation(locationId, rating)
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error rating location:', err);
          return of(null);
        })
      )
      .subscribe(() => {
        this.userRating.set(rating);
        this.ratingsService.reloadRatings();
      });
  }

  submitComment() {
    if (!this.location || !this.newComment().trim() || this.isSubmittingComment() || !this.authService.isAuthenticated()) return;

    const locationId = this.location.id;
    const commentText = this.newComment().trim();
    this.isSubmittingComment.set(true);

    this.commentsService.addComment(locationId, commentText)
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error submitting comment:', err);
          this.isSubmittingComment.set(false);
          return of(null);
        })
      )
      .subscribe(comment => {
        if (comment) {
          this.newComment.set('');
          this.commentsService.reloadComments();
        }
        this.isSubmittingComment.set(false);
      });
  }

  toggleFavorite() {
    if (!this.location || this.isTogglingFavorite() || !this.authService.isAuthenticated()) return;

    const locationId = this.location.id;
    const isFav = this.favoritesService.isFavoriteResource.value() || false;
    this.isTogglingFavorite.set(true);

    const operation$ = isFav
      ? this.favoritesService.removeFavorite(locationId)
      : this.favoritesService.addFavorite(locationId);

    operation$
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error toggling favorite:', err);
          this.isTogglingFavorite.set(false);
          return of(null);
        })
      )
      .subscribe(() => {
        const newStatus = !isFav;
        this.isTogglingFavorite.set(false);
        this.favoritesService.reloadFavoriteStatus();
        this.favoritesService.reloadUserFavorites();
        this.favoriteChanged.emit({ locationId, isFavorite: newStatus });
      });
  }

  isFavorite(): boolean {
    return this.favoritesService.isFavoriteResource.value() || false;
  }

  onClose() {
    this.close.emit();
  }
}