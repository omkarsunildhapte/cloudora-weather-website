import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeatureIcon } from '@shared/feature-icon/feature-icon';
import { PlayStoreButton } from '@shared/play-store-button/play-store-button';
import { GuideLink } from '@appTypes/index';

/**
 * Closes every guide: cross-links to the rest of the catalogue (real internal
 * links, which is what makes a content section worth having for search) and
 * the download CTA the whole site funnels towards.
 *
 * The `related` list comes from `otherGuides()` in `@constants/guides`, so a
 * new guide appears at the foot of the existing four automatically.
 */
@Component({
  selector: 'app-guide-outro',
  imports: [RouterLink, FeatureIcon, PlayStoreButton],
  templateUrl: './guide-outro.html',
  styleUrl: './guide-outro.css',
})
export class GuideOutro {
  readonly related = input.required<GuideLink[]>();
}
