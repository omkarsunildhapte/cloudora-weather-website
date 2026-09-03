import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuideHero } from '@shared/guide-hero/guide-hero';
import { GuideOutro } from '@shared/guide-outro/guide-outro';
import { SunriseLayer } from '@shared/sunrise-layer/sunrise-layer';
import { SeoService } from '@services/seo/seo.service';
import { COMPANY_NAME, COMPANY_URL, SITE_URL, otherGuides } from '@constants/index';

/** Approximate reflectivity-to-rainfall mapping. Deliberately loose: the
 *  conversion depends on drop-size distribution, so these are the standard
 *  rules of thumb rather than exact figures. */
interface ReflectivityBand {
  dbz: string;
  colour: string;
  meaning: string;
}

const PATH = '/guides/precipitation-radar';
const UPDATED_ISO = '2026-09-04';

@Component({
  selector: 'app-guide-precipitation-radar',
  imports: [RouterLink, GuideHero, GuideOutro, SunriseLayer],
  templateUrl: './precipitation-radar.html',
  styleUrl: './precipitation-radar.css',
})
export class PrecipitationRadarGuide implements OnInit {
  private readonly seo = inject(SeoService);

  readonly updated = 'September 4, 2026';
  readonly related = otherGuides(PATH);

  readonly bands: ReflectivityBand[] = [
    {
      dbz: 'Under 20 dBZ',
      colour: 'Pale blue / light green',
      meaning: 'Drizzle, or rain that may be evaporating before it lands. Often not worth a coat.',
    },
    {
      dbz: '20–30 dBZ',
      colour: 'Green',
      meaning: 'Light rain — the kind you can walk in for a few minutes without much thought.',
    },
    {
      dbz: '30–40 dBZ',
      colour: 'Yellow',
      meaning: 'Moderate rain. You will be wet in a minute or two without a coat.',
    },
    {
      dbz: '40–50 dBZ',
      colour: 'Orange to red',
      meaning: 'Heavy rain, typically from a convective shower or thunderstorm. Drains struggle.',
    },
    {
      dbz: 'Above 50 dBZ',
      colour: 'Deep red to magenta',
      meaning: 'Torrential rain, and often hail — hail scatters radar energy far more than rain.',
    },
  ];

  ngOnInit(): void {
    const title = 'How to Read a Precipitation Radar Map — Cloudora Weather';
    const description =
      'What radar colours actually measure, why radar sometimes shows rain that never lands, and how to use a few frames of the loop to work out when a shower will reach you.';

    this.seo.update({
      title,
      description,
      path: PATH,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'How to Read a Precipitation Radar Map',
        description,
        url: `${SITE_URL}${PATH}`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${PATH}` },
        datePublished: UPDATED_ISO,
        dateModified: UPDATED_ISO,
        inLanguage: 'en',
        about: ['Weather radar', 'Precipitation', 'Nowcasting'],
        author: { '@type': 'Organization', name: COMPANY_NAME, url: COMPANY_URL },
        publisher: { '@type': 'Organization', name: COMPANY_NAME, url: COMPANY_URL },
        isPartOf: { '@type': 'CollectionPage', name: 'Weather Guides', url: `${SITE_URL}/guides` },
      },
    });
  }
}
