import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuideHero } from '@shared/guide-hero/guide-hero';
import { GuideOutro } from '@shared/guide-outro/guide-outro';
import { SunriseLayer } from '@shared/sunrise-layer/sunrise-layer';
import { SeoService } from '@services/seo/seo.service';
import { COMPANY_NAME, COMPANY_URL, SITE_URL, otherGuides } from '@constants/index';

/** One band of the WHO/WMO Global Solar UV Index. */
interface UvBand {
  range: string;
  name: string;
  advice: string;
}

const PATH = '/guides/uv-index';
const UPDATED_ISO = '2026-09-04';

@Component({
  selector: 'app-guide-uv-index',
  imports: [RouterLink, GuideHero, GuideOutro, SunriseLayer],
  templateUrl: './uv-index.html',
  styleUrl: './uv-index.css',
})
export class UvIndexGuide implements OnInit {
  private readonly seo = inject(SeoService);

  readonly updated = 'September 4, 2026';
  readonly related = otherGuides(PATH);

  /** Source: the WHO/WMO/UNEP/ICNIRP Global Solar UV Index, the international
   *  standard the app's UV labels follow. */
  readonly bands: UvBand[] = [
    {
      range: '0–2',
      name: 'Low',
      advice: 'No protection needed for most people. You can safely stay outside.',
    },
    {
      range: '3–5',
      name: 'Moderate',
      advice:
        'Protection starts here: shade around midday, a shirt, sunscreen and a hat if you are out for a while.',
    },
    {
      range: '6–7',
      name: 'High',
      advice:
        'Protection required. Seek shade during the middle of the day, cover up, and reapply sunscreen.',
    },
    {
      range: '8–10',
      name: 'Very High',
      advice:
        'Extra protection. Unprotected skin burns quickly; avoid being out between late morning and mid-afternoon.',
    },
    {
      range: '11+',
      name: 'Extreme',
      advice:
        'Take every precaution. Unprotected skin can burn in minutes. Stay inside during the peak hours if you can.',
    },
  ];

  ngOnInit(): void {
    const title = 'How to Read the UV Index — and When You Need Sunscreen';
    const description =
      'What the UV index measures, what each band from Low to Extreme means, why UV has nothing to do with temperature, and how much sunscreen actually works.';

    this.seo.update({
      title,
      description,
      path: PATH,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'How to Read the UV Index (and When You Actually Need Sunscreen)',
        description,
        url: `${SITE_URL}${PATH}`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${PATH}` },
        datePublished: UPDATED_ISO,
        dateModified: UPDATED_ISO,
        inLanguage: 'en',
        about: ['UV index', 'Sun protection', 'Ultraviolet radiation'],
        author: { '@type': 'Organization', name: COMPANY_NAME, url: COMPANY_URL },
        publisher: { '@type': 'Organization', name: COMPANY_NAME, url: COMPANY_URL },
        isPartOf: { '@type': 'CollectionPage', name: 'Weather Guides', url: `${SITE_URL}/guides` },
      },
    });
  }
}
