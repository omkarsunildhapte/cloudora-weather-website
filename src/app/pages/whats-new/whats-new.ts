import { Component, OnInit, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FeatureIcon } from '@shared/feature-icon/feature-icon';
import { PlayStoreButton } from '@shared/play-store-button/play-store-button';
import { SunriseLayer } from '@shared/sunrise-layer/sunrise-layer';
import { SeoService } from '@services/seo/seo.service';
import { COMPANY_NAME, COMPANY_URL, PLAY_STORE_URL, RELEASES, SITE_URL, WHATS_NEW_PATH } from '@constants/index';
import { Release } from '@appTypes/index';

/**
 * Release history for the Android app.
 *
 * Adding a release is one entry at the top of `RELEASES` — nothing else on the
 * page is hardcoded to a particular version. The Worker's `GET /api/version`
 * serves the same "latest" value to the app itself for its startup update
 * check; this page deliberately does *not* call it. The endpoint returns a
 * bare version string, and a number with no release notes attached would add
 * nothing a visitor can use — while making a static, prerenderable page depend
 * on a runtime request that can fail.
 */
@Component({
  selector: 'app-whats-new',
  imports: [NgOptimizedImage, RouterLink, FeatureIcon, PlayStoreButton, SunriseLayer],
  templateUrl: './whats-new.html',
  styleUrl: './whats-new.css',
})
export class WhatsNew implements OnInit {
  private readonly seo = inject(SeoService);

  readonly releases = RELEASES;

  get latest(): Release {
    return this.releases[0];
  }

  ngOnInit(): void {
    const description =
      'Release notes for the Cloudora Weather Android app — what shipped in each version, newest first, starting with the 0.0.1 launch on Google Play.';

    this.seo.update({
      title: "What's New — Cloudora Weather Release Notes",
      description,
      path: WHATS_NEW_PATH,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: "What's New — Cloudora Weather Release Notes",
        description,
        url: `${SITE_URL}${WHATS_NEW_PATH}`,
        dateModified: this.latest.isoDate,
        isPartOf: { '@type': 'MobileApplication', name: 'Cloudora Weather' },
        publisher: { '@type': 'Organization', name: COMPANY_NAME, url: COMPANY_URL },
        mainEntity: {
          '@type': 'MobileApplication',
          name: 'Cloudora Weather',
          operatingSystem: 'ANDROID',
          applicationCategory: 'WeatherApplication',
          softwareVersion: this.latest.version,
          datePublished: this.latest.isoDate,
          releaseNotes: `${SITE_URL}${WHATS_NEW_PATH}`,
          installUrl: PLAY_STORE_URL,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
      },
    });
  }
}
