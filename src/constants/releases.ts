import { Release } from '@appTypes/index';

/**
 * The What's New timeline, newest first.
 *
 * Adding a release is one entry at the top — nothing on the page is hardcoded
 * to a particular version. Also the source of that page's JSON-LD, so `isoDate`
 * has to stay a valid date string rather than display copy.
 */
export const RELEASES: Release[] = [
  {
    version: '0.0.1',
    date: 'September 2026',
    isoDate: '2026-09-01',
    headline: 'The first release',
    summary:
      'Cloudora Weather arrives on Google Play: current conditions, forecasts, air quality, UV, radar and an AI read on your day, in one ad-free app with no account to create.',
    changes: [
      {
        kind: 'new',
        title: 'Real-time conditions',
        detail:
          'Current temperature, feels-like, today\'s high and low, and a condition-aware background that changes with the sky. Sunrise and sunset times included.',
      },
      {
        kind: 'new',
        title: 'Hourly and 5-day forecast',
        detail:
          'The next 24 hours in three-hour steps with a rain chance per slot, plus daily highs, lows and precipitation probability for the coming five days.',
      },
      {
        kind: 'new',
        title: 'Air quality index',
        detail:
          'A live AQI rating from Good to Very Poor shown beside the current temperature, based on OpenWeatherMap air-pollution data.',
      },
      {
        kind: 'new',
        title: 'UV index and conditions detail',
        detail:
          'UV labelled from Low to Extreme, alongside humidity, wind speed and compass direction, pressure and visibility.',
      },
      {
        kind: 'new',
        title: 'Precipitation radar',
        detail:
          'A live radar map with a timeline scrubber, so you can see which way a shower is moving before deciding whether to wait it out.',
      },
      {
        kind: 'new',
        title: 'AI weather insight',
        detail:
          'A short, plain-language read on your day generated from the live forecast numbers. Optional, and switchable off in the privacy preferences.',
      },
      {
        kind: 'new',
        title: 'City compare',
        detail:
          'Put two locations side by side — useful when you are travelling, or deciding which end of a weekend trip to pack for.',
      },
      {
        kind: 'new',
        title: 'Home-screen widget',
        detail:
          'Current conditions on your Android home screen, without opening the app.',
      },
    ],
  },
];
