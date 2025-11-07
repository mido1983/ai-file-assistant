// NOTE: This endpoint currently calls pythonService (which delegates to a lightweight OpenAI helper).
// Later it will make an HTTP request to a real Python FastAPI backend.
import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { findUserFile, updateFileAnalysis } from '@/lib/files/server';
import { pythonAnalyzeFileText } from '@/lib/pythonService';

export const runtime = 'nodejs';

// POST /api/files/analyze
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { fileId } = (await req.json()) as { fileId?: string };
    if (!fileId) return NextResponse.json({ error: 'fileId required' }, { status: 400 });

    const file = await findUserFile(user.id, fileId);
    if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 });
    if (!file.text) return NextResponse.json({ error: 'No text extracted for this file' }, { status: 400 });

    // TODO: add plan-based AI limit checks (AiUsage); compute period like YYYY-MM
    // TODO: better error handling and logging; consider a service layer for orchestration
    const analysis = await pythonAnalyzeFileText(file.id, file.text);
    const updated = await updateFileAnalysis(user.id, file.id, {
      category: analysis.category,
      summary: analysis.summary,
      tags: analysis.tags,
    });

    // TODO: optionally upsert AiUsage and increment counters

    return NextResponse.json(updated);
  } catch (err: any) {
    const status = err?.status ?? 500;
    return NextResponse.json(
      { error: status === 401 ? 'unauthorized' : 'failed to analyze file' },
      { status },
    );
  }
}
