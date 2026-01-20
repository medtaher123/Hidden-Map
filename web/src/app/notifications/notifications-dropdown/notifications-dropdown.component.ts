import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NotificationsService } from '../../shared/services/notifications.service';
import { Notification } from '../../shared/models/notification.model';

@Component({
  selector: 'app-notifications-dropdown',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="relative">
      <button 
        (click)="toggleDropdown()"
        class="relative p-2 hover:bg-gray-100 rounded-full transition">
        <span class="text-2xl">🔔</span>
        
        @if (hasUnread()) {
          <span class="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {{ unreadCount() }}
          </span>
        }
      </button>

      @if (isOpen()) {
        <div class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <!-- Header -->
          <div class="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 class="font-semibold">Notifications</h3>
            <a routerLink="/notifications" (click)="closeDropdown()" class="text-sm text-blue-600 hover:underline">
              View All
            </a>
          </div>

          <!-- List (max 5 items) -->
          <div class="max-h-96 overflow-y-auto">
            @for (notification of recentNotifications(); track notification.id) {
              <div 
                (click)="markAsRead(notification)"
                [class]="
                  'px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ' +
                  (notification.read ? '' : 'bg-blue-50')
                ">
                <p class="text-sm" [class.font-semibold]="!notification.read">
                  {{ notification.message }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ notification.createdAt | date:'short' }}
                </p>
              </div>
            } @empty {
              <p class="px-4 py-8 text-center text-gray-500">No notifications</p>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class NotificationsDropdownComponent {
  private notificationsService = inject(NotificationsService);
  private router = inject(Router);

  unreadCount = this.notificationsService.unreadCount;
  hasUnread = this.notificationsService.hasUnread;
  
  isOpen = signal(false);
  
  // Show only first 5
  recentNotifications = computed(() => 
    this.notificationsService.notifications().slice(0, 5)
  );

  toggleDropdown() {
    this.isOpen.update(v => !v);
  }

  closeDropdown() {
    this.isOpen.set(false);
  }

  markAsRead(notification: Notification) {
    this.notificationsService.markAsRead(notification.id).subscribe();
    this.closeDropdown();
    
    // Navigate based on notification type
    if (notification.type === 'location_approved') {
      if (notification.message.includes('submitted for review')) {
        // Admin notification about new submission - go to admin page
        this.router.navigate(['/admin/pending-locations']);
      } else {
        // User notification about approved location - go to discover
        this.router.navigate(['/']);
      }
    } else if (notification.type === 'points_awarded') {
      // Points notification - go to leaderboard
      this.router.navigate(['/leaderboard']);
    } else if (notification.metadata?.locationId) {
      // Other location-related notifications - go to discover
      this.router.navigate(['/']);
    }
  }
}
