import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CredentialsDto } from '../dto/credentials.dto';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { FormsModule } from '@angular/forms';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { ACCESS_TOKEN } from '../constants';
import { APP_ROUTES } from '../../config/app-routes.config';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, RouterLink],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  readonly APP_ROUTES = APP_ROUTES;

  login(credentials: CredentialsDto) {
    this.authService
      .login(credentials)
      .pipe(
        switchMap((response: AuthResponseDto) => {
          localStorage.setItem(ACCESS_TOKEN, response.access_token);
          return this.authService.getProfile();
        })
      )
      .subscribe({
        next: (profile) => {
          this.toastr.success(`Welcome back, ${profile.name}`);
          this.router.navigate([APP_ROUTES.app.home]);
        },
        error: (error) => {
          this.toastr.error('Please verify your credentials');
        },
      });
  }
}
