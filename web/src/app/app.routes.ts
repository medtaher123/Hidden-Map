import { Routes } from '@angular/router';
import { LeafletMapComponent } from './leaflet-map/leaflet-map.component';
import { SubmitComponent } from './submit/submit.component';

export const routes: Routes = [
  { path: '', component: LeafletMapComponent },
  { path: 'submit', component: SubmitComponent },
];
