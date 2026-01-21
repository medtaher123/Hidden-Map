import { Injectable, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/location.model';
import { API_ROUTES } from '../../config/api-routes.config';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private http = inject(HttpClient);

  private locationIdSignal = signal<string | null>(null);

  commentsResource = rxResource({
    request: () => ({ locationId: this.locationIdSignal() }),
    loader: ({ request }) => {
      if (!request.locationId) {
        throw new Error('Location ID is required');
      }
      return this.http.get<Comment[]>(API_ROUTES.comments.byLocation(request.locationId));
    },
  });

  setLocationId(locationId: string | null) {
    this.locationIdSignal.set(locationId);
  }

  reloadComments() {
    this.commentsResource.reload();
  }

  addComment(locationId: string, commentText: string): Observable<Comment> {
    return this.http.post<Comment>(API_ROUTES.comments.byLocation(locationId), {
      commentText,
    });
  }

  deleteComment(locationId: string, commentId: string): Observable<void> {
    return this.http.delete<void>(API_ROUTES.comments.byId(locationId, commentId));
  }
}

