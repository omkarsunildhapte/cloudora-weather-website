import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuideHero } from '@shared/guide-hero/guide-hero';
import { GuideOutro } from '@shared/guide-outro/guide-outro';
import { SunriseLayer } from '@shared/sunrise-layer/sunrise-layer';
import { SeoService } from '@services/seo/seo.service';
import { COMPANY_NAME, COMPANY_URL, GUIDES_UPDATED, SITE_URL, UV_BANDS, UV_GUIDE_HERO, UV_GUIDE_PATH, otherGuides } from '@constants/index';

@Component({
  selector: 'app-guide-uv-index',
  imports: [RouterLink, GuideHero, GuideOutro, SunriseLayer],
  templateUrl: './uv-index.html',
  styleUrls: ['../guide-body.css', './uv-index.css'],
})
export class UvIndexGuide implements OnInit {
  private readonly seo = inject(SeoService);

  readonly hero = UV_GUIDE_HERO;
  readonly related = otherGuides(UV_GUIDE_PATH);

  readonly bands = UV_BANDS;

  ngOnInit(): void {
    const title = 'How to Read the UV Index — and When You Need Sunscreen';
    const description =
      'What the UV index measures, what each band from Low to Extreme means, why UV has nothing to do with temperature, and how much sunscreen actually works.';

    this.seo.update({
      title,
      description,
      path: UV_GUIDE_PATH,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'How to Read the UV Index (and When You Actually Need Sunscreen)',
        description,
        url: `${SITE_URL}${UV_GUIDE_PATH}`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${UV_GUIDE_PATH}` },
        datePublished: GUIDES_UPDATED.iso,
        dateModified: GUIDES_UPDATED.iso,
        inLanguage: 'en',
        about: ['UV index', 'Sun protection', 'Ultraviolet radiation'],
        author: { '@type': 'Organization', name: COMPANY_NAME, url: COMPANY_URL },
        publisher: { '@type': 'Organization', name: COMPANY_NAME, url: COMPANY_URL },
        isPartOf: { '@type': 'CollectionPage', name: 'Weather Guides', url: `${SITE_URL}/guides` },
      },
    });
  }
}
