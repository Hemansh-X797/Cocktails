import 'server-only';
import { put, list } from '@vercel/blob';

/**
 * Single-file JSON "database" living in your Vercel Blob store.
 *
 * Why not Redis/KV: Upstash's free tier is one database per account,
 * which is annoying the moment you have more than one project, and it's
 * a second storage system to configure and monitor. You already have
 * Blob attached for images — this reuses it for everything, so there's
 * exactly one piece of storage infrastructure for the whole app.
 *
 * Mechanism: one blob at a fixed path (`content-store.json`) holds all
 * dashboard-added content as a single JSON object keyed by content type.
 * Reads fetch and parse it; writes overwrite it whole. For a personal,
 * low-write dashboard this is simpler and just as reliable as a KV store
 * — the only tradeoff is last-write-wins on truly simultaneous writes,
 * which will not happen in practice for one person adding drinks.
 */

const STORE_PATHNAME = 'content-store.json';

let cachedUrl: string | null = null;

async function resolveBlobUrl(): Promise<string | null> {
  if (cachedUrl) return cachedUrl;
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  const { blobs } = await list({ prefix: STORE_PATHNAME, limit: 1 });
  const match = blobs.find((b) => b.pathname === STORE_PATHNAME);
  cachedUrl = match?.url ?? null;
  return cachedUrl;
}

async function readStore(): Promise<Record<string, unknown>> {
  const url = await resolveBlobUrl();
  if (!url) return {};
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

async function writeStore(data: Record<string, unknown>): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[mycocktailguide] No Blob store attached — dashboard changes will not persist. ' +
          'Attach one in Vercel: Storage -> Create Database -> Blob.'
      );
    }
    return;
  }
  const blob = await put(STORE_PATHNAME, JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
  cachedUrl = blob.url;
}

/** Same get/set/del shape the rest of the app already expects. */
export const kv = {
  async get<T>(key: string): Promise<T | null> {
    const store = await readStore();
    return (key in store ? (store[key] as T) : null);
  },
  async set(key: string, value: unknown): Promise<void> {
    const store = await readStore();
    store[key] = value;
    await writeStore(store);
  },
  async del(key: string): Promise<void> {
    const store = await readStore();
    delete store[key];
    await writeStore(store);
  },
};
