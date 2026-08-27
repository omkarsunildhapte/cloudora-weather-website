import { PLATFORM_ID, Service, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ConsentDecision } from '@appTypes/index';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    /** Injects gtag.js and fires the first page view. Defined by the inline
     *  stub in index.html; idempotent, so calling it twice is harmless. */
    loadAnalytics?: () => void;
  }
}

/**
 * Analytics consent for the marketing site (the Cloudora Weather *app* ships no
 * analytics at all — see the privacy policy's "No Ads" summary).
 *
 * The authoritative "denied" state is set by the Consent Mode v2 block in
 * index.html, which runs before gtag.js loads; this service only ever
 * *updates* that state in response to a visitor's click, and persists the
 * answer so the banner is asked once rather than on every page.
 *
 * Storage key is shared with that inline block — it restores a stored
 * "granted" synchronously at page load, well before Angular bootstraps, so
 * a returning visitor's page view isn't lost to hydration latency. Keep the
 * two in sync.
 */
@Service()
export class ConsentService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly KEY = 'cloudora_site_consent_v1';

  /** null = never asked, so the banner should be shown. */
  readonly decision = signal<ConsentDecision | null>(null);

  constructor() {
    this.decision.set(this.read());
  }

  accept(): void {
    this.record('granted');
  }

  decline(): void {
    this.record('denied');
  }

  private record(decision: ConsentDecision): void {
    this.decision.set(decision);
    if (!this.isBrowser) return;

    try {
      // Explicitly window.localStorage rather than the bare global: it keeps
      // the browser-only dependency visible next to the isBrowser guard, and
      // lets the spec substitute a storage stub (Node 25 ships its own Web
      // Storage global that shadows jsdom's and throws without
      // --localstorage-file).
      window.localStorage.setItem(this.KEY, decision);
    } catch {
      /* private mode / quota — the decision still holds for this page view */
    }
    // Denied is already the default, but sending it explicitly ends
    // `wait_for_update`'s hold immediately instead of stalling tags for the
    // full 500ms after an explicit refusal.
    window.gtag?.('consent', 'update', { analytics_storage: decision });

    // Only now is the 161KB library worth fetching. A visitor who declines
    // never downloads it at all; one who accepts gets it after the click,
    // off the critical path for first paint.
    if (decision === 'granted') window.loadAnalytics?.();
  }

  private read(): ConsentDecision | null {
    if (!this.isBrowser) return null;
    try {
      const stored = window.localStorage.getItem(this.KEY);
      return stored === 'granted' || stored === 'denied' ? stored : null;
    } catch {
      return null;
    }
  }
}
