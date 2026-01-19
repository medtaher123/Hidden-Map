import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { 
  DashboardData, 
  DashboardStats, 
  ActivityItem
} from './../models/dashboard.model';
import { API_ROUTES } from '../../config/api-routes.config';

@Injectable({
  providedIn: 'root' //  Singleton service
})
export class DashboardService {
  private http = inject(HttpClient); 

  // Signal-based state 
  private dashboardDataSignal = signal<DashboardData | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Read-only signals 
  dashboardData = this.dashboardDataSignal.asReadonly();
  isLoading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  // Computed signals 
  stats = computed(() => this.dashboardDataSignal()?.stats ?? null);
  recentActivity = computed(() => this.dashboardDataSignal()?.recentActivity ?? []);
  locationsByCategory = computed(() => this.dashboardDataSignal()?.locationsByCategory ?? []);
  userGrowth = computed(() => this.dashboardDataSignal()?.userGrowth ?? []);
  topContributors = computed(() => this.dashboardDataSignal()?.topContributors ?? []);

  // Derived stats 
  totalApprovedPercentage = computed(() => {
    const stats = this.stats();
    if (!stats || stats.totalLocations === 0) return 0;
    return Math.round((stats.approvedLocations / stats.totalLocations) * 100);
  });

  totalPendingPercentage = computed(() => {
    const stats = this.stats();
    if (!stats || stats.totalLocations === 0) return 0;
    return Math.round((stats.pendingLocations / stats.totalLocations) * 100);
  });

  /**
   * Fetch all dashboard data
   */
  getDashboardData(): Observable<DashboardData> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<DashboardData>(API_ROUTES.admin.dashboard)
      .pipe(
        tap(data => {
          this.dashboardDataSignal.set(data);
          this.loadingSignal.set(false);
        }),
        catchError(error => {
          this.errorSignal.set('Failed to load dashboard data');
          this.loadingSignal.set(false);
          console.error('Dashboard error:', error);
          throw error;
        })
      );
  }

  /**
   * Get only stats (lighter request)
   */
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(API_ROUTES.admin.dashboardStats)
      .pipe(
        tap(stats => {
          // Update only stats part (PDF Section 3.1.2)
          this.dashboardDataSignal.update(data => 
            data ? { ...data, stats } : null
          );
        })
      );
  }

  /**
   * Refresh dashboard data
   */
  refresh(): void {
    this.getDashboardData().subscribe();
  }
}