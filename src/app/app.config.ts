import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideIcons, provideNgIconsConfig } from '@ng-icons/core';

import { routes } from './app.routes';
import { appIcons } from './icons';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })
    ),
    provideClientHydration(),
    provideIcons(appIcons),
    provideNgIconsConfig({ size: '1.25rem' })
  ]
};
