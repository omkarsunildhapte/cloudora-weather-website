import { Component, input } from '@angular/core';
import { FeatureIcon } from '@shared/feature-icon/feature-icon';
import { FeaturePreview } from '@appTypes/index';

@Component({
  selector: 'app-feature-card',
  imports: [FeatureIcon],
  templateUrl: './feature-card.html',
  styleUrls: ['../icon-well.css', './feature-card.css'],
})
export class FeatureCard {
  /**
   * One card's worth of copy.
   *
   * A single object rather than four parallel inputs: every call site already
   * held a FeaturePreview and was destructuring it across four bindings only
   * for this component to put it back together. Adding a field to the type no
   * longer means touching the component, its template and each caller.
   */
  readonly feature = input.required<FeaturePreview>();
}
