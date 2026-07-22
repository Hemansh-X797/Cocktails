'use client';

import { useCallback, useEffect, useState } from 'react';

export interface MediaAsset {
  id: string;
  kind: 'upload' | 'link';
  name: string;
  /** For uploads: a persisted Blob. For links: unused. */
  blob?: Blob;
  /** For links: the public URL. For uploads: an object URL created at read time. */
  url?: string;
  mimeType?: string;
  sizeBytes: number;
  category: 'cocktail' | 'spirit' | 'tool' | 'uncategorized';
  createdAt: number;
}

const DB_NAME = 'mycocktailguide-library';
const STORE_NAME = 'assets';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Real, working local persistence for the dashboard's media library.
 * Uploaded files are stored as Blobs in IndexedDB (survives reloads,
 * works fully offline, and works identically inside a Tauri/Electron/
 * Capacitor shell since it's just browser storage — no server required).
 * Pasted public links are stored as plain URL records alongside uploads.
 */
export function useMediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    const result: MediaAsset[] = await new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result as MediaAsset[]);
      req.onerror = () => reject(req.error);
    });
    result.sort((a, b) => b.createdAt - a.createdAt);
    setAssets(result);
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addUpload = useCallback(
    async (file: File, category: MediaAsset['category'] = 'uncategorized') => {
      const db = await openDb();
      const asset: MediaAsset = {
        id: crypto.randomUUID(),
        kind: 'upload',
        name: file.name,
        blob: file,
        mimeType: file.type,
        sizeBytes: file.size,
        category,
        createdAt: Date.now(),
      };
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(asset);
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      await refresh();
      return asset;
    },
    [refresh]
  );

  const addLink = useCallback(
    async (url: string, category: MediaAsset['category'] = 'uncategorized') => {
      let hostname = url;
      try {
        hostname = new URL(url).hostname;
      } catch {
        /* keep raw string if URL parsing fails */
      }
      const db = await openDb();
      const asset: MediaAsset = {
        id: crypto.randomUUID(),
        kind: 'link',
        name: hostname,
        url,
        sizeBytes: 0,
        category,
        createdAt: Date.now(),
      };
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(asset);
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      await refresh();
      return asset;
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      const db = await openDb();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      await refresh();
    },
    [refresh]
  );

  /** Resolves a displayable URL for any asset (object URL for uploads, raw URL for links). */
  const resolveUrl = useCallback((asset: MediaAsset): string => {
    if (asset.kind === 'link' && asset.url) return asset.url;
    if (asset.blob) return URL.createObjectURL(asset.blob);
    return '';
  }, []);

  return { assets, ready, addUpload, addLink, remove, resolveUrl, refresh };
}
