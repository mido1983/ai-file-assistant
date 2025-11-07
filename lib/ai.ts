// lib/ai.ts
// Light AI helpers using OpenAI directly from the Next.js backend.
// TODO: move heavier logic to the separate Python service when it is ready.
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

// Small internal helper — minimal chat completion returning raw string
export async function callOpenAi(prompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set. TODO: configure it on Vercel.');
  }
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`OpenAI error ${res.status}: ${msg}`);
  }
  const data = (await res.json()) as any;
  return data?.choices?.[0]?.message?.content ?? '';
}

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
  // TODO: truncate or chunk very long inputs; consider summary-first pass to reduce tokens
  // TODO: improve prompt with examples; validate JSON strictly with zod in production
  const sys = 'You are an assistant that extracts structured JSON. Respond ONLY with JSON matching the schema {"category": string, "summary": string, "tags": string[] }.';
  const usr = `Analyze the following document content and return category, a brief 1-2 sentence summary, and 3-6 tags.\n\nCONTENT:\n${text}`;
  const json = await chatJson(sys, usr);
  if (json && typeof json === 'object' && json.category && json.summary && Array.isArray(json.tags)) {
    return json as AiAnalysisResult;
  }
  return heuristicAnalysis(text);
}

export async function generateFolderReport(stats: unknown): Promise<AiFolderReport> {
  // TODO: define a stable Stats shape; include top categories, counts, size, examples
  // TODO: strict JSON parsing + fallback to deterministic local summary if parsing fails
  const sys = 'You produce concise reports in Markdown and respond ONLY with JSON matching {"title": string, "text": string}.';
  const usr = `Create a short, friendly report about a folder based on this stats JSON. Include a descriptive title and a 1-2 paragraph body.\nSTATS:\n${JSON.stringify(stats, null, 2)}`;
  const json = await chatJson(sys, usr);
  if (json && typeof json.title === 'string' && typeof json.text === 'string') {
    return json as AiFolderReport;
  }
  return {
    title: 'Folder overview',
    text: 'A quick snapshot of your documents based on the provided stats. (AI offline or JSON parse failed — using fallback.)',
  };
}

export async function parseRulesFromPrompt(rawPrompt: string): Promise<AiRuleDefinition> {
  // TODO: enrich prompt with few-shot examples; validate keys; map to internal DSL later
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

// Compatibility wrapper matching alternate naming in design notes
export async function rulesFromText(promptText: string): Promise<AiRuleDefinition> {
  return parseRulesFromPrompt(promptText);
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

// Simple stub variant to clarify API contract in early integrations
export async function semanticSearchStub(query: string): Promise<AiSemanticHit[]> {
  return [
    { fileId: 'mock-file-1', score: 0.92 },
    { fileId: 'mock-file-2', score: 0.88 },
  ];
}
