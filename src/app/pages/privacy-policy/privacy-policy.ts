import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalSection } from '@shared/legal-section/legal-section';
import { PlayStoreButton } from '@shared/play-store-button/play-store-button';
import { FeatureIcon } from '@shared/feature-icon/feature-icon';
import { SeoService } from '@services/seo/seo.service';
import { CONTACT_EMAIL, COMPANY_NAME, COMPANY_URL, SITE_URL } from '@constants/index';

/**
 * Content adapted from the real app's privacy policy at
 * d:\cloudora\cloudora-weather-app\src\app\pages\privacy-policy\privacy-policy.html
 * — same sections/dates/contact, restyled for the marketing site. The app's
 * "Delete All My Data" / "Manage Consent" buttons are intentionally dropped
 * here: they operate on the app's own local storage, which this static
 * site has none of. This page also serves as the publicly hosted Privacy
 * Policy URL required for the Google Play Store listing.
 */
@Component({
  selector: 'app-privacy-policy',
  imports: [RouterLink, LegalSection, PlayStoreButton, FeatureIcon],
  templateUrl: './privacy-policy.html',
  styleUrls: ['../legal-chrome.css', '../legal-prose.css', './privacy-policy.css'],
})
export class PrivacyPolicy implements OnInit {
  private readonly seo = inject(SeoService);

  readonly lastUpdated = 'August 27, 2026';
  readonly email = CONTACT_EMAIL;
  readonly company = COMPANY_NAME;
  readonly companyUrl = COMPANY_URL;

  ngOnInit(): void {
    const description =
      'How Cloudora Weather collects, stores, and protects your data. Location used only to fetch the weather, preferences kept on your device, no ads, no data selling.';
    this.seo.update({
      title: 'Privacy Policy — Cloudora Weather',
      description,
      path: '/privacy-policy',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Privacy Policy — Cloudora Weather',
        description,
        url: `${SITE_URL}/privacy-policy`,
        dateModified: '2026-08-27',
        isPartOf: { '@type': 'MobileApplication', name: 'Cloudora Weather' },
        publisher: { '@type': 'Organization', name: COMPANY_NAME, url: COMPANY_URL },
      },
    });
  }
}
