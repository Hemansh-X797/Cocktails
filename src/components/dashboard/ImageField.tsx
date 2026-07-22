'use client';

import { useState } from 'react';

export function ImageField({
  value,
  onChange,
  label = 'Image',
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [mode, setMode] = useState<'link' | 'upload'>('link');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file: File) {
    setBusy(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }

  async function handleLinkBlur(url: string) {
    if (!url) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid link.');
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid link.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="section-eyebrow block mb-2">{label}</label>
      <div className="mb-2 flex gap-2">
        <button
          type="button"
          onClick={() => setMode('link')}
          className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1 border ${mode === 'link' ? 'border-champagne text-champagne' : 'border-bone/20 text-bone/40'}`}
        >
          Public link
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1 border ${mode === 'upload' ? 'border-champagne text-champagne' : 'border-bone/20 text-bone/40'}`}
        >
          Upload file
        </button>
      </div>

      {mode === 'link' ? (
        <input
          type="url"
          placeholder="https://…"
          defaultValue={value}
          onBlur={(e) => handleLinkBlur(e.target.value)}
          className="w-full border-b border-champagne/20 bg-transparent py-2 text-sm text-bone outline-none focus:border-champagne"
        />
      ) : (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="w-full text-sm text-bone/70 file:mr-3 file:border file:border-champagne/30 file:bg-transparent file:px-3 file:py-1 file:text-xs file:text-champagne"
        />
      )}

      {busy && <p className="mt-2 font-mono text-[10px] text-bone/40">Processing…</p>}
      {error && <p className="mt-2 text-xs text-crimson">{error}</p>}
      {value && !busy && (
        <div className="mt-3 h-24 w-24 overflow-hidden rounded-sm border border-champagne/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
        </div>
      )}
    </div>
  );
}
