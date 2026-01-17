import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api-routes.config';
import { LeaderboardUser } from '../models/leaderboard.model';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  private http = inject(HttpClient);

  getLeaderboard(): Observable<LeaderboardUser[]> {
    return this.http.get<LeaderboardUser[]>(
      API_ROUTES.leaderboard.base
    );
  }
}
