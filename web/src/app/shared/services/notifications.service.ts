import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { Notification, NotificationResponse } from '../models/notification.model';
import { API_ROUTES } from '../../config/api-routes.config';

@Injectable({
  providedIn: 'root' 
})
export class NotificationsService {
  private http = inject(HttpClient); 

  // Signal-based state 
  private notificationsSignal = signal<Notification[]>([]);
  private unreadCountSignal = signal<number>(0);

  // Computed signals 
  notifications = this.notificationsSignal.asReadonly();
  unreadCount = this.unreadCountSignal.asReadonly();
  
  hasUnread = computed(() => this.unreadCountSignal() > 0);

  // Polling observable 
  private pollingInterval$ = new BehaviorSubject<number>(30000); // 30s default

  /**
   * Get all notifications for current user
   */
  getNotifications(): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${API_ROUTES.notifications}`)
      .pipe(
        tap(response => {
          this.notificationsSignal.set(response.notifications);
          this.unreadCountSignal.set(response.unreadCount);
        }),
        catchError(error => {
          console.error('Error fetching notifications:', error);
          throw error;
        })
      );
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(
      `${API_ROUTES.notifications}/${notificationId}/read`,
      {}
    ).pipe(
      tap(() => {
        // Update local state (PDF Section 3.1.2 - update())
        this.notificationsSignal.update(notifications =>
          notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        this.unreadCountSignal.update(count => Math.max(0, count - 1));
      })
    );
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${API_ROUTES.notifications}/read-all`, {})
      .pipe(
        tap(() => {
          this.notificationsSignal.update(notifications =>
            notifications.map(n => ({ ...n, read: true }))
          );
          this.unreadCountSignal.set(0);
        })
      );
  }

  /**
   * Start polling for new notifications
   */
  startPolling(intervalMs: number = 30000) {
    this.pollingInterval$.next(intervalMs);
    
    return this.pollingInterval$.pipe(
      switchMap(interval$ => 
        interval(interval$).pipe(
          switchMap(() => this.getNotifications())
        )
      )
    );
  }

  /**
   * Stop polling
   */
  stopPolling() {
    this.pollingInterval$.complete();
  }
}