'use client';

// Experimental AI panel for MVP: generates rules from natural language and runs a simple semantic search.
// NOTE: /api/ai/rules and /api/ai/search currently use lib/pythonService.ts (stubs), which delegate to
// lightweight OpenAI helpers. Later these will call the heavy Python backend (embeddings + rules engine).
// TODO: improve UX (spinners, hints, save history), and persist generated rules in DB with a dedicated screen.

import { useState } from 'react';

type RuleDef = { rawPrompt: string; filter: Record<string, unknown>; action: Record<string, unknown> };
type SearchResultItem = {
  score: number;
  file: {
    id: string;
    originalName: string;
    category?: string;
    summary?: string;
  } | null;
};

export default function AiPanel() {
  // Rules from text
  const [prompt, setPrompt] = useState('Put all chicken recipes into /Recipes/Chicken');
  const [rule, setRule] = useState<RuleDef | null>(null);
  const [ruleLoading, setRuleLoading] = useState(false);
  const [ruleError, setRuleError] = useState<string | null>(null);

  // Semantic search
  const [query, setQuery] = useState('pasta recipes without meat');
  const [results, setResults] = useState<SearchResultItem[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  async function onGenerateRule(e: React.FormEvent) {
    e.preventDefault();
    setRuleLoading(true);
    setRuleError(null);
    try {
      const res = await fetch('/api/ai/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(`Failed to generate rule (${res.status})`);
      const json = (await res.json()) as RuleDef;
      setRule(json);
    } catch (e: any) {
      setRuleError(e?.message || 'Rule generation failed');
      setRule(null);
    } finally {
      setRuleLoading(false);
    }
  }

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchLoading(true);
    setSearchError(null);
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const json = (await res.json()) as { query: string; results: SearchResultItem[] };
      setResults(json.results);
    } catch (e: any) {
      setSearchError(e?.message || 'Search failed');
      setResults(null);
    } finally {
      setSearchLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">AI Tools (experimental)</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Rules from text */}
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-900">Rules from text</h3>
          <form onSubmit={onGenerateRule} className="space-y-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Describe a rule in natural language..."
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={ruleLoading}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {ruleLoading ? 'Generating…' : 'Generate rule'}
              </button>
              {/* TODO: persist rule to DB and manage via a dedicated Rules screen */}
            </div>
          </form>
          {ruleError && <p className="text-sm text-red-600">{ruleError}</p>}
          {rule ? (
            <pre className="whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-xs text-slate-800">{JSON.stringify(rule, null, 2)}</pre>
          ) : (
            <p className="text-xs text-slate-600">No rule yet.</p>
          )}
        </div>

        {/* Semantic search */}
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-900">Semantic search</h3>
          <form onSubmit={onSearch} className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Try: pasta recipes without meat"
            />
            <button
              type="submit"
              disabled={searchLoading}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {searchLoading ? 'Searching…' : 'Search'}
            </button>
          </form>
          {searchError && <p className="text-sm text-red-600">{searchError}</p>}
          {results && results.length > 0 ? (
            <ul className="divide-y divide-slate-200 rounded-md border border-slate-200">
              {results.map((r, i) => (
                <li key={i} className="flex items-start justify-between gap-4 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{r.file?.originalName ?? 'Unknown file'}</p>
                    <p className="text-xs text-slate-600">
                      {r.file?.category ?? '—'} — {r.file?.summary ?? 'No summary'}
                    </p>
                  </div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{r.score.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-600">No results.</p>
          )}
          {/* TODO: link to file detail, add pagination/sorting/highlight for matches */}
        </div>
      </div>
    </section>
  );
}

