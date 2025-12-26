import { Injectable, inject } from '@angular/core';
import { CredentialsDto } from '../dto/credentials.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { UserProfileDto } from '../dto/user-profile.dto';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { API_ROUTES } from '../../config/api-routes.config';
import { ACCESS_TOKEN } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  login(credentials: CredentialsDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(API_ROUTES.auth.login, credentials);
  }

  register(credentials: CredentialsDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(
      API_ROUTES.auth.register,
      credentials
    );
  }

  getProfile(): Observable<UserProfileDto> {
    return this.http.post<UserProfileDto>(API_ROUTES.auth.profile, {});
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN);
  }

  logout() {
    localStorage.removeItem(ACCESS_TOKEN);
  }
}
