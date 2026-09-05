import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuideHero } from '@shared/guide-hero/guide-hero';
import { GuideOutro } from '@shared/guide-outro/guide-outro';
import { SunriseLayer } from '@shared/sunrise-layer/sunrise-layer';
import { SeoService } from '@services/seo/seo.service';
import { COMPANY_NAME, COMPANY_URL, DEW_POINT_BANDS, FEELS_LIKE_GUIDE_HERO, FEELS_LIKE_GUIDE_PATH, GUIDES_UPDATED, SITE_URL, otherGuides } from '@constants/index';

@Component({
  selector: 'app-guide-feels-like-temperature',
  imports: [RouterLink, GuideHero, GuideOutro, SunriseLayer],
  templateUrl: './feels-like-temperature.html',
  styleUrls: ['../guide-body.css', './feels-like-temperature.css'],
})
export class FeelsLikeTemperatureGuide implements OnInit {
  private readonly seo = inject(SeoService);

  readonly hero = FEELS_LIKE_GUIDE_HERO;
  readonly related = otherGuides(FEELS_LIKE_GUIDE_PATH);

  readonly dewPoints = DEW_POINT_BANDS;

  ngOnInit(): void {
    const title = 'Why "Feels Like" Differs From the Real Temperature';
    const description =
      'Humidity slows the sweat that cools you and wind strips away the warm layer against your skin. How heat index and wind chill are built, and when each one applies.';

    this.seo.update({
      title,
      description,
      path: FEELS_LIKE_GUIDE_PATH,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Why "Feels Like" Differs From the Real Temperature',
        description,
        url: `${SITE_URL}${FEELS_LIKE_GUIDE_PATH}`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${FEELS_LIKE_GUIDE_PATH}` },
        datePublished: GUIDES_UPDATED.iso,
        dateModified: GUIDES_UPDATED.iso,
        inLanguage: 'en',
        about: ['Apparent temperature', 'Heat index', 'Wind chill', 'Humidity'],
        author: { '@type': 'Organization', name: COMPANY_NAME, url: COMPANY_URL },
        publisher: { '@type': 'Organization', name: COMPANY_NAME, url: COMPANY_URL },
        isPartOf: { '@type': 'CollectionPage', name: 'Weather Guides', url: `${SITE_URL}/guides` },
      },
    });
  }
}
