import { Injectable, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/location.model';
import { API_ROUTES } from '../../config/api-routes.config';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);

  private usersReloadTrigger = signal(0);

  private userIdSignal = signal<string | null>(null);

  usersResource = rxResource({
    request: () => ({ trigger: this.usersReloadTrigger() }),
    loader: () => this.http.get<User[]>(API_ROUTES.users.base),
  });

  userResource = rxResource({
    request: () => ({ id: this.userIdSignal() }),
    loader: ({ request }) => {
      if (!request.id) {
        throw new Error('User ID is required');
      }
      return this.http.get<User>(`${API_ROUTES.users.base}/${request.id}`);
    },
  });

  setUserId(id: string | null) {
    this.userIdSignal.set(id);
  }

  reloadUsers() {
    this.usersReloadTrigger.update(v => v + 1);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(API_ROUTES.users.base, user);
  }
}

