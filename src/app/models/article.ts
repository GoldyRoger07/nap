/** Modèle d'article de blog, partagé entre le front, les services et l'API serveur. */
export interface Article {
  id?: number;
  /** Identifiant lisible dans l'URL, ex. 'retablir-la-securite'. */
  slug: string;
  title: string;
  category: string;
  /** Résumé court affiché dans les listes et cartes. */
  excerpt: string;
  /** Corps de l'article : texte, paragraphes séparés par une ligne vide. */
  body: string;
  /** Libellé de l'emplacement image (placeholder tant qu'il n'y a pas de photo). */
  imgLabel: string;
  /** Date de publication au format ISO 'AAAA-MM-JJ'. */
  date: string;
  /** Temps de lecture estimé en minutes. */
  readMinutes: number;
  /** Un brouillon (false) n'apparaît pas sur le site public. */
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Données d'un article à la création / modification depuis l'admin. */
export type ArticleInput = Omit<Article, 'id' | 'createdAt' | 'updatedAt'>;

/** Liste des catégories proposées dans le formulaire et les filtres. */
export const CATEGORIES = [
  'Sécurité',
  'Gouvernance',
  'Jeunesse',
  'Diaspora',
  'Justice sociale',
  'Économie',
];

/** Construit la ligne « 15 juin 2026 · 6 min de lecture ». */
export function articleMeta(a: Pick<Article, 'date' | 'readMinutes'>): string {
  const d = new Date(a.date);
  const date = isNaN(d.getTime())
    ? a.date
    : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${date} · ${a.readMinutes} min de lecture`;
}

/** Découpe le corps en paragraphes (séparés par une ligne vide) pour l'affichage. */
export function articleParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/** Génère un slug propre à partir d'un titre. */
export function slugify(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}
