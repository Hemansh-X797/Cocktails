'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { safeFetchJson } from '@/lib/safeFetchJson';

type ImageStatus = 'idle' | 'checking' | 'ok' | 'broken' | 'uploading' | 'error';

/**
 * Two independent paths, each with its own honest status instead of one
 * shared "Processing…" that can mean three different things:
 *
 *  - Public link: committed to the parent form the instant it's typed —
 *    no server round-trip, because a URL doesn't need one. A quiet,
 *    debounced client-side check just confirms the image actually loads,
 *    and never blocks Save either way (a slow-to-load image still
 *    resolves once you save; a genuinely broken link is flagged so you
 *    know before you save, not after).
 *  - Upload file: goes to /api/upload, with a real determinate progress
 *    bar (via XHR, since fetch can't report upload progress) and a
 *    guaranteed way out of "uploading" via a timeout — it can fail, but
 *    it can never hang forever.
 */
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
  const [linkDraft, setLinkDraft] = useState(value);
  const [status, setStatus] = useState<ImageStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const checkTimer = useRef<ReturnType<typeof setTimeout>>();
  const checkImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => setLinkDraft(value), [value]);

  const checkImageLoads = useCallback((url: string) => {
    if (checkImgRef.current) {
      checkImgRef.current.onload = null;
      checkImgRef.current.onerror = null;
    }
    if (!url) {
      setStatus('idle');
      return;
    }
    setStatus('checking');
    const img = new Image();
    checkImgRef.current = img;
    img.onload = () => setStatus((s) => (s === 'checking' ? 'ok' : s));
    img.onerror = () => setStatus((s) => (s === 'checking' ? 'broken' : s));
    img.src = url;
  }, []);

  function handleLinkChange(raw: string) {
    const url = raw.trim();
    setLinkDraft(raw);
    setError('');
    onChange(url); // committed immediately — a link never needs a server trip to be valid

    if (checkTimer.current) clearTimeout(checkTimer.current);
    checkTimer.current = setTimeout(() => checkImageLoads(url), 400);
  }

  async function handleFile(file: File) {
    setError('');
    setStatus('uploading');
    setProgress(0);

    if (!file.type.startsWith('image/')) {
      setStatus('error');
      setError('Only image files are accepted.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setStatus('error');
      setError('File exceeds the 8MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // XHR (not fetch) so we get real upload progress, and a hard
    // timeout so this can never sit at "Uploading…" indefinitely.
    const result = await new Promise<{ ok: true; url: string } | { ok: false; error: string }>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');
      xhr.timeout = 30000;
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) resolve({ ok: true, url: data.url });
          else resolve({ ok: false, error: data.error || `Upload failed (${xhr.status}).` });
        } catch {
          resolve({ ok: false, error: 'Upload failed — the server sent an unexpected response.' });
        }
      };
      xhr.onerror = () => resolve({ ok: false, error: 'Network error during upload.' });
      xhr.ontimeout = () => resolve({ ok: false, error: 'Upload timed out. Try a smaller file or check your connection.' });
      xhr.send(formData);
    });

    if (result.ok) {
      setStatus('ok');
      setProgress(100);
      onChange(result.url);
      setLinkDraft(result.url);
    } else {
      setStatus('error');
      setError(result.error);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function clearImage() {
    setLinkDraft('');
    onChange('');
    setStatus('idle');
    setError('');
  }

  const showPreview = value && (status === 'ok' || status === 'checking' || status === 'idle');

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="section-eyebrow">{label}</label>
        {value && (
          <button
            type="button"
            onClick={clearImage}
            data-cursor-hover
            className="font-mono text-[10px] uppercase tracking-wider text-bone/30 hover:text-crimson transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mb-3 flex gap-2">
        {(['link', 'upload'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            data-cursor-hover
            className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1 border transition-colors duration-300 ${
              mode === m ? 'border-champagne text-champagne' : 'border-bone/20 text-bone/40'
            }`}
          >
            {m === 'link' ? 'Public link' : 'Upload file'}
          </button>
        ))}
      </div>

      {mode === 'link' ? (
        <div className="relative">
          <input
            type="url"
            placeholder="https://…"
            value={linkDraft}
            onChange={(e) => handleLinkChange(e.target.value)}
            className="w-full border-b border-champagne/20 bg-transparent py-2 pr-8 text-sm text-bone outline-none transition-colors duration-300 focus:border-champagne"
          />
          <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2">
            {status === 'checking' && (
              <span className="block h-2 w-2 animate-pulse rounded-full bg-champagne/50" />
            )}
            {status === 'ok' && <span className="block h-2 w-2 rounded-full bg-champagne" />}
            {status === 'broken' && <span className="block h-2 w-2 rounded-full bg-crimson" />}
          </span>
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex h-24 cursor-pointer flex-col items-center justify-center border border-dashed text-center transition-colors duration-300 ${
            dragOver ? 'border-champagne bg-champagne/5' : 'border-champagne/25'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
          <span className="font-mono text-[10px] uppercase tracking-wider text-bone/50">
            Drop an image, or click to browse
          </span>
          <span className="mt-1 font-mono text-[9px] text-bone/25">Up to 8MB</span>
        </label>
      )}

      {status === 'uploading' && (
        <div className="mt-3">
          <div className="h-px w-full overflow-hidden bg-obsidian">
            <div
              className="h-full bg-champagne transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1.5 font-mono text-[10px] text-bone/40">Uploading… {progress}%</p>
        </div>
      )}

      {status === 'broken' && (
        <p className="mt-2 text-xs text-crimson/80">
          This link didn't return an image — double-check it's a direct file URL (ending in .jpg, .png,
          .webp…), not a page that merely shows one. Saving is still allowed if you're confident it's correct.
        </p>
      )}

      {error && <p className="mt-2 text-xs text-crimson">{error}</p>}

      {showPreview && (
        <div className="mt-3 h-24 w-24 overflow-hidden rounded-sm border border-champagne/20 bg-obsidian">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="h-full w-full object-cover"
            onError={() => setStatus('broken')}
          />
        </div>
      )}
    </div>
  );
}
