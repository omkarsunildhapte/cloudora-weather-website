import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FeatureIcon } from '@shared/feature-icon/feature-icon';
import { ScreenshotSlot } from '@appTypes/index';

/**
 * Data-driven phone-frame gallery. No real UI screenshots exist yet, so
 * every slot without a `src` renders a CSS-only placeholder (no external image —
 * see .placeholder-fill in styles.css) with the real-image brief printed
 * both as an HTML comment (for whoever edits this file) and as small on-page
 * text (for the site owner viewing the live site) — see the annotated
 * `slot` template below for the "screenshots/*.webp" paths to drop files
 * into. Once you have a real screenshot, just set `src` on the matching
 * item passed in from the calling page — no component changes needed.
 *
 * The whole grid is inside a native `@defer (on viewport)` block — it isn't
 * even in the DOM until scrolled near, then renders with the shared
 * `.animate-fade-in-up` keyframe (staggered per item), so there's no manual
 * IntersectionObserver/signal bookkeeping here at all.
 */
@Component({
  selector: 'app-screenshot-gallery',
  imports: [NgOptimizedImage, FeatureIcon],
  templateUrl: './screenshot-gallery.html',
  styleUrl: './screenshot-gallery.css',
})
export class ScreenshotGallery {
  readonly items = input.required<ScreenshotSlot[]>();
}
