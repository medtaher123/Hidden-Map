import { Routes } from '@angular/router';
import { SubmitComponent } from './submit/submit.component';
import { LeafletMapComponent } from './discover/leaflet-map/leaflet-map.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { authRoutes } from './auth/routes';
import { NotificationsComponent } from './notifications/notifications.component';
import { AuthGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LeafletMapComponent },
  { path: 'submit', component: SubmitComponent },
  {
  path: 'admin',
  loadChildren: () =>
    import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  {
  path: 'leaderboard',
  loadChildren: () =>
    import('./leaderboard/leaderboard.routes')
      .then(m => m.LEADERBOARD_ROUTES),
}
,
  { 
    path: 'notifications', 
    component: NotificationsComponent,
    canActivate: [AuthGuard]
  },
  { path: 'favorites', component: FavoritesComponent },
  ...authRoutes,
];
