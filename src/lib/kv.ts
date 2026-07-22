import 'server-only';

/**
 * Thin storage wrapper. On Vercel, attach a Redis store (Storage tab ->
 * Marketplace -> Upstash Redis) and it injects KV_REST_API_URL /
 * KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN,
 * depending on integration version) automatically.
 *
 * Locally, or before a store is attached, falls back to an in-memory Map
 * so `npm run dev` and preview builds never crash — content just won't
 * persist across server restarts until a real store is linked.
 */

type KvLike = {
  get: <T>(key: string) => Promise<T | null>;
  set: (key: string, value: unknown) => Promise<unknown>;
  del: (key: string) => Promise<unknown>;
};

const memoryStore = new Map<string, unknown>();

const memoryKv: KvLike = {
  async get<T>(key: string) {
    return memoryStore.has(key) ? (memoryStore.get(key) as T) : null;
  },
  async set(key: string, value: unknown) {
    memoryStore.set(key, value);
    return 'OK';
  },
  async del(key: string) {
    return memoryStore.delete(key);
  },
};

const restUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const restToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

let kvClient: KvLike = memoryKv;

if (restUrl && restToken) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Redis } = require('@upstash/redis');
  const redis = new Redis({ url: restUrl, token: restToken });
  kvClient = {
    get: (key) => redis.get(key),
    set: (key, value) => redis.set(key, value),
    del: (key) => redis.del(key),
  };
} else if (process.env.NODE_ENV !== 'production') {
  console.warn(
    '[mycocktailguide] No Redis store attached — using in-memory storage. ' +
      'Dashboard-added content will reset on server restart until you attach a Redis store in the Vercel dashboard (Storage -> Marketplace -> Upstash Redis).'
  );
}

export const kv = kvClient;
