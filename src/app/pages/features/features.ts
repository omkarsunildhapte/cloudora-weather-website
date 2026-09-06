import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlayStoreButton } from '@shared/play-store-button/play-store-button';
import { FeatureIcon } from '@shared/feature-icon/feature-icon';
import { SunriseLayer } from '@shared/sunrise-layer/sunrise-layer';
import { SeoService } from '@services/seo/seo.service';
import { FEATURE_DETAILS, SITE_URL } from '@constants/index';

@Component({
  selector: 'app-features',
  imports: [RouterLink, PlayStoreButton, FeatureIcon, SunriseLayer],
  templateUrl: './features.html',
  styleUrls: ['../cta-panel.css', '../../shared/icon-well.css', './features.css'],
})
export class Features implements OnInit {
  private readonly seo = inject(SeoService);

  readonly features = FEATURE_DETAILS;

  ngOnInit(): void {
    const description =
      'See everything Cloudora Weather can do: real-time conditions, AI weather insight, hourly and 5-day forecasts, air quality index, UV and wind details, rain heads-up, and privacy-first design.';
    this.seo.update({
      title: 'Features — Cloudora Weather',
      description,
      path: '/features',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Features — Cloudora Weather',
        description,
        url: `${SITE_URL}/features`,
        isPartOf: { '@type': 'MobileApplication', name: 'Cloudora Weather' },
      },
    });
  }
}
