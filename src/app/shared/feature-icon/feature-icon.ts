import { Component, input } from '@angular/core';

/** Shared icon set for feature cards/sections. Simple hand-authored line icons
 *  (not photorealistic art) — reused by feature-card and the Features page. */
@Component({
  selector: 'app-feature-icon',
  templateUrl: './feature-icon.html',
  styleUrl: './feature-icon.css',
})
export class FeatureIcon {
  readonly key = input.required<string>();
}
