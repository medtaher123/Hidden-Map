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
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [FormsModule, RouterLink],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  readonly APP_ROUTES = APP_ROUTES;

  register(credentials: CredentialsDto) {
    this.authService
      .register(credentials)
      .pipe(
        switchMap((response: AuthResponseDto) => {
          localStorage.setItem(ACCESS_TOKEN, response.access_token);
          return this.authService.getProfile();
        })
      )
      .subscribe({
        next: (profile) => {
          this.toastr.success(
            `Welcome, ${profile.name}! Your account has been created.`
          );
          this.router.navigate([APP_ROUTES.app.home]);
        },
        error: (error) => {
          this.toastr.error('Something went wrong');
        },
      });
  }
}
