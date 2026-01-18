import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../shared/services/notifications.service';
import { Notification } from '../shared/models/notification.model';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule], // PDF Section 1.1 - standalone imports
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private notificationsService = inject(NotificationsService);
  private router = inject(Router);

  // Signals from service (PDF Section 3)
  notifications = this.notificationsService.notifications;
  unreadCount = this.notificationsService.unreadCount;
  
  // Local loading state
  isLoading = signal(false);

  private subscription = new Subscription(); // PDF Section 20.2

  ngOnInit() {
    this.loadNotifications();
    this.startPolling();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); // PDF Section 20.2 - cleanup
    this.notificationsService.stopPolling();
  }

  loadNotifications() {
    this.isLoading.set(true);
    
    this.subscription.add(
      this.notificationsService.getNotifications().subscribe({
        next: () => this.isLoading.set(false),
        error: (err) => {
          console.error('Failed to load notifications', err);
          this.isLoading.set(false);
        }
      })
    );
  }

  startPolling() {
    // Poll every 30 seconds (PDF Section 16 - Observables)
    this.subscription.add(
      this.notificationsService.startPolling(30000).subscribe()
    );
  }

  markAsRead(notification: Notification) {
    if (!notification.read) {
      this.notificationsService.markAsRead(notification.id).subscribe({
        next: () => {
          // Navigate based on notification type
          if (notification.type === 'location_approved' && notification.message.includes('submitted for review')) {
            // Admin notification about new submission - go to admin page
            this.router.navigate(['/admin/pending-locations']);
          } else if (notification.metadata?.locationId) {
            // User notification about their location - go to discover
            this.router.navigate(['/discover', notification.metadata.locationId]);
          }
        },
        error: (err) => console.error('Failed to mark as read', err)
      });
    }
  }

  markAllAsRead() {
    this.notificationsService.markAllAsRead().subscribe({
      error: (err) => console.error('Failed to mark all as read', err)
    });
  }

  getNotificationIcon(type: Notification['type']): string {
    const icons = {
      'location_approved': '✅',
      'location_rejected': '❌',
      'comment': '💬',
      'rating': '⭐',
      'points_awarded': '🏆'
    };
    return icons[type] || '🔔';
  }
}