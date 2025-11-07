// lib/auth/server.ts
// Minimal auth helpers for the App Router using a signed cookie session.
// TODO: consider moving to a durable session store (DB/Redis) and adding rotation/expiry policies.
// TODO: evaluate Auth.js/NextAuth or a custom OAuth flow for production needs.

import { cookies } from 'next/headers';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const SESSION_COOKIE = 'afa_session';
const SESSION_VERSION = 'v1';
const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    // In dev, use an explicit fallback to avoid silent 500s during local work.
    // AUTH_SECRET MUST be set in production.
    if (process.env.NODE_ENV !== 'production') {
      return 'dev-insecure-auth-secret-change-me'; // TODO: replace with env in all environments
    }
    throw new Error('AUTH_SECRET is required in production. Set process.env.AUTH_SECRET.');
  }
  return secret;
}

function b64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function sign(data: string): string {
  const h = crypto.createHmac('sha256', getAuthSecret());
  h.update(data);
  return b64url(h.digest());
}

function buildToken(payload: object): string {
  const json = JSON.stringify(payload);
  const body = b64url(json);
  const sig = sign(`${SESSION_VERSION}.${body}`);
  return `${SESSION_VERSION}.${body}.${sig}`;
}

function parseToken(token: string | undefined): { uid: string; exp: number } | null {
  if (!token) return null;
  const [ver, body, sig] = token.split('.');
  if (ver !== SESSION_VERSION || !body || !sig) return null;
  const expected = sign(`${ver}.${body}`);
  if (expected !== sig) return null;
  try {
    const json = Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const payload = JSON.parse(json) as { uid: string; exp: number };
    if (!payload.uid || !payload.exp) return null;
    if (Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  plan: 'FREE' | 'PRO' | 'BUSINESS';
  createdAt: string;
  updatedAt: string;
};

function toPublicUser(u: any): PublicUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    plan: u.plan,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
    updatedAt: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : String(u.updatedAt),
  };
}

// Creates or refreshes a session cookie for the given user id.
export async function createSession(userId: string, ttlSeconds = DEFAULT_SESSION_TTL_SECONDS) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  // NOTE: Only userId+exp go into the token. Never include secrets like password.
  const token = buildToken({ uid: userId, exp });
  const c = await cookies();
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ttlSeconds,
  });
}

// Clears the session cookie.
export async function clearSession() {
  const c = await cookies();
  c.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

// Returns the current user from session cookie, or null.
export async function getCurrentUser(): Promise<PublicUser | null> {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  const payload = parseToken(token);
  if (!payload) return null;
  const user = await prisma.user.findUnique({ where: { id: payload.uid } });
  if (!user) return null;
  return toPublicUser(user);
}

// Requires an authenticated user; throws an error if absent. Useful in handlers.
export async function requireUser(): Promise<PublicUser> {
  const u = await getCurrentUser();
  if (!u) {
    const err: any = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  return u;
}

// Password hashing helpers using scrypt (placeholder for bcrypt).
// TODO: Switch to bcrypt (or argon2id) with strong parameters in production.
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, buf) => (err ? reject(err) : resolve(buf)));
  });
  return `scrypt:${salt.toString('hex')}:${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    // Prefer bcrypt if the stored hash looks like bcrypt (e.g. $2b$...).
    if (typeof stored === 'string' && stored.startsWith('$2')) {
      try {
        const bcrypt: any = await import('bcrypt').then(m => m.default ?? m).catch(() => null);
        if (bcrypt) return await bcrypt.compare(password, stored);
        // If bcrypt is unavailable (e.g., dev without native module), fall back to scrypt check
        // which will simply fail for bcrypt hashes.
      } catch {
        // ignore and fall through to scrypt path
      }
      return false;
    }

    // Legacy scrypt format: scrypt:<saltHex>:<hashHex>
    const [scheme, saltHex, hashHex] = stored.split(':');
    if (scheme !== 'scrypt') return false;
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const derived = await new Promise<Buffer>((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (err, buf) => (err ? reject(err) : resolve(buf)));
    });
    return crypto.timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}
