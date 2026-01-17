import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { APP_ROUTES } from '../../config/app-routes.config';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const user = this.authService.getUserProfile();

    if (!user() || user()?.role !== 'ADMIN') {
      this.router.navigate([APP_ROUTES.app.home]);
      return false;
    }

    return true;
  }
}
