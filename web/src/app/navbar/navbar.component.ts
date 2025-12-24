import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  RouterLinkActive,
  RouterLinkWithHref,
} from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterLinkWithHref],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }
}
