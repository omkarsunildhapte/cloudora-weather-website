import { PLATFORM_ID, Service, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * App-wide scroll-progress tracker (0 at the top of the current page, 1 at
 * the bottom). Root-provided singleton — scroll position is inherently a
 * single global value, and since scrollHeight is re-read on every event,
 * it naturally adapts to whichever route/page is currently rendered
 * without needing per-route reset logic. Consumers (e.g. SunriseLayer)
 * call `start()`, which is idempotent — the listener is attached once for
 * the app's lifetime no matter how many components request it.
 *
 * `start()` is called eagerly from SunriseLayer's constructor, so on the
 * server (prerendering/SSR) it must no-op before touching `window`/
 * `document` — neither exists in the Node prerender process.
 */
@Service()
export class ScrollProgressService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly progress = signal(0);

  private readonly reducedMotion =
    this.isBrowser &&
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;
  private rafId: number | null = null;
  private started = false;

  start(): void {
    if (this.started || !this.isBrowser) return;
    this.started = true;

    if (this.reducedMotion) {
      this.progress.set(0.4);
      return;
    }

    this.update();
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll, { passive: true });
  }

  private readonly onScroll = (): void => {
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.update();
    });
  };

  private update(): void {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const p = scrollable > 0 ? window.scrollY / scrollable : 0;
    this.progress.set(Math.min(1, Math.max(0, p)));
  }
}
