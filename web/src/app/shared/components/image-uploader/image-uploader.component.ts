import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, inject, Output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FileService } from '../../services/file.service';
import { FileUploadResponse } from '../../models/file-upload.modal';
import { ApiUrlPipe } from "../../pipes/api-url.pipe";

@Component({
  selector: 'app-image-uploader',
  imports: [CommonModule, ApiUrlPipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploaderComponent), // Must match your class name exactly
      multi: true,
    },
  ],
  templateUrl: './image-uploader.component.html',
  styleUrl: './image-uploader.component.css'
})
export class ImageUploaderComponent implements ControlValueAccessor {
  //private locationsService = inject(LocationsService);
  private fileService = inject(FileService);

  images = signal<FileUploadResponse[]>([]);
  isUploading = signal(false);

  onChange: (value: string[]) => void = () => {};
  onTouched: () => void = () => {};
  isDisabled = false;

  writeValue(obj: any): void {
    if (obj === null || obj === undefined) {
      this.images.set([]);
    }
    // Note: If you want to support pre-filling images (edit mode), 
    // you would need to accept an array of objects here, not just IDs.
    // For now, we assume reset() sends null/empty array.
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // 4. SetDisabledState: Angular calls this when you use .disable()
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.upload(file);
    input.value = '';
    this.onTouched(); // Mark as touched so validation triggers
  }

  private upload(file: File) {
    this.isUploading.set(true);

    this.fileService.upload(file).subscribe({
      next: (response: FileUploadResponse) => {
        this.images.update((current) => [...current, response]);
        this.notifyForm();
        this.isUploading.set(false);
      },
      error: (err: any) => {
        console.error('Upload failed', err);
        this.isUploading.set(false);
      }
    });
  }

  removeImage(id: string) {
    this.images.update((current) => current.filter((img) => img.id !== id));
    this.notifyForm();
  }

  private notifyForm() {
    console.log(this.images())
    const ids = this.images().map((img) => img.id);
    this.onChange(ids); 
  }
}