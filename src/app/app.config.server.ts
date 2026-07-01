import { mergeApplicationConfig, ApplicationConfig, REQUEST, inject } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { API_BASE } from './services/api.token';

// En SSR, HttpClient (fetch) exige une URL absolue. On déduit l'origine de la
// requête entrante (fonctionne en dev comme en production), avec repli sur le port local.
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: API_BASE,
      useFactory: () => {
        const req = inject(REQUEST, { optional: true });
        if (req?.url) {
          try {
            return new URL(req.url).origin;
          } catch {
            /* URL non absolue : on utilise le repli */
          }
        }
        return `http://127.0.0.1:${process.env['PORT'] || 4000}`;
      },
    },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
