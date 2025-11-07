'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FileRecord } from '@/types/file';
import { apiAnalyzeFile, apiListFiles, apiUploadFileMetadata } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { canUploadMoreFiles } from '@/lib/guards';

export default function DashboardFiles() {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<Set<string>>(new Set());

  // Simple form state for creating a "file" from text.
  const [name, setName] = useState('notes.txt');
  const [mimeType, setMimeType] = useState('text/plain');
  const [text, setText] = useState('');
  const [creating, setCreating] = useState(false);

  // Mock monthly upload count (until we track in DB per plan)
  const [filesUploadedThisMonth] = useState<number>(42);
  const canUpload = useMemo(() => (user ? canUploadMoreFiles(user, filesUploadedThisMonth) : false), [user, filesUploadedThisMonth]);

  async function load() {
    setLoading(true);
    try {
      const list = await apiListFiles();
      setFiles(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!canUpload) {
      setError('Upload limit reached for your plan.');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      // Compute byte size based on current text (placeholder for real files)
      const size = new Blob([text || '']).size;
      // POST to unified /api/files with JSON payload
      const created = await apiUploadFileMetadata({ originalName: name, mimeType, size, text });
      setFiles((prev) => [created, ...prev]);
      setText('');
    } catch (e: any) {
      // TODO: surface more granular errors (413 size limit, 403 monthly cap, etc.)
      setError(e?.message || 'Failed to add file');
    } finally {
      setCreating(false);
    }
  }

  async function onAnalyze(id: string) {
    setAnalyzing((prev) => new Set(prev).add(id));
    try {
      const updated = await apiAnalyzeFile(id);
      setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    } finally {
      setAnalyzing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Files</h1>

      {/* Simple creator: uses text content instead of real binary upload. */}
      <form onSubmit={onCreate} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">
          Create a new item by sending JSON to <code className="font-mono">/api/files</code>.
          {/* TODO: Replace with real multipart upload and server-side text extraction (Python backend). */}
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-slate-600">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="document.txt"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-600">MIME type</label>
            <input
              value={mimeType}
              onChange={(e) => setMimeType(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="text/plain"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={!user || !canUpload || creating}
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {creating ? 'Adding…' : 'Add file'}
            </button>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-600">Text content</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
            placeholder="Paste some text here to simulate extracted content…"
          />
        </div>
        {!canUpload && (
          <p className="text-xs text-amber-700">Upload limit reached for your plan. Consider upgrading.</p>
        )}
      </form>

      {loading ? (
        <p className="text-sm text-slate-600">Loading files…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : files.length === 0 ? (
        <p className="text-sm text-slate-700">No files yet. Add one to get started.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Summary</th>
                <th className="py-2 pr-4">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4 text-slate-900">{f.originalName}</td>
                  <td className="py-2 pr-4 text-slate-700">{f.status}</td>
                  <td className="py-2 pr-4 text-slate-700">{f.category ?? '-'}</td>
                  <td className="py-2 pr-4 text-slate-700">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-700">{f.summary ?? '-'}</span>
                      {f.status !== 'ready' && (
                        <button
                          type="button"
                          onClick={() => onAnalyze(f.id)}
                          disabled={analyzing.has(f.id)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-800 hover:bg-slate-100 disabled:opacity-60"
                        >
                          {analyzing.has(f.id) ? 'Analyzing…' : 'Analyze'}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-2 pr-4 text-slate-700">{new Date(f.uploadedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// TODO: handle large lists (pagination/virtualization), async analysis progress, plan limits UX, toasts.
