import { Component } from '@angular/core';
import { PlayStoreButton } from '@shared/play-store-button/play-store-button';

/**
 * Fixed-bottom download bar, mobile only (md:hidden). Mounted once in
 * app.html so it persists across every route without desktop redundancy —
 * on desktop the nav bar's compact CTA is already always visible.
 */
@Component({
  selector: 'app-sticky-download-cta',
  imports: [PlayStoreButton],
  templateUrl: './sticky-download-cta.html',
  styleUrl: './sticky-download-cta.css',
})
export class StickyDownloadCta {}
