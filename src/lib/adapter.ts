import cocktailsData from '@/data/cocktails.json';
import spiritsData from '@/data/spirits.json';
import toolsData from '@/data/tools.json';
import passwordsData from '@/data/passwords.json';

export interface Cocktail {
  slug: string;
  name: string;
  tagline: string;
  heroColor: string;
  rimColor: string;
  abv: number;
  servingGlass: string;
  prepTime: string;
  difficulty: string;
  description: string;
  flavorProfile: Record<string, number>;
  ingredients: { name: string; amount: string }[];
  method: string[];
  pairings: string[];
  story: string;
  image: string;
}

export interface Spirit {
  slug: string;
  name: string;
  category: string;
  origin: string;
  abv: number;
  color: string;
  tagline: string;
  description: string;
  tastingNotes: string[];
  bestIn: string[];
  image: string;
}

export interface Tool {
  slug: string;
  name: string;
  category: string;
  material: string;
  tagline: string;
  description: string;
  specs: { label: string; value: string }[];
  image: string;
}

export interface AccessKey {
  id: string;
  label: string;
  hash: string;
  role: 'master' | 'mixologist' | 'guest';
  permissions: string[];
}

/**
 * Data adapter — the single seam between "how content is stored" and
 * "how the UI consumes it." Every function here reads from statically
 * bundled JSON, which means it works identically in:
 *   - Next.js dev/server mode
 *   - `output: 'export'` static builds (Tauri/Electron/Capacitor shells)
 *
 * To move to a real backend later (Postgres, Supabase, etc.), only the
 * function bodies below need to change — every consumer in the app
 * calls through this file, never the JSON directly.
 */

export function getCocktails(): Cocktail[] {
  return cocktailsData as Cocktail[];
}

export function getCocktailBySlug(slug: string): Cocktail | undefined {
  return getCocktails().find((c) => c.slug === slug);
}

export function getSpirits(): Spirit[] {
  return spiritsData as Spirit[];
}

export function getSpiritBySlug(slug: string): Spirit | undefined {
  return getSpirits().find((s) => s.slug === slug);
}

export function getTools(): Tool[] {
  return toolsData as Tool[];
}

export function getToolBySlug(slug: string): Tool | undefined {
  return getTools().find((t) => t.slug === slug);
}

/** Unified search index across all three content types, for the command palette. */
export interface SearchEntry {
  slug: string;
  name: string;
  tagline: string;
  type: 'cocktail' | 'spirit' | 'tool';
  href: string;
}

export function getSearchIndex(): SearchEntry[] {
  return [
    ...getCocktails().map((c) => ({
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      type: 'cocktail' as const,
      href: `/cocktails/${c.slug}`,
    })),
    ...getSpirits().map((s) => ({
      slug: s.slug,
      name: s.name,
      tagline: s.tagline,
      type: 'spirit' as const,
      href: `/spirits/${s.slug}`,
    })),
    ...getTools().map((t) => ({
      slug: t.slug,
      name: t.name,
      tagline: t.tagline,
      type: 'tool' as const,
      href: `/tools/${t.slug}`,
    })),
  ];
}

/** Browser-safe SHA-256 hex digest via Web Crypto (works in static export, no Node deps). */
export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getAccessKeys(): AccessKey[] {
  return passwordsData.keys as AccessKey[];
}

/** Verifies a plaintext password against the stored hash table and returns the matched key, if any. */
export async function verifyPassword(plaintext: string): Promise<AccessKey | null> {
  const hash = await sha256Hex(plaintext);
  const match = getAccessKeys().find((k) => k.hash === hash);
  return match ?? null;
}
