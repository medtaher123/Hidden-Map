import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PendingLocation } from '../models/pending-location.model';
import { API_ROUTES } from '../../config/api-routes.config';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  getPendingLocations(): Observable<PendingLocation[]> {
    return this.http.get<PendingLocation[]>(
      API_ROUTES.admin.pendingLocations
    );
  }

  approveLocation(id: string): Observable<void> {
    return this.http.post<void>(
      API_ROUTES.admin.approveLocation(id),
      {}
    );
  }

  rejectLocation(id: string): Observable<void> {
    return this.http.post<void>(
      API_ROUTES.admin.rejectLocation(id),
      {}
    );
  }
}
