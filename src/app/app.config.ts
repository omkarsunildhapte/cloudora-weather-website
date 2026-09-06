import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from '@app/app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // frontend-rules.md § 17. The app was already zoneless in practice — zone.js
    // is not a dependency at all, so Angular defaults to it — but nothing said
    // so. Declaring it means a transitively-installed zone.js can't quietly
    // switch the app back to zone-based change detection.
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding is inert today — all 11 routes are static, so
    // there is nothing to bind. It is on because frontend-rules.md § 15 asks
    // for it and because the first parameterised route added without it would
    // silently receive nothing rather than fail.
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      withComponentInputBinding(),
    ),
    provideClientHydration(),
  ],
};
