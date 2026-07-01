/** Compte visiteur (données publiques, jamais le mot de passe). */
export interface PublicUser {
  id: number;
  name: string;
  email: string;
}

/** Commentaire approuvé, tel qu'affiché sous un article. */
export interface Comment {
  id: number;
  body: string;
  authorName: string;
  createdAt: string;
}

/** État des « j'aime » d'un article pour le visiteur courant. */
export interface LikeInfo {
  count: number;
  liked: boolean;
}

/** Commentaire vu depuis l'espace de modération admin. */
export interface AdminComment {
  id: number;
  articleId: number;
  articleTitle: string;
  articleSlug: string;
  authorName: string;
  body: string;
  status: 'pending' | 'approved';
  createdAt: string;
}
