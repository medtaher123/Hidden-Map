import { Component, signal, inject, OnInit } from '@angular/core';
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
import { NotificationsService } from '../shared/services/notifications.service';
import { NotificationsDropdownComponent } from '../notifications/notifications-dropdown/notifications-dropdown.component';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterLinkWithHref, NotificationsDropdownComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  readonly APP_ROUTES = APP_ROUTES;
  authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private notificationsService = inject(NotificationsService);

  isMenuOpen = signal(false);
  user = this.authService.getUserProfile();
  
  // Expose notification signals to template
  unreadCount = this.notificationsService.unreadCount;
  hasUnread = this.notificationsService.hasUnread;

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.authService.fetchAndStoreProfile().subscribe({
        error: (err) => {
          console.error('Failed to fetch profile:', err);
        },
      });
      
      // Load notifications
      this.notificationsService.getNotifications().subscribe();
    }
  }

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
