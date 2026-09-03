import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeatureIcon } from '@shared/feature-icon/feature-icon';

/**
 * The masthead every `/guides/<slug>` page opens with: eyebrow chip, the
 * page's single `<h1>`, a standfirst, and the reading-time / last-updated
 * byline.
 *
 * Factored out because all four guides share it exactly — the alternative was
 * copying ~40 lines of markup and the whole glow/stagger CSS recipe into each
 * page, the way `home`, `features` and the legal pages each carry their own.
 * The guide *prose* deliberately stays in each page's own template (long-form
 * copy belongs with the page, not projected through a wrapper).
 */
@Component({
  selector: 'app-guide-hero',
  imports: [RouterLink, FeatureIcon],
  templateUrl: './guide-hero.html',
  styleUrl: './guide-hero.css',
})
export class GuideHero {
  readonly eyebrow = input.required<string>();
  /** `@shared/feature-icon` key shown in the eyebrow chip. */
  readonly icon = input.required<string>();
  /** Headline split in two so the second half can take the brand gradient. */
  readonly titleLead = input.required<string>();
  readonly titleAccent = input.required<string>();
  readonly summary = input.required<string>();
  readonly readingTime = input.required<string>();
  /** Human-readable publication/update date, e.g. "September 4, 2026". */
  readonly updated = input.required<string>();
}
