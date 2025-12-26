import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterLinkWithHref,
} from '@angular/router';
import { APP_ROUTES } from '../config/app-routes.config';
import { AuthService } from '../auth/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterLinkWithHref],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  readonly APP_ROUTES = APP_ROUTES;
  authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.toastr.info('Goodbye! See you soon.');
    this.router.navigate([APP_ROUTES.app.home]).then(() => {
      window.location.reload();
    });
  }
}
