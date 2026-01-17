import { Component, inject, signal, effect } from '@angular/core';
import { LeaderboardService } from './services/leaderboard.service';
import { LeaderboardUser } from './models/leaderboard.model';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  templateUrl: './leaderboard.component.html',
})
export class LeaderboardComponent {
  private leaderboardService = inject(LeaderboardService);
  private authService = inject(AuthService);

  users = signal<LeaderboardUser[]>([]);
  loading = signal(true);

  currentUserId = this.authService.getUserProfile()()?.id || '';

  constructor() {
    effect(() => {
      this.loadLeaderboard();
    });
  }

  loadLeaderboard() {
    this.loading.set(true);

    this.leaderboardService.getLeaderboard().subscribe({
      next: data => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  isCurrentUser(user: LeaderboardUser): boolean {
    return user.id === this.currentUserId;
  }
}
