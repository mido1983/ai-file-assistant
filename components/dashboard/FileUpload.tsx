'use client';

import { useState } from 'react';

interface FileUploadProps {
  onUpload(files: File[]): Promise<void> | void;
  canUpload?: boolean;
  disabledNote?: string;
}

export default function FileUpload({ onUpload, canUpload = true, disabledNote }: FileUploadProps) {
  const [selected, setSelected] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    setSelected(list);
  };

  const handleUpload = async () => {
    if (!selected.length) return;
    if (!canUpload) return;
    setUploading(true);
    try {
      await onUpload(selected);
      setSelected([]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-lg border border-dashed border-zinc-300 p-4">
      <div className="flex items-center gap-3">
        <input
          type="file"
          multiple
          onChange={onChange}
          className="block w-full text-sm"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selected.length || uploading || !canUpload}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      {!!selected.length && (
        <p className="mt-2 text-xs text-zinc-600">{selected.length} file(s) selected</p>
      )}
      {!canUpload && disabledNote && (
        <p className="mt-2 text-xs text-amber-700">{disabledNote}</p>
      )}
    </div>
  );
}
