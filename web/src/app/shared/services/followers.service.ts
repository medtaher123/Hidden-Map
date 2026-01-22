import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { User } from '../models/location.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FollowersService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  follow(userId: string, followerUserId: string) {
    return this.http.post(
      `${this.api}/users/${userId}/follow`,
      { userId,followerUserId }
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
    return this.http.get<User[]>(
      `${this.api}/users/${userId}/follow/followers`
    );
  }

  getFollowing(userId: string) {
    return this.http.get<User[]>(
      `${this.api}/users/${userId}/follow/following`
    );
  }
    isFollowing(userId: string, followerUserId: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.api}/users/${userId}/follow/is-following/${followerUserId}`
    );
    }
}
