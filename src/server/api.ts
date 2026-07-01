import { Router, type Request, type Response, type NextFunction } from 'express';
import type { ArticleInput } from '../app/models/article';
import { slugify } from '../app/models/article';
import { bearer, createToken, verifyPassword, verifyToken } from './auth';
import { DuplicateEmailError, getStore } from './store';

/** Trim d'une valeur potentiellement absente en chaîne. */
function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/** Router Express montant l'API du blog sous /api. */
export function createApiRouter(): Router {
  const router = Router();
  router.use((_req, res, next) => {
    res.type('application/json');
    next();
  });

  // --- Authentification ---------------------------------------------------
  router.post('/auth/login', async (req, res) => {
    const { username, password } = req.body ?? {};
    if (typeof username !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Identifiants requis.' });
      return;
    }
    const store = await getStore();
    if (!(await store.checkCredentials(username, password))) {
      res.status(401).json({ error: 'Identifiants invalides.' });
      return;
    }
    res.json({ token: createToken(username, 'admin'), username });
  });

  // Inscription d'un compte visiteur.
  router.post('/auth/register', async (req, res) => {
    const name = str(req.body?.name);
    const email = str(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Nom, email et mot de passe sont obligatoires.' });
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      res.status(400).json({ error: 'Adresse email invalide.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Le mot de passe doit comporter au moins 6 caractères.' });
      return;
    }
    const store = await getStore();
    try {
      const user = await store.createUser(name, email, password);
      res.status(201).json({ token: createToken(String(user.id), 'user'), user });
    } catch (e) {
      if (e instanceof DuplicateEmailError) {
        res.status(409).json({ error: e.message });
        return;
      }
      throw e;
    }
  });

  // Connexion d'un compte visiteur.
  router.post('/auth/user-login', async (req, res) => {
    const email = str(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || !password) {
      res.status(400).json({ error: 'Email et mot de passe requis.' });
      return;
    }
    const store = await getStore();
    const record = await store.findUserByEmail(email);
    if (!record || !verifyPassword(password, record.passwordHash)) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      return;
    }
    const user = { id: record.id, name: record.name, email: record.email };
    res.json({ token: createToken(String(user.id), 'user'), user });
  });

  // --- Lecture publique ---------------------------------------------------
  router.get('/articles', async (_req, res) => {
    const store = await getStore();
    res.json(await store.listPublished());
  });

  router.get('/articles/:slug', async (req, res) => {
    const store = await getStore();
    const article = await store.getBySlug(req.params.slug);
    if (!article || !article.published) {
      res.status(404).json({ error: 'Article introuvable.' });
      return;
    }
    res.json(article);
  });

  // --- Commentaires & j'aime (par slug d'article) -------------------------
  // Résout un article publié par slug, ou répond 404.
  const resolveArticle = async (slug: string, res: Response) => {
    const store = await getStore();
    const article = await store.getBySlug(slug);
    if (!article || !article.published || !article.id) {
      res.status(404).json({ error: 'Article introuvable.' });
      return null;
    }
    return article;
  };

  router.get('/articles/:slug/comments', async (req, res) => {
    const article = await resolveArticle(String(req.params['slug']), res);
    if (!article) return;
    const store = await getStore();
    res.json(await store.listApprovedComments(article.id!));
  });

  router.post('/articles/:slug/comments', requireUser, async (req, res) => {
    const body = str(req.body?.body);
    if (body.length < 2) {
      res.status(400).json({ error: 'Le commentaire est trop court.' });
      return;
    }
    if (body.length > 3000) {
      res.status(400).json({ error: 'Le commentaire est trop long (3000 caractères max).' });
      return;
    }
    const article = await resolveArticle(String(req.params['slug']), res);
    if (!article) return;
    const userId = (req as Request & { userId: number }).userId;
    const store = await getStore();
    const comment = await store.createComment(article.id!, userId, body);
    // Le commentaire est en attente de modération avant d'être visible.
    res.status(201).json({ ...comment, status: 'pending' });
  });

  router.get('/articles/:slug/likes', async (req, res) => {
    const article = await resolveArticle(String(req.params['slug']), res);
    if (!article) return;
    const store = await getStore();
    res.json(await store.likeInfo(article.id!, optionalUserId(req)));
  });

  router.post('/articles/:slug/like', requireUser, async (req, res) => {
    const article = await resolveArticle(String(req.params['slug']), res);
    if (!article) return;
    const userId = (req as Request & { userId: number }).userId;
    const store = await getStore();
    res.json(await store.toggleLike(article.id!, userId));
  });

  // --- Espace admin (protégé) --------------------------------------------
  const admin = Router();
  admin.use(requireAdmin);

  admin.get('/articles', async (_req, res) => {
    const store = await getStore();
    res.json(await store.listAll());
  });

  admin.post('/articles', async (req, res) => {
    const input = validate(req.body);
    if ('error' in input) {
      res.status(400).json({ error: input.error });
      return;
    }
    const store = await getStore();
    if (await store.getBySlug(input.value.slug)) {
      res.status(409).json({ error: 'Un article utilise déjà ce lien (slug).' });
      return;
    }
    res.status(201).json(await store.create(input.value));
  });

  admin.put('/articles/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Identifiant invalide.' });
      return;
    }
    const input = validate(req.body);
    if ('error' in input) {
      res.status(400).json({ error: input.error });
      return;
    }
    const store = await getStore();
    const clash = await store.getBySlug(input.value.slug);
    if (clash && clash.id !== id) {
      res.status(409).json({ error: 'Un autre article utilise déjà ce lien (slug).' });
      return;
    }
    const updated = await store.update(id, input.value);
    if (!updated) {
      res.status(404).json({ error: 'Article introuvable.' });
      return;
    }
    res.json(updated);
  });

  admin.delete('/articles/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Identifiant invalide.' });
      return;
    }
    const store = await getStore();
    const ok = await store.remove(id);
    if (!ok) {
      res.status(404).json({ error: 'Article introuvable.' });
      return;
    }
    res.status(204).end();
  });

  // Modération des commentaires.
  admin.get('/comments', async (req, res) => {
    const status = req.query['status'];
    const filter = status === 'pending' || status === 'approved' ? status : undefined;
    const store = await getStore();
    res.json(await store.listAdminComments(filter));
  });

  admin.post('/comments/:id/approve', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Identifiant invalide.' });
      return;
    }
    const store = await getStore();
    const ok = await store.approveComment(id);
    if (!ok) {
      res.status(404).json({ error: 'Commentaire introuvable.' });
      return;
    }
    res.status(204).end();
  });

  admin.delete('/comments/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Identifiant invalide.' });
      return;
    }
    const store = await getStore();
    const ok = await store.deleteComment(id);
    if (!ok) {
      res.status(404).json({ error: 'Commentaire introuvable.' });
      return;
    }
    res.status(204).end();
  });

  router.use('/admin', admin);

  // Erreurs inattendues → JSON.
  router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[api] erreur:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  });

  return router;
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const claims = verifyToken(bearer(req.headers.authorization));
  if (!claims || claims.role !== 'admin') {
    res.status(401).json({ error: 'Authentification requise.' });
    return;
  }
  next();
}

