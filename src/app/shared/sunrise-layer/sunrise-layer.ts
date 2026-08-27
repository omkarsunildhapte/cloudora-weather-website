import { Component, inject } from '@angular/core';
import { ScrollProgressService } from '@services/scroll-progress/scroll-progress.service';

/**
 * Fixed, viewport-anchored sky backdrop: a soft cyan/blue brand glow plus three
 * bands of slowly drifting clouds. Scroll progress (0 = top, 1 = bottom — see
 * ScrollProgressService) drives a gentle parallax and cools the glow as you go
 * down the page. Purely decorative (`aria-hidden`), honours reduced-motion.
 *
 * Drop `<app-sunrise-layer />` as the FIRST element in a page template, then
 * wrap the rest of that page's content in `<div class="relative z-10">…</div>`
 * — this layer intentionally sits at z-index:0, not a negative value (a
 * negative z-index here renders invisible, hidden behind the page's own
 * painted background; see home.css history). Real page content needs its own
 * explicit higher stacking context to guarantee it paints above this layer.
 *
 * (The selector/class keep the original "sunrise" name so the pages that
 * already embed it didn't need to change when the effect was swapped.)
 */
@Component({
  selector: 'app-sunrise-layer',
  templateUrl: './sunrise-layer.html',
  styleUrl: './sunrise-layer.css',
})
export class SunriseLayer {
  private readonly scrollService = inject(ScrollProgressService);
  readonly progress = this.scrollService.progress;

  constructor() {
    this.scrollService.start();
  }
}
