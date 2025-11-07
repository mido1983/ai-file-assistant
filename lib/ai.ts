// lib/ai.ts
// Lightweight OpenAI helper for the Next.js backend.
// TODO: Set OPENAI_API_KEY in Vercel Project Settings to enable real AI calls.

export interface AiAnalysisResult {
  category: string;
  summary: string;
  tags: string[];
}

export interface AiFolderReport {
  title: string;
  text: string; // plain text or markdown
}

export interface AiRuleDefinition {
  rawPrompt: string;
  filter: Record<string, unknown>;
  action: Record<string, unknown>;
}

export interface AiSemanticHit {
  fileId: string;
  score: number;
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

async function chatJson(system: string, user: string): Promise<any | null> {
  if (!OPENAI_API_KEY) return null;
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    // Fall back to mock behavior on failure
    return null;
  }
  const data = (await res.json()) as any;
  const content = data?.choices?.[0]?.message?.content ?? '';
  const json = safelyParseJson(content);
  return json;
}

function safelyParseJson(text: string): any | null {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\n([\s\S]*?)\n```/i);
  const raw = fenced ? fenced[1] : trimmed;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Heuristic fallbacks when OPENAI_API_KEY is not set.
function heuristicAnalysis(text: string): AiAnalysisResult {
  const t = text.toLowerCase();
  let category = 'document';
  if (t.includes('invoice') || t.includes('total') || t.includes('vat')) category = 'invoice';
  else if (t.includes('recipe') || t.includes('ingredients')) category = 'recipe';
  else if (t.includes('contract') || t.includes('agreement')) category = 'contract';
  else if (t.includes('id ') || t.includes('passport') || t.includes('license')) category = 'id';

  const tags = Array.from(
    new Set(
      [category, ...(t.includes('duplicate') ? ['duplicate'] : []), ...(t.includes('tax') ? ['tax'] : [])].filter(Boolean),
    ),
  );
  const summary = `Auto summary: a ${category} extracted from provided text.`;
  return { category, summary, tags };
}

export async function analyzeDocumentText(text: string): Promise<AiAnalysisResult> {
  const sys = 'You are an assistant that extracts structured JSON. Respond ONLY with JSON matching the schema {"category": string, "summary": string, "tags": string[] }.';
  const usr = `Analyze the following document content and return category, a brief 1-2 sentence summary, and 3-6 tags.\n\nCONTENT:\n${text}`;
  const json = await chatJson(sys, usr);
  if (json && typeof json === 'object' && json.category && json.summary && Array.isArray(json.tags)) {
    return json as AiAnalysisResult;
  }
  return heuristicAnalysis(text);
}

export async function generateFolderReport(input: Array<{ name: string; category?: string; summary?: string; tags?: string[] }>): Promise<AiFolderReport> {
  const fallback: AiFolderReport = {
    title: 'Folder overview',
    text: `This folder contains ${input.length} items spanning categories like ${Array.from(
      new Set(input.map((i) => i.category).filter(Boolean) as string[]),
    ).join(', ') || 'various types'}.`,
  };

  const sys = 'You produce concise reports in Markdown and respond ONLY with JSON matching {"title": string, "text": string}.';
  const bulletLines = input
    .slice(0, 50)
    .map((i) => `- ${i.name}${i.category ? ` [${i.category}]` : ''}${i.summary ? ` — ${i.summary}` : ''}`)
    .join('\n');
  const usr = `Create a short Markdown report about a folder. Include a descriptive title. Here are sample items (up to 50):\n${bulletLines}`;
  const json = await chatJson(sys, usr);
  if (json && typeof json.title === 'string' && typeof json.text === 'string') return json as AiFolderReport;
  return fallback;
}

export async function parseRulesFromPrompt(rawPrompt: string): Promise<AiRuleDefinition> {
  const sys = 'You convert natural language into machine-readable rule definitions. Respond ONLY with JSON matching {"filter": {}, "action": {}, "rawPrompt": string}.';
  const usr = `Convert this rule idea into a structured filter/action pair. Keep keys generic and values simple.\nPROMPT: ${rawPrompt}`;
  const json = await chatJson(sys, usr);
  if (json && typeof json === 'object' && json.filter && json.action) {
    return { ...(json as Omit<AiRuleDefinition, 'rawPrompt'>), rawPrompt } as AiRuleDefinition;
  }
  // Heuristic fallback
  const lower = rawPrompt.toLowerCase();
  const filter: Record<string, unknown> = {};
  const action: Record<string, unknown> = {};
  if (lower.includes('invoice')) filter.category = 'invoice';
  if (lower.includes('recipe')) filter.category = 'recipe';
  if (lower.includes('contract')) filter.category = 'contract';
  if (lower.includes('tag')) action.addTag = (rawPrompt.match(/tag\s+"?([\w-\s]+)"?/i)?.[1] ?? 'auto');
  if (lower.includes('move')) action.destination = 'Smart/Auto';
  return { rawPrompt, filter, action };
}

// Semantic search (stub): compute a naive score by keyword overlap
export async function semanticSearch(
  query: string,
  corpus: Array<{ fileId: string; text: string }>,
): Promise<AiSemanticHit[]> {
  // If we wanted real embeddings, we'd call OpenAI embeddings API here.
  // For now, return a simple keyword-overlap score.
  const qTokens = new Set(query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  const hits = corpus.map(({ fileId, text }) => {
    const tTokens = new Set(text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
    let overlap = 0;
    qTokens.forEach((tok) => {
      if (tTokens.has(tok)) overlap += 1;
    });
    return { fileId, score: overlap } as AiSemanticHit;
  });
  return hits
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

