import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PendingLocationsComponent } from './pages/pending-locations/pending-locations.component';
import { AdminGuard } from './guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'pending-locations',
    component: PendingLocationsComponent,
    canActivate: [AdminGuard],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
