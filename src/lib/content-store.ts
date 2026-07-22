import 'server-only';
import { kv } from '@/lib/kv';
import { getCocktails, getSpirits, getTools, type Cocktail, type Spirit, type Tool } from '@/lib/adapter';
import { slugify } from '@/lib/utils';

const COCKTAILS_KEY = 'content:cocktails:added';
const SPIRITS_KEY = 'content:spirits:added';
const TOOLS_KEY = 'content:tools:added';

async function getAdded<T>(key: string): Promise<T[]> {
  return (await kv.get<T[]>(key)) ?? [];
}

function ensureUniqueSlug(base: string, existingSlugs: string[]): string {
  let slug = slugify(base);
  let counter = 2;
  while (existingSlugs.includes(slug)) {
    slug = `${slugify(base)}-${counter}`;
    counter += 1;
  }
  return slug;
}

/** All cocktails: the original curated set plus anything added via the dashboard. */
export async function getAllCocktails(): Promise<Cocktail[]> {
  const added = await getAdded<Cocktail>(COCKTAILS_KEY);
  return [...added, ...getCocktails()];
}

export async function addCocktail(input: Omit<Cocktail, 'slug'> & { slug?: string }): Promise<Cocktail> {
  const added = await getAdded<Cocktail>(COCKTAILS_KEY);
  const existingSlugs = [...added.map((c) => c.slug), ...getCocktails().map((c) => c.slug)];
  const slug = ensureUniqueSlug(input.slug || input.name, existingSlugs);
  const record: Cocktail = { ...input, slug };
  await kv.set(COCKTAILS_KEY, [record, ...added]);
  return record;
}

export async function deleteCocktail(slug: string): Promise<boolean> {
  const added = await getAdded<Cocktail>(COCKTAILS_KEY);
  const next = added.filter((c) => c.slug !== slug);
  const changed = next.length !== added.length;
  if (changed) await kv.set(COCKTAILS_KEY, next);
  return changed;
}

export async function getAllSpirits(): Promise<Spirit[]> {
  const added = await getAdded<Spirit>(SPIRITS_KEY);
  return [...added, ...getSpirits()];
}

export async function addSpirit(input: Omit<Spirit, 'slug'> & { slug?: string }): Promise<Spirit> {
  const added = await getAdded<Spirit>(SPIRITS_KEY);
  const existingSlugs = [...added.map((s) => s.slug), ...getSpirits().map((s) => s.slug)];
  const slug = ensureUniqueSlug(input.slug || input.name, existingSlugs);
  const record: Spirit = { ...input, slug };
  await kv.set(SPIRITS_KEY, [record, ...added]);
  return record;
}

export async function deleteSpirit(slug: string): Promise<boolean> {
  const added = await getAdded<Spirit>(SPIRITS_KEY);
  const next = added.filter((s) => s.slug !== slug);
  const changed = next.length !== added.length;
  if (changed) await kv.set(SPIRITS_KEY, next);
  return changed;
}

export async function getAllTools(): Promise<Tool[]> {
  const added = await getAdded<Tool>(TOOLS_KEY);
  return [...added, ...getTools()];
}

export async function addTool(input: Omit<Tool, 'slug'> & { slug?: string }): Promise<Tool> {
  const added = await getAdded<Tool>(TOOLS_KEY);
  const existingSlugs = [...added.map((t) => t.slug), ...getTools().map((t) => t.slug)];
  const slug = ensureUniqueSlug(input.slug || input.name, existingSlugs);
  const record: Tool = { ...input, slug };
  await kv.set(TOOLS_KEY, [record, ...added]);
  return record;
}

export async function deleteTool(slug: string): Promise<boolean> {
  const added = await getAdded<Tool>(TOOLS_KEY);
  const next = added.filter((t) => t.slug !== slug);
  const changed = next.length !== added.length;
  if (changed) await kv.set(TOOLS_KEY, next);
  return changed;
}
