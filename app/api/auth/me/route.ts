import { NextResponse } from 'next/server';

export async function GET() {
  // For now, simulate unauthenticated
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

