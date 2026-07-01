import type { Pool } from 'pg';
import type { Article, ArticleInput } from '../app/models/article';
import type { AdminComment, Comment, LikeInfo, PublicUser } from '../app/models/community';
import { ARTICLES } from '../app/data/content';
import { hashPassword, verifyPassword } from './auth';

/** Levée lorsqu'un email est déjà utilisé lors de l'inscription. */
export class DuplicateEmailError extends Error {
  constructor() {
    super('Cet email est déjà utilisé.');
    this.name = 'DuplicateEmailError';
  }
}

interface UserRecord extends PublicUser {
  passwordHash: string;
}

/**
 * Couche de stockage des articles et du compte admin.
 *
 * - Si DATABASE_URL est défini → PostgreSQL (persistant, recommandé en production).
 * - Sinon → stockage en mémoire amorcé avec les articles de démarrage
 *   (pratique en dev local ; les écritures sont perdues au redémarrage).
 */

const DATABASE_URL = process.env['DATABASE_URL'];
const ADMIN_USERNAME = process.env['ADMIN_USERNAME'] || 'admin';
const ADMIN_PASSWORD = process.env['ADMIN_PASSWORD'] || 'nap-admin-2026';

export interface Store {
  listPublished(): Promise<Article[]>;
  listAll(): Promise<Article[]>;
  getBySlug(slug: string): Promise<Article | null>;
  getById(id: number): Promise<Article | null>;
  create(input: ArticleInput): Promise<Article>;
  update(id: number, input: ArticleInput): Promise<Article | null>;
  remove(id: number): Promise<boolean>;
  checkCredentials(username: string, password: string): Promise<boolean>;

  // Comptes visiteurs
  createUser(name: string, email: string, password: string): Promise<PublicUser>;
  findUserByEmail(email: string): Promise<UserRecord | null>;
  getUser(id: number): Promise<PublicUser | null>;

  // Commentaires
  listApprovedComments(articleId: number): Promise<Comment[]>;
  createComment(articleId: number, userId: number, body: string): Promise<Comment>;
  listAdminComments(status?: 'pending' | 'approved'): Promise<AdminComment[]>;
  approveComment(id: number): Promise<boolean>;
  deleteComment(id: number): Promise<boolean>;

  // J'aime
  likeInfo(articleId: number, userId?: number): Promise<LikeInfo>;
  toggleLike(articleId: number, userId: number): Promise<LikeInfo>;
}

// ---------------------------------------------------------------------------
// PostgreSQL
// ---------------------------------------------------------------------------

class PostgresStore implements Store {
  constructor(private readonly pool: Pool) {}

