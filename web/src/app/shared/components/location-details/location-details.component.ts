import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location, LOCATION_CATEGORIES } from '../../models/location.model';

@Component({
  selector: 'app-location-details',
  imports: [CommonModule],
  templateUrl: './location-details.component.html',
  styleUrl: './location-details.component.css',
})
export class LocationDetailsComponent {
  @Input() location: Location | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  get categoryInfo() {
    if (!this.location) return null;
    const category = this.location.category.toLowerCase();
    return (
      LOCATION_CATEGORIES[category as keyof typeof LOCATION_CATEGORIES] ||
      LOCATION_CATEGORIES.other
    );
  }

  onClose() {
    this.close.emit();
  }
}
