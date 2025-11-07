// NOTE: This endpoint currently calls pythonService (which delegates to a lightweight OpenAI helper).
// Later it will make an HTTP request to a real Python FastAPI backend.
import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { findUserFile, updateFileAnalysis } from '@/lib/files/server';
import { pythonAnalyzeFileText } from '@/lib/pythonService';
import { PLAN_LIMITS } from '@/types/plan';
import { prisma } from '@/lib/prisma';

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

    // Plan-based check: whether AI analysis is included
    const planKey = user.plan === 'BUSINESS' ? 'business' : user.plan === 'PRO' ? 'pro' : 'free';
    const limits = PLAN_LIMITS[planKey];
    if (!limits.aiAnalysisIncluded) {
      return NextResponse.json({ error: 'AI analysis not included in your plan' }, { status: 403 });
    }

    // TODO: add plan-based AI limit checks (AiUsage); compute period like YYYY-MM
    // TODO: better error handling and logging; consider a service layer for orchestration
    const analysis = await pythonAnalyzeFileText(file.id, file.text);
    const updated = await updateFileAnalysis(user.id, file.id, {
      category: analysis.category,
      summary: analysis.summary,
      tags: analysis.tags,
    });

    // Optionally upsert AiUsage and increment counters.
    // TODO: compute tokens used based on model response size if needed.
    const period = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    await prisma.aiUsage.upsert({
      where: { userId_period: { userId: user.id, period } },
      update: { requests: { increment: 1 } },
      create: { userId: user.id, period, requests: 1, tokens: 0 },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    const status = err?.status ?? 500;
    return NextResponse.json(
      { error: status === 401 ? 'unauthorized' : 'failed to analyze file' },
      { status },
    );
  }
}
