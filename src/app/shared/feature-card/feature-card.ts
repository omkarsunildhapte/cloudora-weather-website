import { Component, input } from '@angular/core';
import { FeatureIcon } from '@shared/feature-icon/feature-icon';

@Component({
  selector: 'app-feature-card',
  imports: [FeatureIcon],
  templateUrl: './feature-card.html',
  styleUrl: './feature-card.css',
})
export class FeatureCard {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly tag = input<string | null>(null);
}