  async init(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        body TEXT NOT NULL,
        img_label TEXT NOT NULL DEFAULT '',
        date DATE NOT NULL,
        read_minutes INTEGER NOT NULL DEFAULT 3,
        published BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS likes (
        article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (article_id, user_id)
      );
    `);

    // Compte admin par défaut (créé une seule fois).
    const admin = await this.pool.query('SELECT 1 FROM admin_users WHERE username = $1', [
      ADMIN_USERNAME,
    ]);
    if (admin.rowCount === 0) {
      await this.pool.query('INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)', [
        ADMIN_USERNAME,
        hashPassword(ADMIN_PASSWORD),
      ]);
    }

    // Amorçage des articles de démarrage si la table est vide.
    const count = await this.pool.query('SELECT COUNT(*)::int AS n FROM articles');
    if (count.rows[0].n === 0) {
      for (const a of ARTICLES) {
        await this.create(a);
      }
    }
  }

  async listPublished(): Promise<Article[]> {
    const { rows } = await this.pool.query(
      'SELECT * FROM articles WHERE published = true ORDER BY date DESC, id DESC',
    );
    return rows.map(mapRow);
  }

  async listAll(): Promise<Article[]> {
    const { rows } = await this.pool.query('SELECT * FROM articles ORDER BY date DESC, id DESC');
    return rows.map(mapRow);
  }

  async getBySlug(slug: string): Promise<Article | null> {
    const { rows } = await this.pool.query('SELECT * FROM articles WHERE slug = $1', [slug]);
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async getById(id: number): Promise<Article | null> {
    const { rows } = await this.pool.query('SELECT * FROM articles WHERE id = $1', [id]);
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async create(input: ArticleInput): Promise<Article> {
    const { rows } = await this.pool.query(
      `INSERT INTO articles (slug, title, category, excerpt, body, img_label, date, read_minutes, published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        input.slug,
        input.title,
        input.category,
        input.excerpt,
        input.body,
        input.imgLabel,
        input.date,
        input.readMinutes,
        input.published,
      ],
    );
    return mapRow(rows[0]);
  }

  async update(id: number, input: ArticleInput): Promise<Article | null> {
    const { rows } = await this.pool.query(
      `UPDATE articles SET slug=$1, title=$2, category=$3, excerpt=$4, body=$5,
         img_label=$6, date=$7, read_minutes=$8, published=$9, updated_at=now()
       WHERE id=$10 RETURNING *`,
      [
        input.slug,
        input.title,
        input.category,
        input.excerpt,
        input.body,
        input.imgLabel,
        input.date,
        input.readMinutes,
        input.published,
        id,
      ],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async remove(id: number): Promise<boolean> {
    const res = await this.pool.query('DELETE FROM articles WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async checkCredentials(username: string, password: string): Promise<boolean> {
    const { rows } = await this.pool.query(
      'SELECT password_hash FROM admin_users WHERE username = $1',
      [username],
    );
    return rows[0] ? verifyPassword(password, rows[0].password_hash) : false;
  }

  async createUser(name: string, email: string, password: string): Promise<PublicUser> {
    const exists = await this.pool.query('SELECT 1 FROM users WHERE lower(email) = lower($1)', [
      email,
    ]);
    if ((exists.rowCount ?? 0) > 0) throw new DuplicateEmailError();
    const { rows } = await this.pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashPassword(password)],
    );
    return rows[0];
  }

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const { rows } = await this.pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE lower(email) = lower($1)',
      [email],
    );
    return rows[0]
      ? { id: rows[0].id, name: rows[0].name, email: rows[0].email, passwordHash: rows[0].password_hash }
      : null;
  }

  async getUser(id: number): Promise<PublicUser | null> {
    const { rows } = await this.pool.query('SELECT id, name, email FROM users WHERE id = $1', [id]);
    return rows[0] ?? null;
  }

  async listApprovedComments(articleId: number): Promise<Comment[]> {
    const { rows } = await this.pool.query(
      `SELECT c.id, c.body, c.created_at, u.name AS author_name
       FROM comments c JOIN users u ON u.id = c.user_id
       WHERE c.article_id = $1 AND c.status = 'approved'
       ORDER BY c.created_at ASC`,
      [articleId],
    );
    return rows.map((r) => ({
      id: r.id,
      body: r.body,
      authorName: r.author_name,
      createdAt: r.created_at?.toISOString?.() ?? r.created_at,
    }));
  }

  async createComment(articleId: number, userId: number, body: string): Promise<Comment> {
    const { rows } = await this.pool.query(
      `INSERT INTO comments (article_id, user_id, body) VALUES ($1, $2, $3)
       RETURNING id, body, created_at`,
      [articleId, userId, body],
    );
    const user = await this.getUser(userId);
    return {
      id: rows[0].id,
      body: rows[0].body,
      authorName: user?.name ?? '',
      createdAt: rows[0].created_at?.toISOString?.() ?? rows[0].created_at,
    };
  }

  async listAdminComments(status?: 'pending' | 'approved'): Promise<AdminComment[]> {
    const params: unknown[] = [];
    let where = '';
    if (status) {
      params.push(status);
      where = 'WHERE c.status = $1';
    }
    const { rows } = await this.pool.query(
      `SELECT c.id, c.article_id, c.body, c.status, c.created_at,
              u.name AS author_name, a.title AS article_title, a.slug AS article_slug
       FROM comments c
       JOIN users u ON u.id = c.user_id
       JOIN articles a ON a.id = c.article_id
       ${where}
       ORDER BY c.created_at DESC`,
      params,
    );
    return rows.map((r) => ({
      id: r.id,
      articleId: r.article_id,
      articleTitle: r.article_title,
      articleSlug: r.article_slug,
      authorName: r.author_name,
      body: r.body,
      status: r.status,
      createdAt: r.created_at?.toISOString?.() ?? r.created_at,
    }));
  }

  async approveComment(id: number): Promise<boolean> {
    const res = await this.pool.query(
      `UPDATE comments SET status = 'approved' WHERE id = $1`,
      [id],
    );
    return (res.rowCount ?? 0) > 0;
  }

  async deleteComment(id: number): Promise<boolean> {
    const res = await this.pool.query('DELETE FROM comments WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async likeInfo(articleId: number, userId?: number): Promise<LikeInfo> {
    const total = await this.pool.query(
      'SELECT COUNT(*)::int AS n FROM likes WHERE article_id = $1',
      [articleId],
    );
    let liked = false;
    if (userId) {
      const mine = await this.pool.query(
        'SELECT 1 FROM likes WHERE article_id = $1 AND user_id = $2',
        [articleId, userId],
      );
      liked = (mine.rowCount ?? 0) > 0;
    }
    return { count: total.rows[0].n, liked };
  }

  async toggleLike(articleId: number, userId: number): Promise<LikeInfo> {
    const mine = await this.pool.query(
      'SELECT 1 FROM likes WHERE article_id = $1 AND user_id = $2',
      [articleId, userId],
    );
    if ((mine.rowCount ?? 0) > 0) {
      await this.pool.query('DELETE FROM likes WHERE article_id = $1 AND user_id = $2', [
        articleId,
        userId,
      ]);
    } else {
      await this.pool.query('INSERT INTO likes (article_id, user_id) VALUES ($1, $2)', [
        articleId,
        userId,
      ]);
    }
    return this.likeInfo(articleId, userId);
  }
}

