import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, verifyPassword } from '@/lib/auth/server';

export const runtime = 'nodejs';

// POST /api/auth/login
export async function POST(req: Request) {
  try {
    // 1) Parse and validate body
    let email: unknown;
    let password: unknown;
    try {
      const body = (await req.json()) as { email?: unknown; password?: unknown };
      email = body?.email;
      password = body?.password;
    } catch (err) {
      console.error('Login: failed to parse JSON body', err);
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // 2) Lookup user
    let user: any | null = null;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch (err) {
      console.error('Login: database error during findUnique(email)', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    if (!user) {
      // Generic message to avoid user enumeration
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 3) Check password
    const hash: unknown = (user as any)?.passwordHash;
    if (typeof hash !== 'string' || hash.length === 0) {
      // If stored hash is invalid/missing, treat as invalid credential instead of throwing
      console.error('Login: user has no passwordHash string');
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    let ok = false;
    try {
      if (hash.startsWith('$2')) {
        // Prefer bcrypt for bcrypt-formatted hashes
        const bcryptMod: any = await import('bcrypt').then((m) => m.default ?? m).catch((e) => {
          console.error('Login: failed to load bcrypt module', e);
          return null;
        });
        if (!bcryptMod) {
          // Environment misconfiguration; log and fail auth without crashing
          console.error('Login: bcrypt not available for bcrypt hash');
          ok = false;
        } else {
          ok = await bcryptMod.compare(password, hash);
        }
      } else {
        // Legacy scrypt hash support
        ok = await verifyPassword(password, hash);
      }
    } catch (err) {
      console.error('Login: password comparison failed', err);
      ok = false;
    }

    if (!ok) {
      // TODO: add brute-force protection (rate limiting, delay, lockout)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 4) Create session and set cookie
    try {
      await createSession(user.id);
    } catch (err) {
      // E.g., missing AUTH_SECRET in production or cookie write failure
      console.error('Login: failed to create session (AUTH_SECRET/cookies)', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // 5) Return public user
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role === 'ADMIN' ? 'admin' : 'user',
      plan: user.plan === 'BUSINESS' ? 'business' : user.plan === 'PRO' ? 'pro' : 'free',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    // Unexpected error boundary: log + controlled 500
    console.error('Login: unexpected error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/*
Fix summary:
- Previously, several steps could throw and bubble as 500 without context:
  - JSON parsing errors, Prisma findUnique failures, missing/invalid passwordHash, bcrypt import/compare issues, and session creation (AUTH_SECRET).
- Now each step has targeted try/catch with console.error messages and controlled responses:
  - Parse errors → 400 Invalid JSON body (logged)
  - DB failures → 500 with log
  - Missing user or bad password/hash → 401 generic (no throws)
  - bcrypt missing/miscompare → 401, with a log when bcrypt is unavailable
  - Session creation failures (e.g., AUTH_SECRET) → 500 with log
*/
