import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET /api/health — simple readiness check for DB and runtime
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: 'ok' });
  } catch (e) {
    return NextResponse.json({ ok: false, db: 'error' }, { status: 500 });
  }
}

