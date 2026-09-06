import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeatureIcon } from '@shared/feature-icon/feature-icon';
import { SunriseLayer } from '@shared/sunrise-layer/sunrise-layer';
import { SeoService } from '@services/seo/seo.service';
import { GUIDES_PATH, NOT_FOUND_PATH, NOT_FOUND_SUGGESTIONS } from '@constants/index';

/**
 * The 404 page.
 *
 * Prerendered to `/404/index.html` and copied to `404.html` by
 * `scripts/copy-404.mjs`, because Cloudflare's `not_found_handling: "404-page"`
 * looks for that exact filename at the assets root. Serving it that way is what
 * makes the response a real 404 — the previous `not_found_handling:
 * "single-page-application"` returned index.html with a 200 for every unknown
 * path, which is how a mistyped sitemap URL came back as an HTML page with an
 * OK status instead of an error.
 *
 * `noindex` is belt-and-braces: the 404 status already keeps it out of the
 * index, but the page is also reachable by client-side navigation, where no
 * status code is involved at all.
 */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink, FeatureIcon, SunriseLayer],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound implements OnInit {
  private readonly seo = inject(SeoService);

  readonly guidesPath = GUIDES_PATH;
  readonly suggestions = NOT_FOUND_SUGGESTIONS;

  ngOnInit(): void {
    this.seo.update({
      title: 'Page not found — Cloudora Weather',
      description:
        'That page does not exist. Head back to the Cloudora Weather home page, the feature list, or the weather guides.',
      path: NOT_FOUND_PATH,
      noindex: true,
    });
  }
}
