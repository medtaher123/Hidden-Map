import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);

  // Expose service signals to template 
  stats = this.dashboardService.stats;
  recentActivity = this.dashboardService.recentActivity;
  locationsByCategory = this.dashboardService.locationsByCategory;
  userGrowth = this.dashboardService.userGrowth;
  topContributors = this.dashboardService.topContributors;
  isLoading = this.dashboardService.isLoading;
  error = this.dashboardService.error;
  
  // Derived stats
  totalApprovedPercentage = this.dashboardService.totalApprovedPercentage;
  totalPendingPercentage = this.dashboardService.totalPendingPercentage;

  // Local state
  selectedTimePeriod = signal<'week' | 'month' | 'year'>('month');

  private subscription = new Subscription(); 

  ngOnInit() {
    this.loadDashboard();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); 
  }

  loadDashboard() {
    this.subscription.add(
      this.dashboardService.getDashboardData().subscribe({
        error: (err) => console.error('Failed to load dashboard:', err)
      })
    );
  }

  refresh() {
    this.dashboardService.refresh();
  }

  getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      'location_submitted': '📍',
      'location_approved': '✅',
      'location_rejected': '❌',
      'comment_added': '💬',
      'rating_added': '⭐',
      'user_registered': '👤'
    };
    return icons[type] || '📌';
  }

  getActivityColor(type: string): string {
    const colors: Record<string, string> = {
      'location_submitted': 'text-blue-600',
      'location_approved': 'text-green-600',
      'location_rejected': 'text-red-600',
      'comment_added': 'text-purple-600',
      'rating_added': 'text-yellow-600',
      'user_registered': 'text-indigo-600'
    };
    return colors[type] || 'text-gray-600';
  }

  getCategoryColor(index: number): string {
    const colors = [
      'bg-blue-600',
      'bg-green-600',
      'bg-purple-600',
      'bg-yellow-600',
      'bg-red-600',
      'bg-indigo-600',
      'bg-pink-600'
    ];
    return colors[index % colors.length];
  }
}