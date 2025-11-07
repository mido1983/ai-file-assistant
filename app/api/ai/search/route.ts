import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { pythonSemanticSearch } from '@/lib/pythonService';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// POST /api/ai/search
// Business intent: Semantic search across user's files.
// Currently calls pythonService stub (keyword/placeholder). Later: real vector search in Python backend.
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { query } = (await req.json()) as { query?: string };
    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const hits = await pythonSemanticSearch(user.id, query);
    const ids = hits.map((h) => h.fileId);
    const files = ids.length
      ? await prisma.file.findMany({ where: { userId: user.id, id: { in: ids } } })
      : [];
    const map = new Map(files.map((f) => [f.id, f]));

    const results = hits.map((h) => {
      const f = map.get(h.fileId);
      return {
        score: h.score,
        file: f
          ? {
              id: f.id,
              userId: f.userId,
              originalName: f.originalName,
              mimeType: f.mimeType,
              size: f.size,
              uploadedAt: f.createdAt.toISOString(),
              status: f.status.toLowerCase(),
              category: f.category ?? undefined,
              summary: f.summary ?? undefined,
              tags: f.tagsJson ? (safeParseJson<string[]>(f.tagsJson) ?? undefined) : undefined,
            }
          : null,
      };
    });

    // TODO: replace stub with real vector search; add pagination/sorting; ensure multi-tenant data isolation.
    return NextResponse.json({ query, results });
  } catch (err: any) {
    const status = err?.status ?? 500;
    return NextResponse.json({ error: status === 401 ? 'unauthorized' : 'search failed' }, { status });
  }
}

function safeParseJson<T>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

