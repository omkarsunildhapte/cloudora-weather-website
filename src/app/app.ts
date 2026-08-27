import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from '@shared/nav-bar/nav-bar';
import { Footer } from '@shared/footer/footer';
import { StickyDownloadCta } from '@shared/sticky-download-cta/sticky-download-cta';
import { CookieConsent } from '@shared/cookie-consent/cookie-consent';
import { AnalyticsService } from '@services/analytics/analytics.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar, Footer, StickyDownloadCta, CookieConsent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor() {
    // Page-view tracking for every route — see AnalyticsService.
    inject(AnalyticsService).start();
  }
}
