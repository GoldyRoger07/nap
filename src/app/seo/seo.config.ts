/**
 * Configuration SEO centralisée.
 *
 * ⚠️ SITE_URL : remplace par ton domaine de production définitif.
 *    Utilisé pour les URLs canoniques, Open Graph, le sitemap et le JSON-LD.
 *    (Pense à mettre à jour aussi public/robots.txt, public/sitemap.xml et le
 *     JSON-LD dans src/index.html si tu changes de domaine.)
 */
export const SITE_URL = 'https://www.nap-haiti.org';

export const SITE_NAME = 'Nouvelle Alliance pour la Patrie';

export const DEFAULT_TITLE = 'Nouvelle Alliance pour la Patrie';

export const DEFAULT_DESCRIPTION =
  "La Nouvelle Alliance pour la Patrie (NAP) rassemble les citoyens d'Haïti et de la " +
  'diaspora pour unir, reconstruire et transformer le pays : sécurité, gouvernance, ' +
  'démocratie et développement durable.';

/**
 * Image de partage social (Open Graph / Twitter), format recommandé 1200×630.
 * ⚠️ Dépose un fichier à public/og-image.jpg (sinon les partages n'auront pas d'aperçu).
 */
export const OG_IMAGE = '/og-image.jpg';
