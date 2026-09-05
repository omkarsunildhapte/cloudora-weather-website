import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from '@app/app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // frontend-rules.md § 17. The app was already zoneless in practice — zone.js
    // is not a dependency at all, so Angular defaults to it — but nothing said
    // so. Declaring it means a transitively-installed zone.js can't quietly
    // switch the app back to zone-based change detection.
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideClientHydration(),
  ],
};
