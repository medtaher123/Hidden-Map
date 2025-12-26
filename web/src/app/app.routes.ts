import { Routes } from '@angular/router';
import { SubmitComponent } from './submit/submit.component';
import { LeafletMapComponent } from './discover/leaflet-map/leaflet-map.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { authRoutes } from './auth/routes';

export const routes: Routes = [
  { path: '', component: LeafletMapComponent },
  { path: 'submit', component: SubmitComponent },
  { path: 'favorites', component: FavoritesComponent },
  ...authRoutes,
];
