import { Routes } from '@angular/router';

// prettier-ignore — one route per line reads as a table of the site's URLs.
// Without this, printWidth: 100 wraps every entry into a six-line block and the
// shape of the routing table disappears.
// prettier-ignore
export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  { path: 'features', loadComponent: () => import('./pages/features/features').then((m) => m.Features) },

  // Weather guides. Every route here must also be listed in
  // src/constants/guides.ts, public/sitemap.xml and public/llms.txt.
  { path: 'guides', loadComponent: () => import('./pages/guides/guides').then((m) => m.Guides) },
  { path: 'guides/air-quality-index', loadComponent: () => import('./pages/guides/air-quality-index/air-quality-index').then((m) => m.AirQualityIndexGuide) },
  { path: 'guides/uv-index', loadComponent: () => import('./pages/guides/uv-index/uv-index').then((m) => m.UvIndexGuide) },
  { path: 'guides/feels-like-temperature', loadComponent: () => import('./pages/guides/feels-like-temperature/feels-like-temperature').then((m) => m.FeelsLikeTemperatureGuide) },
  { path: 'guides/precipitation-radar', loadComponent: () => import('./pages/guides/precipitation-radar/precipitation-radar').then((m) => m.PrecipitationRadarGuide) },

  { path: 'whats-new', loadComponent: () => import('./pages/whats-new/whats-new').then((m) => m.WhatsNew) },
  { path: 'privacy-policy', loadComponent: () => import('./pages/privacy-policy/privacy-policy').then((m) => m.PrivacyPolicy) },
  { path: 'terms-of-service', loadComponent: () => import('./pages/terms-of-service/terms-of-service').then((m) => m.TermsOfService) },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact) },

  { path: '404', loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound) },
  // Renders the same component rather than redirecting home: a wrong URL that
  // silently lands on the home page tells the visitor nothing, and told Google
  // the page existed. Cloudflare serves the prerendered 404.html with a real
  // 404 status; this branch only covers client-side navigation.
  { path: '**', loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound) },
];
