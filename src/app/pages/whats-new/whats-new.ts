import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeatureIcon } from '@shared/feature-icon/feature-icon';
import { PlayStoreButton } from '@shared/play-store-button/play-store-button';
import { SunriseLayer } from '@shared/sunrise-layer/sunrise-layer';
import { SeoService } from '@services/seo/seo.service';
import { COMPANY_NAME, COMPANY_URL, PLAY_STORE_URL, SITE_URL } from '@constants/index';

/** How a single line in a release is categorised. Keep the set small — a
 *  changelog with fifteen kinds of change is a changelog nobody reads. */
type ChangeKind = 'new' | 'improved' | 'fixed';

interface ReleaseChange {
  kind: ChangeKind;
  title: string;
  detail: string;
}

interface Release {
  version: string;
  /** Display date, e.g. "September 2026". */
  date: string;
  /** Machine-readable date for `<time datetime>` and JSON-LD. */
  isoDate: string;
  headline: string;
  summary: string;
  changes: ReleaseChange[];
}

const PATH = '/whats-new';

/**
 * Release history for the Android app.
 *
 * Adding a release is one entry at the top of `releases` — nothing else on the
 * page is hardcoded to a particular version. The Worker's `GET /api/version`
 * serves the same "latest" value to the app itself for its startup update
 * check; this page deliberately does *not* call it. The endpoint returns a
 * bare version string, and a number with no release notes attached would add
 * nothing a visitor can use — while making a static, prerenderable page depend
 * on a runtime request that can fail.
 */
@Component({
  selector: 'app-whats-new',
  imports: [RouterLink, FeatureIcon, PlayStoreButton, SunriseLayer],
  templateUrl: './whats-new.html',
  styleUrl: './whats-new.css',
})
export class WhatsNew implements OnInit {
  private readonly seo = inject(SeoService);

  /** Newest first. */
  readonly releases: Release[] = [
    {
      version: '0.0.1',
      date: 'September 2026',
      isoDate: '2026-09-01',
      headline: 'The first release',
      summary:
        'Cloudora Weather arrives on Google Play: current conditions, forecasts, air quality, UV, radar and an AI read on your day, in one ad-free app with no account to create.',
      changes: [
        {
          kind: 'new',
          title: 'Real-time conditions',
          detail:
            'Current temperature, feels-like, today\'s high and low, and a condition-aware background that changes with the sky. Sunrise and sunset times included.',
        },
        {
          kind: 'new',
          title: 'Hourly and 5-day forecast',
          detail:
            'The next 24 hours in three-hour steps with a rain chance per slot, plus daily highs, lows and precipitation probability for the coming five days.',
        },
        {
          kind: 'new',
          title: 'Air quality index',
          detail:
            'A live AQI rating from Good to Very Poor shown beside the current temperature, based on OpenWeatherMap air-pollution data.',
        },
        {
          kind: 'new',
          title: 'UV index and conditions detail',
          detail:
            'UV labelled from Low to Extreme, alongside humidity, wind speed and compass direction, pressure and visibility.',
        },
        {
          kind: 'new',
          title: 'Precipitation radar',
          detail:
            'A live radar map with a timeline scrubber, so you can see which way a shower is moving before deciding whether to wait it out.',
        },
        {
          kind: 'new',
          title: 'AI weather insight',
          detail:
            'A short, plain-language read on your day generated from the live forecast numbers. Optional, and switchable off in the privacy preferences.',
        },
        {
          kind: 'new',
          title: 'City compare',
          detail:
            'Put two locations side by side — useful when you are travelling, or deciding which end of a weekend trip to pack for.',
        },
        {
          kind: 'new',
          title: 'Home-screen widget',
          detail:
            'Current conditions on your Android home screen, without opening the app.',
        },
      ],
    },
  ];

  get latest(): Release {
    return this.releases[0];
  }

  ngOnInit(): void {
    const description =
      'Release notes for the Cloudora Weather Android app — what shipped in each version, newest first, starting with the 0.0.1 launch on Google Play.';

    this.seo.update({
      title: "What's New — Cloudora Weather Release Notes",
      description,
      path: PATH,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: "What's New — Cloudora Weather Release Notes",
        description,
        url: `${SITE_URL}${PATH}`,
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
          releaseNotes: `${SITE_URL}${PATH}`,
          installUrl: PLAY_STORE_URL,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
      },
    });
  }
}
