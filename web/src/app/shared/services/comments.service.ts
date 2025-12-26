import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/location.model';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private apiUrl = 'http://localhost:3000';
  private http = inject(HttpClient);

  addComment(locationId: string, commentText: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/locations/${locationId}/comments`, {
      commentText,
    });
  }

  getComments(locationId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/locations/${locationId}/comments`);
  }

  deleteComment(locationId: string, commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/locations/${locationId}/comments/${commentId}`);
  }
}

