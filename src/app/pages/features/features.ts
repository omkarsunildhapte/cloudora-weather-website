import { Component, OnInit, afterNextRender, inject, input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlayStoreButton } from '@shared/play-store-button/play-store-button';
import { FeatureIcon } from '@shared/feature-icon/feature-icon';
import { SunriseLayer } from '@shared/sunrise-layer/sunrise-layer';
import { SeoService } from '@services/seo/seo.service';
import { FEATURE_CATEGORIES, FEATURE_DETAILS, SITE_URL, categoryForSlug, categorySlug, featuresIn } from '@constants/index';
import { FeatureCategory, FeatureDetail } from '@appTypes/index';

@Component({
  selector: 'app-features',
  imports: [RouterLink, PlayStoreButton, FeatureIcon, SunriseLayer],
  templateUrl: './features.html',
  styleUrls: ['../cta-panel.css', '../../shared/icon-well.css', './features.css'],
})
export class Features implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly document = inject(DOCUMENT);

  constructor() {
    afterNextRender(() => this.scrollToSection());
  }

  readonly features = FEATURE_DETAILS;
  readonly categories = FEATURE_CATEGORIES;

  /**
   * Bound from `?section=` by withComponentInputBinding().
   *
   * A query param rather than a fragment, so the root-level form reaches the
   * Worker and can be redirected before the page loads. The cost is that the
   * browser will not scroll on its own — a fragment does that for free — so
   * scrollToSection() below has to do it.
   */
  readonly section = input<string>();

  featuresIn(category: FeatureCategory): FeatureDetail[] {
    return featuresIn(category);
  }

  /** Category name -> anchor id, so the jump links and section ids always agree. */
  slug(category: string): string {
    return categorySlug(category);
  }

  /**
   * afterNextRender, not ngOnInit: the section elements do not exist during
   * prerendering, and on the client the view has to be laid out before an
   * offset means anything.
   */
  private scrollToSection(): void {
    const category = categoryForSlug(this.section() ?? null);
    if (!category) return;

    const target = this.document.getElementById(categorySlug(category));
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

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
