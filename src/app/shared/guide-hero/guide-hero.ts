import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeatureIcon } from '@shared/feature-icon/feature-icon';
import { GuideHeroContent } from '@appTypes/index';

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
  /**
   * The whole masthead in one object.
   *
   * Was seven parallel `input.required` declarations, six of them bound to
   * literals in each guide's template — which is how `icon` and `readingTime`
   * came to be typed out again despite already living in the guides catalogue.
   */
  readonly content = input.required<GuideHeroContent>();
}
