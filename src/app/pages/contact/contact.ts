import { Component, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { FeatureIcon } from '@shared/feature-icon/feature-icon';
import { SunriseLayer } from '@shared/sunrise-layer/sunrise-layer';
import { SeoService } from '@services/seo/seo.service';
import { COMPANY_NAME, COMPANY_URL, CONTACT_EMAIL, SITE_URL } from '@constants/index';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'app-contact',
  imports: [FeatureIcon, SunriseLayer],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit {
  private readonly seo = inject(SeoService);

  readonly email = CONTACT_EMAIL;

  readonly name = signal('');
  readonly emailField = signal('');
  readonly subject = signal('');
  readonly message = signal('');
  /** Honeypot — real visitors never see or fill this field. */
  readonly company = signal('');

  readonly status = signal<SubmitStatus>('idle');
  readonly errorMessage = signal('');

  ngOnInit(): void {
    const description =
      'Get in touch with the Cloudora Weather team — questions, feedback, or support requests.';
    this.seo.update({
      title: 'Contact — Cloudora Weather',
      description,
      path: '/contact',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact — Cloudora Weather',
        description,
        url: `${SITE_URL}/contact`,
        about: { '@type': 'MobileApplication', name: 'Cloudora Weather' },
        mainEntity: {
          '@type': 'Organization',
          name: COMPANY_NAME,
          url: COMPANY_URL,
          email: CONTACT_EMAIL,
        },
      },
    });
  }

  /** Typed cast lives here, not as `$any()` inline in the template. */
  setFromEvent(target: WritableSignal<string>, event: Event): void {
    target.set((event.target as HTMLInputElement | HTMLTextAreaElement).value);
  }

  async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.status() === 'submitting') return;

    const name = this.name().trim();
    const email = this.emailField().trim();
    const message = this.message().trim();

    if (!name) {
      this.status.set('error');
      this.errorMessage.set('Please enter your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.status.set('error');
      this.errorMessage.set('Please enter a valid email address.');
      return;
    }
    if (message.length < 10) {
      this.status.set('error');
      this.errorMessage.set('Message must be at least 10 characters.');
      return;
    }

    this.status.set('submitting');
    this.errorMessage.set('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject: this.subject().trim(),
          message,
          company: this.company(),
        }),
      });
      const data: { ok: boolean; error?: string } = await res.json();

      if (!res.ok || !data.ok) {
        this.status.set('error');
        this.errorMessage.set(data.error || 'Something went wrong — please try again.');
        return;
      }

      this.status.set('success');
      this.name.set('');
      this.emailField.set('');
      this.subject.set('');
      this.message.set('');
    } catch {
      this.status.set('error');
      this.errorMessage.set('Network error — please check your connection and try again.');
    }
  }
}
