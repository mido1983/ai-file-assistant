'use client';

import { useEffect, useState } from 'react';
import type { FileRecord } from '@/types/file';
import { apiAnalyzeFile, apiListFiles, apiUploadFileMetadata } from '@/lib/api';
import FileUpload from './FileUpload';
import { useAuth } from '@/contexts/AuthContext';
import { canUploadMoreFiles } from '@/lib/guards';

export default function DashboardFiles() {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<Set<string>>(new Set());
  // Mock: pretend user uploaded N files this month
  const [filesUploadedThisMonth] = useState<number>(42);

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

  async function onUpload(selected: File[]) {
    await Promise.all(
      selected.map((f) =>
        apiUploadFileMetadata({
          originalName: f.name,
          size: f.size,
          mimeType: f.type || 'application/octet-stream',
        })
      )
    );
    await load();
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
      <h1 className="text-2xl font-semibold text-zinc-900">Files</h1>
      <FileUpload
        onUpload={onUpload}
        canUpload={user ? canUploadMoreFiles(user, filesUploadedThisMonth) : false}
        disabledNote={!user || canUploadMoreFiles(user!, filesUploadedThisMonth)
          ? undefined
          : 'Upload limit reached for your plan. Consider upgrading.'}
      />

      {loading ? (
        <p className="text-sm text-zinc-600">Loading files…</p>
      ) : files.length === 0 ? (
        <p className="text-sm text-zinc-700">No files yet. Upload some to get started.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-600">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Size</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Summary</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.id} className="border-b border-zinc-100">
                  <td className="py-2 pr-4 text-zinc-900">{f.originalName}</td>
                  <td className="py-2 pr-4 text-zinc-700">{formatBytes(f.size)}</td>
                  <td className="py-2 pr-4 text-zinc-700">{f.status}</td>
                  <td className="py-2 pr-4 text-zinc-700">{f.category ?? '-'}</td>
                  <td className="py-2 pr-4 text-zinc-700">
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-700">{f.summary ?? '-'}</span>
                      {f.status !== 'ready' && (
                        <button
                          type="button"
                          onClick={() => onAnalyze(f.id)}
                          disabled={analyzing.has(f.id)}
                          className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-800 hover:bg-zinc-100 disabled:opacity-60"
                        >
                          {analyzing.has(f.id) ? 'Analyzing…' : 'Analyze'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
