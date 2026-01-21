import { Component, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { PendingLocation } from '../../models/pending-location.model';

@Component({
  selector: 'app-pending-locations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-locations.component.html',
})
export class PendingLocationsComponent {
  private adminService = inject(AdminService);

  pendingLocations = signal<PendingLocation[]>([]);
  loading = signal(true);

  constructor() {
    effect(() => {
      this.loadPendingLocations();
    });
  }

  loadPendingLocations() {
    this.loading.set(true);
    this.adminService.getPendingLocations().subscribe({
      next: data => this.pendingLocations.set(data),
      complete: () => this.loading.set(false),
    });
  }

  approve(id: string) {
    this.adminService.approveLocation(id).subscribe({
      next: () => {
        this.loadPendingLocations();
      },
      error: (err) => {
        console.error('Error approving location:', err);
      }
    });
  }

  reject(id: string) {
    this.adminService.rejectLocation(id).subscribe({
      next: () => {
        this.loadPendingLocations();
      },
      error: (err) => {
        console.error('Error rejecting location:', err);
      }
    });
  }
}
