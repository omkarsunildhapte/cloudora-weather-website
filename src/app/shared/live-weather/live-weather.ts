import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeatureIcon } from '@shared/feature-icon/feature-icon';
import { LiveWeatherService } from '@services/live-weather/live-weather.service';

/**
 * The homepage's "this is the product working right now" card: a real
 * current-conditions reading, fetched live from the same Worker proxy the app
 * itself uses, laid out the way the app lays out its own home screen.
 *
 * All state lives in `LiveWeatherService` — this component only picks a city
 * and renders one of the resource's three states. Loading state comes from
 * `resource.isLoading()`/`error()` rather than a hand-rolled boolean
 * (frontend-rules Rule 11), and the whole thing degrades to a static
 * "conditions unavailable" panel if the proxy is down, so a failed request
 * never shows a broken card or an error dump.
 *
 * Safe to prerender: the service's resource is idle on the server, so this
 * renders its skeleton into the static HTML and fills in after hydration.
 */
@Component({
  selector: 'app-live-weather',
  imports: [RouterLink, FeatureIcon],
  templateUrl: './live-weather.html',
  styleUrl: './live-weather.css',
})
export class LiveWeather {
  private readonly service = inject(LiveWeatherService);

  readonly cities = this.service.cities;
  readonly selectedCity = this.service.selectedCity;
  readonly snapshot = this.service.snapshot;

  /** Skeleton rows are decorative; the count only needs to match the real
   *  detail strip so the two states are the same height. */
  readonly skeletonTiles = [0, 1, 2, 3, 4];

  select(id: string): void {
    this.service.select(id);
  }

  retry(): void {
    this.snapshot.reload();
  }
}
