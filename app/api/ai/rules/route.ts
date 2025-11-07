import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { pythonGenerateRulesFromText } from '@/lib/pythonService';

export const runtime = 'nodejs';

// POST /api/ai/rules
// Business intent: Convert a natural-language rule prompt into a structured rule definition.
// Currently uses pythonService (OpenAI-based stub). Later will call Python backend and persist rules.
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { prompt } = (await req.json()) as { prompt?: string };
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const rule = await pythonGenerateRulesFromText(user.id, prompt);
    // TODO: persist rule in DB and return its id; apply via a Rules Engine service.
    return NextResponse.json(rule);
  } catch (err: any) {
    const status = err?.status ?? 500;
    return NextResponse.json({ error: status === 401 ? 'unauthorized' : 'failed to generate rule' }, { status });
  }
}

