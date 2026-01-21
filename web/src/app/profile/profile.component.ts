import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Profile } from '../shared/models/profile.model';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../shared/services/profile.service';
import { AuthService } from '../auth/services/auth.service';
import { UsersService } from '../shared/services/users.service';
import { FollowersService } from '../shared/services/followers.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
// profile.page.ts
export class ProfileComponent implements OnInit {
  user!: Profile;
  isOwnProfile = false;
  currentUserId!: string;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private authService: AuthService,
    private followerService: FollowersService,
  ) {}

  ngOnInit() {
    this.authService.getProfile().subscribe(profile => {
      this.currentUserId = profile.id;
      // Load profile after currentUserId is set
      this.route.paramMap.subscribe(params => {
        const profileId = params.get('id')!;
        this.isOwnProfile = profileId === this.currentUserId;
        this.loadProfile(profileId);
      });
    });
  }

  loadProfile(userId: string) {
    this.profileService.getProfile(userId, this.currentUserId).subscribe(user => {
      this.user = user;
    });
  }

  toggleFollow() {
    if (this.user.isFollowed) {
      this.followerService
        .unfollow(this.user.id, this.currentUserId)
        .subscribe(() => {
          this.user.isFollowed = false;
          this.user.followersCount--;
        });
    } else {
      this.followerService
        .follow(this.user.id, this.currentUserId)
        .subscribe(() => {
          this.user.isFollowed = true;
          this.user.followersCount++;
        });
    }
  }
}

