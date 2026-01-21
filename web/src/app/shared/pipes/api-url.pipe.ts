// api-url.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { API_ROUTES } from '../../config/api-routes.config';

@Pipe({ name: 'apiUrl' })
export class ApiUrlPipe implements PipeTransform {
  transform(path?: string | null): string {
    if (!path) return '';
    return `${API_ROUTES.base}${path}`;
  }
}
