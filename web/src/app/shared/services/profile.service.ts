import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile } from '../models/profile.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

    getProfile(userId: string, currentUserId?: string): Observable<Profile> {
        const params = currentUserId ? `?currentUserId=${currentUserId}` : '';
        return this.http.get<Profile>(`${this.api}/users/${userId}/profile${params}`);
    }

  follow(userId: string, followerUserId: string) {
    return this.http.post(
      `${this.api}/users/${userId}/follow`,
      { followerUserId }
    );
  }

  unfollow(userId: string, followerUserId: string) {
    return this.http.request(
      'delete',
      `${this.api}/users/${userId}/follow`,
      { body: { followerUserId } }
    );
  }

  getFollowers(userId: string) {
    return this.http.get<Profile[]>(
      `${this.api}/users/${userId}/follow/followers`
    );
  }

  getFollowing(userId: string) {
    return this.http.get<Profile[]>(
      `${this.api}/users/${userId}/follow/following`
    );
  }
}
