import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LocationsService } from '../shared/services/locations.service';
import { LOCATION_CATEGORIES } from '../shared/models/location.model';

@Component({
  selector: 'app-submit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './submit.component.html',
  styleUrl: './submit.component.css',
})
export class SubmitComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private locationsService = inject(LocationsService);

  form!: FormGroup;
  categories = Object.keys(LOCATION_CATEGORIES);
  categoryOptions = LOCATION_CATEGORIES;

  submitting = signal(false);
  submitted = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.initForm();
  }

  private initForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['cafe', Validators.required],
      latitude: [
        '',
        [Validators.required, Validators.min(-90), Validators.max(90)],
      ],
      longitude: [
        '',
        [Validators.required, Validators.min(-180), Validators.max(180)],
      ],
      address: ['', Validators.required],
      city: ['Tunis', Validators.required],
      photoUrl: ['', Validators.required],
      photoCaption: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const formData = this.form.value;
    const payload = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      address: formData.address,
      city: formData.city,
      photos: [
        {
          url: formData.photoUrl,
          thumbnailUrl: formData.photoUrl,
          caption: formData.photoCaption,
        },
      ],
    };

    this.http.post('http://localhost:3000/locations', payload).subscribe({
      next: () => {
        this.scrollToTop();
        this.submitted.set(true);
        this.form.reset({ category: 'cafe', city: 'Tunis' });
        this.submitting.set(false);
        this.locationsService.locations.reload();
        setTimeout(() => this.submitted.set(false), 3000);
      },
      error: (err) => {
        this.scrollToTop();
        console.error('Submit error:', err);
        this.error.set(
          err.error?.message || 'Failed to submit location. Please try again.'
        );
        this.submitting.set(false);
      },
    });
  }

  private scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm() {
    this.form.reset({ category: 'cafe', city: 'Tunis' });
    this.error.set(null);
  }

  getCategoryLabel(category: string): string {
    return (
      this.categoryOptions[category as keyof typeof LOCATION_CATEGORIES]
        ?.label || category
    );
  }
}
