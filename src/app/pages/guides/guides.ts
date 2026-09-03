import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeatureIcon } from '@shared/feature-icon/feature-icon';
import { PlayStoreButton } from '@shared/play-store-button/play-store-button';
import { SunriseLayer } from '@shared/sunrise-layer/sunrise-layer';
import { SeoService } from '@services/seo/seo.service';
import { GUIDES, GUIDES_PATH, SITE_URL } from '@constants/index';

/**
 * `/guides` — the index for the weather-explainer content section.
 *
 * The catalogue itself lives in `@constants/guides` because four other routes
 * cross-link to it (see that file's note on frontend-rules Rule 14).
 */
@Component({
  selector: 'app-guides',
  imports: [RouterLink, FeatureIcon, PlayStoreButton, SunriseLayer],
  templateUrl: './guides.html',
  styleUrl: './guides.css',
})
export class Guides implements OnInit {
  private readonly seo = inject(SeoService);

  readonly guides = GUIDES;

  ngOnInit(): void {
    const description =
      'Plain-English guides to the numbers on a weather app: what the Air Quality Index measures, how to read the UV index, why "feels like" differs from the real temperature, and how to read a precipitation radar map.';

    this.seo.update({
      title: 'Weather Guides — Understanding AQI, UV, Feels-Like and Radar',
      description,
      path: GUIDES_PATH,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Weather Guides — Cloudora Weather',
        description,
        url: `${SITE_URL}${GUIDES_PATH}`,
        isPartOf: { '@type': 'MobileApplication', name: 'Cloudora Weather' },
        mainEntity: {
          '@type': 'ItemList',
          itemListOrder: 'https://schema.org/ItemListUnordered',
          numberOfItems: GUIDES.length,
          itemListElement: GUIDES.map((guide, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: guide.title,
            description: guide.summary,
            url: `${SITE_URL}${guide.path}`,
          })),
        },
      },
    });
  }
}
