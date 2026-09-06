import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlayStoreButton } from '@shared/play-store-button/play-store-button';
import { FeatureCard } from '@shared/feature-card/feature-card';
import { ScreenshotGallery } from '@shared/screenshot-gallery/screenshot-gallery';
import { SunriseLayer } from '@shared/sunrise-layer/sunrise-layer';
import { LiveWeather } from '@shared/live-weather/live-weather';
import { SeoService } from '@services/seo/seo.service';
import { FEATURES_PATH, FEATURE_DETAILS, PREVIEW_FEATURES, SCREENSHOT_SLOTS, categoryForSlug, categorySlug } from '@constants/index';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    PlayStoreButton,
    FeatureCard,
    ScreenshotGallery,
    SunriseLayer,
    LiveWeather,
  ],
  templateUrl: './home.html',
  styleUrls: ['../cta-panel.css', './home.css'],
})
export class Home implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly previewFeatures = PREVIEW_FEATURES;

  /** Derived, so the "View all N" link can never disagree with the features page. */
  readonly featureCount = FEATURE_DETAILS.length;

  readonly screenshotSlots = SCREENSHOT_SLOTS;

  /**
   * Forwards `/#air-sun-storms` to `/features#air-sun-storms`.
   *
   * The category anchors only exist on the features page, so a shared or
   * mistyped root-level link scrolls nowhere. A server redirect cannot do this:
   * browsers never send the fragment to the server, so it has to happen here.
   * Unknown fragments are left alone rather than bounced.
   */
  private forwardCategoryFragment(): void {
    const category = categoryForSlug(this.route.snapshot.fragment);
    if (!category) return;
    void this.router.navigate([FEATURES_PATH], { fragment: categorySlug(category), replaceUrl: true });
  }

  ngOnInit(): void {
    this.forwardCategoryFragment();

    this.seo.update({
      title: 'Cloudora Weather — Real-Time Forecasts, Air Quality & AI Insight for Android',
      description:
        'A fast, beautiful, privacy-first weather app for Android: real-time conditions, hourly and 5-day forecasts, air quality, and an AI weather insight for your day. Free on Google Play.',
      path: '/',
    });
  }
}
