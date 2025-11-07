// lib/pythonService.ts
// Integration layer for the future heavy Python backend (FastAPI on another host).
// Important: once the real Python service is available, update ONLY this file (and types if needed);
// the rest of the Next.js app should keep calling these helpers.
// For now, these functions return mock data or delegate to the lightweight OpenAI helpers in lib/ai.ts.

import {
  analyzeDocumentText,
  generateFolderReport,
  rulesFromText,
  semanticSearchStub,
} from '@/lib/ai';

// Base URL for the Python service.
// TODO: Replace default when deploying the Python service; configure on Vercel as PYTHON_SERVICE_URL.
export const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL ?? 'http://localhost:8000';

// Types mirrored for Python integration. Keep them generic and stable.
export interface PythonAnalysisResult {
  fileId?: string;
  category: string;
  summary: string;
  tags: string[];
}

export interface PythonFolderReport {
  title: string;
  text: string;
}

export interface PythonRuleDefinition {
  rawPrompt: string;
  filter: Record<string, unknown>;
  action: Record<string, unknown>;
}

export interface PythonSemanticHit {
  fileId: string;
  score: number;
}

// Analyze a document's text. Currently uses the lightweight OpenAI helper.
// TODO: Replace with HTTP POST to `${PYTHON_SERVICE_URL}/analyze-file` with body { file_id, text } and parse response.
export async function pythonAnalyzeFileText(fileId: string, text: string): Promise<PythonAnalysisResult> {
  const ai = await analyzeDocumentText(text);
  return {
    fileId,
    category: ai.category,
    summary: ai.summary,
    tags: ai.tags,
  };
}

// Generate a folder report for a user. Currently delegates to the lightweight helper.
// TODO: Replace with POST `${PYTHON_SERVICE_URL}/folder-report` with { user_id, stats }.
export async function pythonGenerateFolderReport(userId: string, stats: unknown): Promise<PythonFolderReport> {
  const report = await generateFolderReport(stats);
  return report;
}

// Convert natural-language rules into a structured definition. Currently delegates to lightweight helper.
// TODO: Replace with POST `${PYTHON_SERVICE_URL}/rules-from-text` and persist the result in the rules table.
export async function pythonGenerateRulesFromText(
  userId: string,
  prompt: string,
): Promise<PythonRuleDefinition> {
  const def = await rulesFromText(prompt);
  return def;
}

// Semantic search across a user's documents. Currently stubbed.
// TODO: Replace with POST `${PYTHON_SERVICE_URL}/semantic-search` backed by embeddings + vector DB (e.g., pgvector/Qdrant).
export async function pythonSemanticSearch(userId: string, query: string): Promise<PythonSemanticHit[]> {
  const hits = await semanticSearchStub(query);
  return hits;
}

