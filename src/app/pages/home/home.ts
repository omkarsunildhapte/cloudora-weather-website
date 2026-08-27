import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlayStoreButton } from '@shared/play-store-button/play-store-button';
import { FeatureCard } from '@shared/feature-card/feature-card';
import { ScreenshotGallery } from '@shared/screenshot-gallery/screenshot-gallery';
import { ScreenshotSlot } from '@appTypes/index';
import { SunriseLayer } from '@shared/sunrise-layer/sunrise-layer';
import { SeoService } from '@services/seo/seo.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, PlayStoreButton, FeatureCard, ScreenshotGallery, SunriseLayer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly seo = inject(SeoService);

  readonly previewFeatures: {
    icon: string;
    title: string;
    description: string;
    tag: string | null;
  }[] = [
    {
      icon: 'sun',
      title: 'Real-Time Conditions',
      description: 'Temperature, feels-like, highs and lows for your exact location — refreshed on demand.',
      tag: null,
    },
    {
      icon: 'ai',
      title: 'AI Weather Insight',
      description: 'A short, plain-language read on your day, generated from the live forecast.',
      tag: 'AI',
    },
    {
      icon: 'hourly',
      title: 'Hourly Forecast',
      description: 'The next 24 hours in 3-hour steps, with the chance of rain for every slot.',
      tag: null,
    },
    {
      icon: 'forecast',
      title: '5-Day Forecast',
      description: 'Daily highs, lows and rain probability at a glance, with a range bar for each day.',
      tag: null,
    },
    {
      icon: 'leaf',
      title: 'Air Quality Index',
      description: 'Live AQI from Good to Very Poor, right next to the current temperature.',
      tag: null,
    },
    {
      icon: 'rain',
      title: 'Rain Heads-Up',
      description: 'A "no rain expected" chip when you\'re clear, and a warning when showers are likely.',
      tag: null,
    },
  ];

  readonly screenshotSlots: ScreenshotSlot[] = [
    {
      src: 'screenshots/home.png',
      alt: 'Cloudora Weather home screen with current conditions, hourly and daily forecast',
      caption: 'Home',
      brief: 'Home screen: current conditions, hourly + 5-day forecast, AI insight',
      icon: 'sun',
    },
    {
      src: 'screenshots/forecast.png',
      alt: 'Cloudora Weather 10-day forecast screen with temperature and precipitation charts',
      caption: 'Forecast',
      brief: 'Forecast screen: temperature trend, precipitation chart, daily list',
      icon: 'forecast',
    },
    {
      src: 'screenshots/radar.png',
      alt: 'Cloudora Weather live precipitation radar screen',
      caption: 'Radar',
      brief: 'Radar screen: live precipitation map with timeline scrubber',
      icon: 'radar',
    },
    {
      src: 'screenshots/air-quality.png',
      alt: 'Cloudora Weather air quality screen with AQI gauge and pollutant breakdown',
      caption: 'Air Quality',
      brief: 'Air quality screen: AQI gauge, pollutants, health recommendations',
      icon: 'leaf',
    },
  ];

  ngOnInit(): void {
    this.seo.update({
      title: 'Cloudora Weather — Real-Time Forecasts, Air Quality & AI Insight for Android',
      description:
        'A fast, beautiful, privacy-first weather app for Android: real-time conditions, hourly and 5-day forecasts, air quality, and an AI weather insight for your day. Free on Google Play.',
      path: '/',
    });
  }
}
