import { Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConsentService } from '@services/consent/consent.service';

/**
 * Analytics consent banner, mounted once in app.html.
 *
 * Visibility is decided in afterNextRender rather than the constructor on
 * purpose: this site is prerendered (outputMode: 'static') with client
 * hydration, and the prerendered HTML can't know a given visitor's stored
 * choice. Deciding during construction would make the client's first render
 * disagree with the server's markup and trip a hydration mismatch, so the
 * banner stays out of the static HTML and appears once hydration is done.
 */
@Component({
  selector: 'app-cookie-consent',
  imports: [RouterLink],
  templateUrl: './cookie-consent.html',
  styleUrl: './cookie-consent.css',
})
export class CookieConsent {
  private readonly consent = inject(ConsentService);

  readonly visible = signal(false);

  constructor() {
    afterNextRender(() => {
      this.visible.set(this.consent.decision() === null);
    });
  }

  accept(): void {
    this.consent.accept();
    this.visible.set(false);
  }

  decline(): void {
    this.consent.decline();
    this.visible.set(false);
  }
}