/** Exige un compte visiteur connecté ; expose l'identifiant via req.userId. */
function requireUser(req: Request, res: Response, next: NextFunction): void {
  const claims = verifyToken(bearer(req.headers.authorization));
  if (!claims || claims.role !== 'user') {
    res.status(401).json({ error: 'Connexion requise.' });
    return;
  }
  (req as Request & { userId?: number }).userId = Number(claims.sub);
  next();
}

/** Identifiant du visiteur si un jeton « user » valide est présent (sinon undefined). */
function optionalUserId(req: Request): number | undefined {
  const claims = verifyToken(bearer(req.headers.authorization));
  return claims?.role === 'user' ? Number(claims.sub) : undefined;
}

type ValidationResult = { value: ArticleInput } | { error: string };

function validate(body: any): ValidationResult {
  if (!body || typeof body !== 'object') return { error: 'Corps de requête invalide.' };

  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const title = str(body.title);
  const category = str(body.category);
  const excerpt = str(body.excerpt);
  const articleBody = typeof body.body === 'string' ? body.body.trim() : '';

  if (!title) return { error: 'Le titre est obligatoire.' };
  if (!category) return { error: 'La catégorie est obligatoire.' };
  if (!articleBody) return { error: 'Le contenu de l’article est obligatoire.' };

  const slug = str(body.slug) ? slugify(str(body.slug)) : slugify(title);
  if (!slug) return { error: 'Impossible de générer un lien (slug) valide.' };

  const date = /^\d{4}-\d{2}-\d{2}$/.test(str(body.date))
    ? str(body.date)
    : new Date().toISOString().slice(0, 10);

  const readMinutes =
    Number.isFinite(body.readMinutes) && body.readMinutes > 0
      ? Math.round(body.readMinutes)
      : estimateReadMinutes(articleBody);

  return {
    value: {
      slug,
      title,
      category,
      excerpt: excerpt || articleBody.slice(0, 160),
      body: articleBody,
      imgLabel: str(body.imgLabel) || `PHOTO — ${category.toLowerCase()}`,
      date,
      readMinutes,
      published: body.published !== false,
    },
  };
}

function estimateReadMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
