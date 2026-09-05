import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuideHero } from '@shared/guide-hero/guide-hero';
import { GuideOutro } from '@shared/guide-outro/guide-outro';
import { SunriseLayer } from '@shared/sunrise-layer/sunrise-layer';
import { SeoService } from '@services/seo/seo.service';
import { AIR_QUALITY_GUIDE_HERO, AIR_QUALITY_GUIDE_PATH, AQI_ADVICE, AQI_BANDS, COMPANY_NAME, COMPANY_URL, GUIDES_UPDATED, SITE_URL, otherGuides } from '@constants/index';

@Component({
  selector: 'app-guide-air-quality-index',
  imports: [RouterLink, GuideHero, GuideOutro, SunriseLayer],
  templateUrl: './air-quality-index.html',
  styleUrls: ['../guide-body.css', './air-quality-index.css'],
})
export class AirQualityIndexGuide implements OnInit {
  private readonly seo = inject(SeoService);

  readonly hero = AIR_QUALITY_GUIDE_HERO;
  readonly related = otherGuides(AIR_QUALITY_GUIDE_PATH);

  readonly bands = AQI_BANDS;

  readonly advice = AQI_ADVICE;

  ngOnInit(): void {
    const title = 'What the Air Quality Index Actually Means — Cloudora Weather';
    const description =
      'PM2.5, PM10, ozone and nitrogen dioxide explained, with the concentration bands behind the 1–5 air quality rating and what to do at each level.';

    this.seo.update({
      title,
      description,
      path: AIR_QUALITY_GUIDE_PATH,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'What the Air Quality Index Actually Means',
        description,
        url: `${SITE_URL}${AIR_QUALITY_GUIDE_PATH}`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${AIR_QUALITY_GUIDE_PATH}` },
        datePublished: GUIDES_UPDATED.iso,
        dateModified: GUIDES_UPDATED.iso,
        inLanguage: 'en',
        about: ['Air quality', 'PM2.5', 'Air Quality Index'],
        author: { '@type': 'Organization', name: COMPANY_NAME, url: COMPANY_URL },
        publisher: { '@type': 'Organization', name: COMPANY_NAME, url: COMPANY_URL },
        isPartOf: { '@type': 'CollectionPage', name: 'Weather Guides', url: `${SITE_URL}/guides` },
      },
    });
  }
}
