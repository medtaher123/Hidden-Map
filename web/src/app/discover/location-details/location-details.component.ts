import { Component, EventEmitter, Input, Output, OnInit, OnChanges, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location, Comment, Rating, LOCATION_CATEGORIES } from '../../shared/models/location.model';
import { RatingsService } from '../../shared/services/ratings.service';
import { CommentsService } from '../../shared/services/comments.service';
import { FavoritesService } from '../../shared/services/favorites.service';
import { Subject, takeUntil, catchError, of, forkJoin } from 'rxjs';

// Mock current user ID - in a real app, this would come from auth service
const CURRENT_USER_ID = '00000000-0000-0000-0000-000000000001';

@Component({
  selector: 'app-location-details',
  imports: [CommonModule],
  templateUrl: './location-details.component.html',
  styleUrl: './location-details.component.css',
})
export class LocationDetailsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() location: Location | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() favoriteChanged = new EventEmitter<{ locationId: string; isFavorite: boolean }>();

  private ratingsService = inject(RatingsService);
  private commentsService = inject(CommentsService);
  private favoritesService = inject(FavoritesService);
  private destroy$ = new Subject<void>();

  // Signals for reactive state
  currentPhotoIndex = signal(0);
  ratings = signal<Rating[]>([]);
  comments = signal<Comment[]>([]);
  userRating = signal(0);
  newComment = signal('');
  favoriteStatus = signal(false);
  isLoadingComments = signal(false);
  isLoadingRatings = signal(false);
  isSubmittingComment = signal(false);
  isTogglingFavorite = signal(false);

  ngOnInit() {
    if (this.location) {
      this.loadLocationData();
    }
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

    // Load all data in parallel using forkJoin for better performance
    this.isLoadingRatings.set(true);
    this.isLoadingComments.set(true);

    forkJoin({
      ratings: this.ratingsService.getRatings(locationId).pipe(
        catchError(err => {
          console.error('Error loading ratings:', err);
          return of([]);
        })
      ),
      comments: this.commentsService.getComments(locationId).pipe(
        catchError(err => {
          console.error('Error loading comments:', err);
          return of([]);
        })
      ),
      isFavorite: this.favoritesService.isFavorite(locationId, CURRENT_USER_ID).pipe(
        catchError(err => {
          console.error('Error checking favorite status:', err);
          return of(false);
        })
      )
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ ratings, comments, isFavorite }) => {
        this.ratings.set(ratings);
        const userRatingObj = ratings.find(r => r.user.id === CURRENT_USER_ID);
        this.userRating.set(userRatingObj?.rating || 0);
        this.isLoadingRatings.set(false);

        this.comments.set(comments);
        this.isLoadingComments.set(false);

        this.favoriteStatus.set(isFavorite);
      },
      error: (err) => {
        console.error('Error loading location data:', err);
        this.isLoadingRatings.set(false);
        this.isLoadingComments.set(false);
      }
    });
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
    const ratingsArray = this.ratings();
    if (ratingsArray.length === 0) return 0;
    const sum = ratingsArray.reduce((acc, r) => acc + r.rating, 0);
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
    if (!this.location || this.isLoadingRatings()) return;

    const locationId = this.location.id;
    this.isLoadingRatings.set(true);

    this.ratingsService.rateLocation(locationId, CURRENT_USER_ID, rating)
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error rating location:', err);
          this.isLoadingRatings.set(false);
          return of(null);
        })
      )
      .subscribe(() => {
        this.userRating.set(rating);
        // Reload ratings to update average
        this.ratingsService.getRatings(locationId)
          .pipe(
            takeUntil(this.destroy$),
            catchError(err => {
              console.error('Error reloading ratings:', err);
              return of([]);
            })
          )
          .subscribe(ratings => {
            this.ratings.set(ratings);
            this.isLoadingRatings.set(false);
          });
      });
  }

  submitComment() {
    if (!this.location || !this.newComment().trim() || this.isSubmittingComment()) return;

    const locationId = this.location.id;
    const commentText = this.newComment().trim();
    this.isSubmittingComment.set(true);

    this.commentsService.addComment(locationId, CURRENT_USER_ID, commentText)
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
          this.comments.set([...this.comments(), comment]);
          this.newComment.set('');
        }
        this.isSubmittingComment.set(false);
      });
  }

  toggleFavorite() {
    if (!this.location || this.isTogglingFavorite()) return;

    const locationId = this.location.id;
    const isFav = this.favoriteStatus();
    this.isTogglingFavorite.set(true);

    const operation$ = isFav
      ? this.favoritesService.removeFavorite(locationId, CURRENT_USER_ID)
      : this.favoritesService.addFavorite(locationId, CURRENT_USER_ID);

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
        this.favoriteStatus.set(newStatus);
        this.isTogglingFavorite.set(false);
        // Emit event to parent component
        this.favoriteChanged.emit({ locationId, isFavorite: newStatus });
      });
  }

  isFavorite(): boolean {
    return this.favoriteStatus();
  }

  onClose() {
    this.close.emit();
  }
}
