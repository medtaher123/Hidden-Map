import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '../../config/api-routes.config';
import { HttpClient } from '@angular/common/http';
import { of, Observable, map, tap } from 'rxjs';
import { FileUploadResponse } from '../models/file-upload.modal';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private http = inject(HttpClient);

  upload(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    
    formData.append('file', file); 

    return this.http.post<FileUploadResponse>(
      API_ROUTES.files.upload,
      formData
    ).pipe(
      tap((v: FileUploadResponse) => {
        v.fullUrl = `${API_ROUTES.base}${v.url}`;
        console.log("hiiiii",v)
      })
    )
  }
}
