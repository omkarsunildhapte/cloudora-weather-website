import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { PlayStoreButton } from '@shared/play-store-button/play-store-button';

@Component({
  selector: 'app-nav-bar',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive, PlayStoreButton],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar {
  readonly mobileMenuOpen = signal(false);
  /** Nav starts transparent over the hero and only picks up the frosted-glass
   *  background once the page has scrolled — avoids a hard navy seam against
   *  the page's near-black background at rest. */
  readonly scrolled = signal(false);

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.scrolled.set(window.scrollY > 12);
  }

  toggleMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
