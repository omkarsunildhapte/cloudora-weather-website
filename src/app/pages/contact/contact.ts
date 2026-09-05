import { Component, OnInit, inject, signal } from '@angular/core';
import { FormField, disabled, email, form, minLength, required, submit } from '@angular/forms/signals';
import { NgOptimizedImage } from '@angular/common';
import { FeatureIcon } from '@shared/feature-icon/feature-icon';
import { SunriseLayer } from '@shared/sunrise-layer/sunrise-layer';
import { SeoService } from '@services/seo/seo.service';
import {
  COMPANY_NAME,
  COMPANY_URL,
  CONTACT_EMAIL,
  CONTACT_ENDPOINT,
  CONTACT_GENERIC_ERROR,
  CONTACT_NETWORK_ERROR,
  MIN_MESSAGE_LENGTH,
  SITE_URL,
} from '@constants/index';
import { ContactMessage } from '@appTypes/index';

@Component({
  selector: 'app-contact',
  imports: [NgOptimizedImage, FeatureIcon, SunriseLayer, FormField],
  templateUrl: './contact.html',
  styleUrls: ['../legal-chrome.css', './contact.css'],
})
export class Contact implements OnInit {
  private readonly seo = inject(SeoService);

  readonly email = CONTACT_EMAIL;

  private readonly model = signal<ContactMessage>({
    name: '',
    email: '',
    subject: '',
    message: '',
    company: '',
  });

  /**
   * Signal form: the rules live beside the model rather than in a hand-rolled
   * `submit()` that returned on the first failure. Every field is now validated
   * at once, each error is attached to the control it belongs to, and
   * `submit()` below refuses to call the Worker while any of them stand.
   */
  readonly contactForm = form(this.model, (path) => {
    // The whole form goes read-only while the request is in flight; the controls
    // no longer carry their own [disabled] binding, which signal forms forbids.
    disabled(path, { when: ({ state }) => state.submitting() });

    required(path.name, { message: 'Please enter your name.' });
    required(path.email, { message: 'Please enter your email address.' });
    email(path.email, { message: 'Please enter a valid email address.' });
    minLength(path.message, MIN_MESSAGE_LENGTH, {
      message: `Message must be at least ${MIN_MESSAGE_LENGTH} characters.`,
    });
  });

  /** Outcome of the request itself — field validity is the form's job, not this. */
  readonly sent = signal(false);
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

  async send(event: Event): Promise<void> {
    event.preventDefault();
    this.errorMessage.set('');

    await submit(this.contactForm, {
      action: async (contact) => {
        try {
          const res = await fetch(CONTACT_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contact().value()),
          });
          const data: { ok: boolean; error?: string } = await res.json();

          if (!res.ok || !data.ok) {
            this.errorMessage.set(data.error || CONTACT_GENERIC_ERROR);
            return undefined;
          }

          this.sent.set(true);
          this.model.set({ name: '', email: '', subject: '', message: '', company: '' });
        } catch {
          this.errorMessage.set(CONTACT_NETWORK_ERROR);
        }
        return undefined;
      },
    });
  }
}
