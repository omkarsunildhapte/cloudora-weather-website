import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuideHero } from '@shared/guide-hero/guide-hero';
import { GuideOutro } from '@shared/guide-outro/guide-outro';
import { SunriseLayer } from '@shared/sunrise-layer/sunrise-layer';
import { SeoService } from '@services/seo/seo.service';
import { COMPANY_NAME, COMPANY_URL, SITE_URL, otherGuides } from '@constants/index';

/** A dew-point band and how the air at that band reads to most people. */
interface DewPointBand {
  range: string;
  name: string;
  note: string;
}

const PATH = '/guides/feels-like-temperature';
const UPDATED_ISO = '2026-09-04';

@Component({
  selector: 'app-guide-feels-like-temperature',
  imports: [RouterLink, GuideHero, GuideOutro, SunriseLayer],
  templateUrl: './feels-like-temperature.html',
  styleUrl: './feels-like-temperature.css',
})
export class FeelsLikeTemperatureGuide implements OnInit {
  private readonly seo = inject(SeoService);

  readonly updated = 'September 4, 2026';
  readonly related = otherGuides(PATH);

  /** Dew point is the humidity measure that actually tracks comfort; these
   *  bands are the widely used forecaster rules of thumb, not a formal
   *  standard. */
  readonly dewPoints: DewPointBand[] = [
    { range: 'Below 10 °C', name: 'Dry', note: 'Air feels crisp. Sweat evaporates almost instantly.' },
    {
      range: '10–15 °C',
      name: 'Comfortable',
      note: 'The range most people describe as pleasant, whatever the thermometer says.',
    },
    {
      range: '16–20 °C',
      name: 'Noticeably humid',
      note: 'Sticky on exertion. Shirts stop drying between efforts.',
    },
    {
      range: '21–24 °C',
      name: 'Oppressive',
      note: 'Uncomfortable even at rest; hard exercise starts to carry real risk.',
    },
    {
      range: '25 °C and above',
      name: 'Dangerous',
      note: 'Evaporative cooling is barely working. Heat illness becomes a serious concern.',
    },
  ];

  ngOnInit(): void {
    const title = 'Why "Feels Like" Differs From the Real Temperature';
    const description =
      'Humidity slows the sweat that cools you and wind strips away the warm layer against your skin. How heat index and wind chill are built, and when each one applies.';

    this.seo.update({
      title,
      description,
      path: PATH,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Why "Feels Like" Differs From the Real Temperature',
        description,
        url: `${SITE_URL}${PATH}`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${PATH}` },
        datePublished: UPDATED_ISO,
        dateModified: UPDATED_ISO,
        inLanguage: 'en',
        about: ['Apparent temperature', 'Heat index', 'Wind chill', 'Humidity'],
        author: { '@type': 'Organization', name: COMPANY_NAME, url: COMPANY_URL },
        publisher: { '@type': 'Organization', name: COMPANY_NAME, url: COMPANY_URL },
        isPartOf: { '@type': 'CollectionPage', name: 'Weather Guides', url: `${SITE_URL}/guides` },
      },
    });
  }
}
