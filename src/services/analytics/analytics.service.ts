import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injector, PLATFORM_ID, Service, effect, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ConsentService } from '@services/consent/consent.service';
import { GA_MEASUREMENT_ID } from '@constants/index';

/**
 * Page-view tracking for every route, on top of the consent-gated gtag stub
 * in index.html.
 *
 * gtag('config') is called there with `send_page_view: false`, so the library
 * never fires its own automatic hit — this service is the single place a
 * page_view is sent, which keeps counts exact across the three ways a page
 * can come into view:
 *
 *   1. Initial load with a stored grant — index.html loads gtag.js
 *      synchronously; the first NavigationEnd below sends the view.
 *   2. Client-side navigation (SPA route change) — each NavigationEnd sends
 *      a view for the new URL with the title SeoService has just set.
 *   3. Consent granted mid-session — the banner's Accept loads gtag.js (see
 *      ConsentService); the effect below then sends a view for the page the
 *      visitor is already on, which no NavigationEnd would otherwise cover.
 *
 * Nothing is sent while consent is null/denied, and nothing runs at all
 * during prerendering (no window, no router events worth measuring).
 */
@Service()
export class AnalyticsService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly router = inject(Router);
  private readonly consent = inject(ConsentService);
  private readonly document = inject(DOCUMENT);
  /** effect() outside a constructor needs an explicit injector — start() is
   *  called later from the App component, not during construction. */
  private readonly injector = inject(Injector);

  private started = false;

  /** Idempotent — call once from the root component. */
  start(): void {
    if (this.started || !this.isBrowser) return;
    this.started = true;

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.trackPageView(e.urlAfterRedirects));

    // Case 3: consent flips to granted while the visitor sits on a page.
    let previous = this.consent.decision();
    effect(() => {
      const current = this.consent.decision();
      if (current === 'granted' && previous !== 'granted') {
        this.trackPageView(this.router.url);
      }
      previous = current;
    }, { injector: this.injector });
  }

  private trackPageView(path: string): void {
    if (this.consent.decision() !== 'granted') return;
    window.gtag?.('event', 'page_view', {
      send_to: GA_MEASUREMENT_ID,
      page_path: path,
      page_title: this.document.title,
      page_location: this.document.location?.href,
    });
  }
}