function mapRow(r: any): Article {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    excerpt: r.excerpt,
    body: r.body,
    imgLabel: r.img_label,
    date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date).slice(0, 10),
    readMinutes: r.read_minutes,
    published: r.published,
    createdAt: r.created_at?.toISOString?.() ?? r.created_at,
    updatedAt: r.updated_at?.toISOString?.() ?? r.updated_at,
  };
}

// ---------------------------------------------------------------------------
// En mémoire (fallback dev)
// ---------------------------------------------------------------------------

interface MemComment {
  id: number;
  articleId: number;
  userId: number;
  body: string;
  status: 'pending' | 'approved';
  createdAt: string;
}

class MemoryStore implements Store {
  private articles: Article[] = [];
  private seq = 1;
  private users: UserRecord[] = [];
  private userSeq = 1;
  private comments: MemComment[] = [];
  private commentSeq = 1;
  private likes: { articleId: number; userId: number }[] = [];
  private readonly passwordHash = hashPassword(ADMIN_PASSWORD);

  constructor() {
    for (const a of ARTICLES) {
      this.articles.push({ ...a, id: this.seq++, createdAt: new Date().toISOString() });
    }
  }

  private sorted(list: Article[]): Article[] {
    return [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id! - a.id!));
  }

  async listPublished(): Promise<Article[]> {
    return this.sorted(this.articles.filter((a) => a.published));
  }
  async listAll(): Promise<Article[]> {
    return this.sorted(this.articles);
  }
  async getBySlug(slug: string): Promise<Article | null> {
    return this.articles.find((a) => a.slug === slug) ?? null;
  }
  async getById(id: number): Promise<Article | null> {
    return this.articles.find((a) => a.id === id) ?? null;
  }
  async create(input: ArticleInput): Promise<Article> {
    const now = new Date().toISOString();
    const article: Article = { ...input, id: this.seq++, createdAt: now, updatedAt: now };
    this.articles.push(article);
    return article;
  }
  async update(id: number, input: ArticleInput): Promise<Article | null> {
    const i = this.articles.findIndex((a) => a.id === id);
    if (i === -1) return null;
    this.articles[i] = { ...this.articles[i], ...input, id, updatedAt: new Date().toISOString() };
    return this.articles[i];
  }
  async remove(id: number): Promise<boolean> {
    const before = this.articles.length;
    this.articles = this.articles.filter((a) => a.id !== id);
    return this.articles.length < before;
  }
  async checkCredentials(username: string, password: string): Promise<boolean> {
    return username === ADMIN_USERNAME && verifyPassword(password, this.passwordHash);
  }

  async createUser(name: string, email: string, password: string): Promise<PublicUser> {
    if (this.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new DuplicateEmailError();
    }
    const user: UserRecord = { id: this.userSeq++, name, email, passwordHash: hashPassword(password) };
    this.users.push(user);
    return { id: user.id, name: user.name, email: user.email };
  }

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async getUser(id: number): Promise<PublicUser | null> {
    const u = this.users.find((x) => x.id === id);
    return u ? { id: u.id, name: u.name, email: u.email } : null;
  }

  private authorName(userId: number): string {
    return this.users.find((u) => u.id === userId)?.name ?? '';
  }

  async listApprovedComments(articleId: number): Promise<Comment[]> {
    return this.comments
      .filter((c) => c.articleId === articleId && c.status === 'approved')
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
      .map((c) => ({ id: c.id, body: c.body, authorName: this.authorName(c.userId), createdAt: c.createdAt }));
  }

  async createComment(articleId: number, userId: number, body: string): Promise<Comment> {
    const c: MemComment = {
      id: this.commentSeq++,
      articleId,
      userId,
      body,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.comments.push(c);
    return { id: c.id, body: c.body, authorName: this.authorName(userId), createdAt: c.createdAt };
  }

  async listAdminComments(status?: 'pending' | 'approved'): Promise<AdminComment[]> {
    return this.comments
      .filter((c) => !status || c.status === status)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((c) => {
        const article = this.articles.find((a) => a.id === c.articleId);
        return {
          id: c.id,
          articleId: c.articleId,
          articleTitle: article?.title ?? '(article supprimé)',
          articleSlug: article?.slug ?? '',
          authorName: this.authorName(c.userId),
          body: c.body,
          status: c.status,
          createdAt: c.createdAt,
        };
      });
  }

  async approveComment(id: number): Promise<boolean> {
    const c = this.comments.find((x) => x.id === id);
    if (!c) return false;
    c.status = 'approved';
    return true;
  }

  async deleteComment(id: number): Promise<boolean> {
    const before = this.comments.length;
    this.comments = this.comments.filter((c) => c.id !== id);
    return this.comments.length < before;
  }

  async likeInfo(articleId: number, userId?: number): Promise<LikeInfo> {
    const count = this.likes.filter((l) => l.articleId === articleId).length;
    const liked = !!userId && this.likes.some((l) => l.articleId === articleId && l.userId === userId);
    return { count, liked };
  }

  async toggleLike(articleId: number, userId: number): Promise<LikeInfo> {
    const i = this.likes.findIndex((l) => l.articleId === articleId && l.userId === userId);
    if (i >= 0) this.likes.splice(i, 1);
    else this.likes.push({ articleId, userId });
    return this.likeInfo(articleId, userId);
  }
}

// ---------------------------------------------------------------------------
// Sélection au démarrage
// ---------------------------------------------------------------------------

let storePromise: Promise<Store> | null = null;

export function getStore(): Promise<Store> {
  if (storePromise) return storePromise;

  storePromise = (async () => {
    if (DATABASE_URL) {
      const { Pool } = await import('pg');
      // SSL requis par Render (URL externe) mais pas en local ni si sslmode=disable.
      const local = /localhost|127\.0\.0\.1/.test(DATABASE_URL);
      const sslDisabled = /sslmode=disable/.test(DATABASE_URL);
      const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: local || sslDisabled ? undefined : { rejectUnauthorized: false },
      });
      const store = new PostgresStore(pool);
      await store.init();
      console.log('[blog] Stockage : PostgreSQL');
      return store;
    }
    console.warn(
      '[blog] DATABASE_URL absent → stockage en mémoire (les articles publiés seront perdus au redémarrage). ' +
        `Connexion admin : ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}`,
    );
    return new MemoryStore();
  })();

  return storePromise;
}
