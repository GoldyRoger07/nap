import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/**
 * Authentification admin sans dépendance externe (crypto natif de Node).
 * - Mots de passe : scrypt + sel aléatoire, stockés « scrypt$sel$hash ».
 * - Jetons : payload JSON signé HMAC-SHA256 (format proche d'un JWT).
 */

const SECRET =
  process.env['AUTH_SECRET'] ||
  process.env['DATABASE_URL'] ||
  'nap-dev-secret-change-me';

const ADMIN_TTL_MS = 1000 * 60 * 60 * 12; // 12 h
const USER_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 jours

export type Role = 'admin' | 'user';

export interface TokenClaims {
  /** Sujet : nom d'utilisateur admin, ou identifiant numérique (en texte) pour un compte visiteur. */
  sub: string;
  role: Role;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function sign(data: string): string {
  return b64url(createHmac('sha256', SECRET).update(data).digest());
}

export function createToken(sub: string, role: Role): string {
  const ttl = role === 'admin' ? ADMIN_TTL_MS : USER_TTL_MS;
  const payload = b64url(JSON.stringify({ sub, role, exp: Date.now() + ttl }));
  return `${payload}.${sign(payload)}`;
}

/** Retourne les revendications (sujet + rôle) si le jeton est valide et non expiré, sinon null. */
export function verifyToken(token: string | undefined): TokenClaims | null {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null;
    if (typeof data.sub !== 'string') return null;
    const role: Role = data.role === 'admin' ? 'admin' : 'user';
    return { sub: data.sub, role };
  } catch {
    return null;
  }
}

/** Lit le jeton « Bearer » d'un en-tête Authorization. */
export function bearer(authorization: string | undefined): string | undefined {
  return authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
}
