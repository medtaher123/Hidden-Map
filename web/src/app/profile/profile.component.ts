import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Profile } from '../shared/models/profile.model';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../shared/services/profile.service';
import { AuthService } from '../auth/services/auth.service';
import { FollowersService } from '../shared/services/followers.service';
import { Subject, takeUntil, catchError, of, forkJoin, combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private followerService = inject(FollowersService);
  private destroy$ = new Subject<void>();

  // Signals for reactive state
  profile = signal<Profile | null>(null);
  currentUserId = signal<string | null>(null);
  isOwnProfile = signal(false);
  isFollowing = signal(false);
  isLoadingProfile = signal(false);
  isTogglingFollow = signal(false);

  ngOnInit() {
    // Use combineLatest to react to both auth and route changes
    combineLatest([
      this.authService.getProfile().pipe(
        catchError(() => of(null))
      ),
      this.route.paramMap
    ])
    .pipe(
      takeUntil(this.destroy$),
      tap(([currentUser, params]) => {
        console.log('Route or auth changed:', { 
          userId: currentUser?.id, 
          profileId: params.get('id') 
        });
      })
    )
    .subscribe(([currentUser, params]) => {
      if (!currentUser) {
        console.log('No current user');
        return;
      }

      this.currentUserId.set(currentUser.id);
      const profileId = params.get('id');
      
      if (!profileId) {
        console.log('No profile ID in route');
        return;
      }

      const isOwn = profileId === currentUser.id;
      this.isOwnProfile.set(isOwn);
      
      console.log('Loading profile:', { profileId, isOwn });
      this.loadProfileData(profileId, currentUser.id);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProfileData(profileId: string, currentUserId: string) {
  console.log('loadProfileData called:', { profileId, currentUserId });
  this.isLoadingProfile.set(true);

  // Reset signals before loading
  this.profile.set(null);
  this.isFollowing.set(false);

  const isOwn = this.isOwnProfile();

  // Load profile and follow status in parallel
  forkJoin({
    profile: this.profileService.getProfile(profileId, currentUserId).pipe(
      tap(p => console.log('Profile loaded:', p)),
      catchError(err => {
        console.error('Error loading profile:', err);
        return of(null);
      })
    ),
    followStatus: !isOwn 
      ? this.followerService.isFollowing(profileId, currentUserId).pipe(
          tap(s => console.log('Follow status loaded:', s)),
          catchError(err => {
            console.error('Error checking follow status:', err);
            return of(false);
          })
        )
      : of(false) // Return boolean directly, not object
  })
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: ({ profile, followStatus }) => {
      console.log('Data loaded:', { profile: profile?.username, isFollowing: followStatus });
      if (profile) {
        this.profile.set(profile);
        this.isFollowing.set(followStatus); // Now followStatus is a boolean
      }
      this.isLoadingProfile.set(false);
    },
    error: (err) => {
      console.error('Error loading profile data:', err);
      this.isLoadingProfile.set(false);
    }
  });
}

  toggleFollow() {
  const user = this.profile();
  const loggedInUserId = this.currentUserId();
  
  console.log('toggleFollow called:', { 
    user: user?.username, 
    loggedInUserId, 
    currentFollowStatus: this.isFollowing() 
  });

  if (!user || !loggedInUserId || this.isTogglingFollow() || !this.authService.isAuthenticated()) {
    console.log('Toggle follow prevented');
    return;
  }

  const userToFollow = user.id;
  const currentFollowStatus = this.isFollowing();
  this.isTogglingFollow.set(true);

  const operation$ = currentFollowStatus
    ? this.followerService.unfollow(userToFollow, loggedInUserId)
    : this.followerService.follow(userToFollow, loggedInUserId);

  operation$
    .pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Error toggling follow:', err);
        // Re-throw the error so we know it failed
        this.isTogglingFollow.set(false);
        throw err;
      })
    )
    .subscribe({
      next: (result) => {
        console.log('Follow operation succeeded:', result);
        
        // Update the follow status and follower count
        const currentProfile = this.profile();
        if (currentProfile) {
          const newStatus = !currentFollowStatus;
          console.log('Updating signals:', { 
            from: currentFollowStatus, 
            to: newStatus,
            followerCountChange: newStatus ? '+1' : '-1'
          });
          
          this.isFollowing.set(newStatus);
          this.profile.set({
            ...currentProfile,
            followersCount: currentProfile.followersCount + (newStatus ? 1 : -1)
          });
        }
        this.isTogglingFollow.set(false);
      },
      error: (err) => {
        console.error('Follow toggle failed:', err);
        this.isTogglingFollow.set(false);
        // Optionally show an error message to the user
      }
    });
}
}