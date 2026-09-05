import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuideHero } from '@shared/guide-hero/guide-hero';
import { GuideOutro } from '@shared/guide-outro/guide-outro';
import { SunriseLayer } from '@shared/sunrise-layer/sunrise-layer';
import { SeoService } from '@services/seo/seo.service';
import { COMPANY_NAME, COMPANY_URL, GUIDES_UPDATED, RADAR_GUIDE_HERO, RADAR_GUIDE_PATH, REFLECTIVITY_BANDS, SITE_URL, otherGuides } from '@constants/index';

@Component({
  selector: 'app-guide-precipitation-radar',
  imports: [RouterLink, GuideHero, GuideOutro, SunriseLayer],
  templateUrl: './precipitation-radar.html',
  styleUrls: ['../guide-body.css', './precipitation-radar.css'],
})
export class PrecipitationRadarGuide implements OnInit {
  private readonly seo = inject(SeoService);

  readonly hero = RADAR_GUIDE_HERO;
  readonly related = otherGuides(RADAR_GUIDE_PATH);

  readonly bands = REFLECTIVITY_BANDS;

  ngOnInit(): void {
    const title = 'How to Read a Precipitation Radar Map — Cloudora Weather';
    const description =
      'What radar colours actually measure, why radar sometimes shows rain that never lands, and how to use a few frames of the loop to work out when a shower will reach you.';

    this.seo.update({
      title,
      description,
      path: RADAR_GUIDE_PATH,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'How to Read a Precipitation Radar Map',
        description,
        url: `${SITE_URL}${RADAR_GUIDE_PATH}`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${RADAR_GUIDE_PATH}` },
        datePublished: GUIDES_UPDATED.iso,
        dateModified: GUIDES_UPDATED.iso,
        inLanguage: 'en',
        about: ['Weather radar', 'Precipitation', 'Nowcasting'],
        author: { '@type': 'Organization', name: COMPANY_NAME, url: COMPANY_URL },
        publisher: { '@type': 'Organization', name: COMPANY_NAME, url: COMPANY_URL },
        isPartOf: { '@type': 'CollectionPage', name: 'Weather Guides', url: `${SITE_URL}/guides` },
      },
    });
  }
}
