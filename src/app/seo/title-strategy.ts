import { Injectable, inject } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Seo } from './seo';
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from './seo.config';

/**
 * TitleStrategy personnalisée : centralise tout le SEO par page.
 * Lit `title` et `data.description` (+ `data.ogImage` optionnel) de la route
 * active et délègue au service Seo (title, meta description, canonical, OG/Twitter).
 */
@Injectable()
export class SeoTitleStrategy extends TitleStrategy {
  private readonly seo = inject(Seo);

  override updateTitle(state: RouterStateSnapshot): void {
    const title = this.buildTitle(state) ?? DEFAULT_TITLE;

    // Descend jusqu'à la route la plus profonde pour récupérer ses données.
    let route = state.root;
    while (route.firstChild) {
      route = route.firstChild;
    }

    const description = (route.data['description'] as string) ?? DEFAULT_DESCRIPTION;
    const image = route.data['ogImage'] as string | undefined;
    // `state.url` est fourni par le Router (évite d'injecter Router → dépendance circulaire).
    const path = state.url.split('#')[0].split('?')[0];

    this.seo.update({ title, description, path, image });
  }
}
