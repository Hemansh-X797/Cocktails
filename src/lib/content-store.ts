import 'server-only';
import { kv } from '@/lib/store';
import { getCocktails, getSpirits, getTools, type Cocktail, type Spirit, type Tool } from '@/lib/adapter';
import { slugify } from '@/lib/utils';

const COCKTAILS_KEY = 'content:cocktails:added';
const SPIRITS_KEY = 'content:spirits:added';
const TOOLS_KEY = 'content:tools:added';

// Overrides let you edit the original curated drinks/spirits/tools too —
// keyed by slug, a partial patch merged onto the curated record at read time.
const COCKTAILS_OVERRIDES_KEY = 'content:cocktails:overrides';
const SPIRITS_OVERRIDES_KEY = 'content:spirits:overrides';
const TOOLS_OVERRIDES_KEY = 'content:tools:overrides';

async function getAdded<T>(key: string): Promise<T[]> {
  return (await kv.get<T[]>(key)) ?? [];
}

async function getOverrides<T>(key: string): Promise<Record<string, Partial<T>>> {
  return (await kv.get<Record<string, Partial<T>>>(key)) ?? {};
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

function applyOverrides<T extends { slug: string }>(
  items: T[],
  overrides: Record<string, Partial<T>>
): T[] {
  return items.map((item) => (overrides[item.slug] ? { ...item, ...overrides[item.slug] } : item));
}

// ---------- Cocktails ----------

export async function getAllCocktails(): Promise<Cocktail[]> {
  const [added, overrides] = await Promise.all([
    getAdded<Cocktail>(COCKTAILS_KEY),
    getOverrides<Cocktail>(COCKTAILS_OVERRIDES_KEY),
  ]);
  const curated = applyOverrides(getCocktails(), overrides);
  const addedWithOverrides = applyOverrides(added, overrides);
  return [...addedWithOverrides, ...curated];
}

export async function addCocktail(input: Omit<Cocktail, 'slug'> & { slug?: string }): Promise<Cocktail> {
  const added = await getAdded<Cocktail>(COCKTAILS_KEY);
  const existingSlugs = [...added.map((c) => c.slug), ...getCocktails().map((c) => c.slug)];
  const slug = ensureUniqueSlug(input.slug || input.name, existingSlugs);
  const record: Cocktail = { ...input, slug };
  await kv.set(COCKTAILS_KEY, [record, ...added]);
  return record;
}

/** Edits any cocktail — dashboard-added ones are updated in place, curated ones get an override patch. */
export async function editCocktail(slug: string, updates: Partial<Cocktail>): Promise<Cocktail | null> {
  const added = await getAdded<Cocktail>(COCKTAILS_KEY);
  const addedIndex = added.findIndex((c) => c.slug === slug);

  if (addedIndex !== -1) {
    const updated = { ...added[addedIndex], ...updates, slug };
    const next = [...added];
    next[addedIndex] = updated;
    await kv.set(COCKTAILS_KEY, next);
    return updated;
  }

  const curated = getCocktails().find((c) => c.slug === slug);
  if (!curated) return null;

  const overrides = await getOverrides<Cocktail>(COCKTAILS_OVERRIDES_KEY);
  overrides[slug] = { ...overrides[slug], ...updates };
  await kv.set(COCKTAILS_OVERRIDES_KEY, overrides);
  return { ...curated, ...overrides[slug], slug };
}

export async function deleteCocktail(slug: string): Promise<boolean> {
  const added = await getAdded<Cocktail>(COCKTAILS_KEY);
  const next = added.filter((c) => c.slug !== slug);
  const changed = next.length !== added.length;
  if (changed) await kv.set(COCKTAILS_KEY, next);
  return changed;
}

// ---------- Spirits ----------

export async function getAllSpirits(): Promise<Spirit[]> {
  const [added, overrides] = await Promise.all([
    getAdded<Spirit>(SPIRITS_KEY),
    getOverrides<Spirit>(SPIRITS_OVERRIDES_KEY),
  ]);
  const curated = applyOverrides(getSpirits(), overrides);
  const addedWithOverrides = applyOverrides(added, overrides);
  return [...addedWithOverrides, ...curated];
}

export async function addSpirit(input: Omit<Spirit, 'slug'> & { slug?: string }): Promise<Spirit> {
  const added = await getAdded<Spirit>(SPIRITS_KEY);
  const existingSlugs = [...added.map((s) => s.slug), ...getSpirits().map((s) => s.slug)];
  const slug = ensureUniqueSlug(input.slug || input.name, existingSlugs);
  const record: Spirit = { ...input, slug };
  await kv.set(SPIRITS_KEY, [record, ...added]);
  return record;
}

export async function editSpirit(slug: string, updates: Partial<Spirit>): Promise<Spirit | null> {
  const added = await getAdded<Spirit>(SPIRITS_KEY);
  const addedIndex = added.findIndex((s) => s.slug === slug);

  if (addedIndex !== -1) {
    const updated = { ...added[addedIndex], ...updates, slug };
    const next = [...added];
    next[addedIndex] = updated;
    await kv.set(SPIRITS_KEY, next);
    return updated;
  }

  const curated = getSpirits().find((s) => s.slug === slug);
  if (!curated) return null;

  const overrides = await getOverrides<Spirit>(SPIRITS_OVERRIDES_KEY);
  overrides[slug] = { ...overrides[slug], ...updates };
  await kv.set(SPIRITS_OVERRIDES_KEY, overrides);
  return { ...curated, ...overrides[slug], slug };
}

export async function deleteSpirit(slug: string): Promise<boolean> {
  const added = await getAdded<Spirit>(SPIRITS_KEY);
  const next = added.filter((s) => s.slug !== slug);
  const changed = next.length !== added.length;
  if (changed) await kv.set(SPIRITS_KEY, next);
  return changed;
}

// ---------- Tools ----------

export async function getAllTools(): Promise<Tool[]> {
  const [added, overrides] = await Promise.all([
    getAdded<Tool>(TOOLS_KEY),
    getOverrides<Tool>(TOOLS_OVERRIDES_KEY),
  ]);
  const curated = applyOverrides(getTools(), overrides);
  const addedWithOverrides = applyOverrides(added, overrides);
  return [...addedWithOverrides, ...curated];
}

export async function addTool(input: Omit<Tool, 'slug'> & { slug?: string }): Promise<Tool> {
  const added = await getAdded<Tool>(TOOLS_KEY);
  const existingSlugs = [...added.map((t) => t.slug), ...getTools().map((t) => t.slug)];
  const slug = ensureUniqueSlug(input.slug || input.name, existingSlugs);
  const record: Tool = { ...input, slug };
  await kv.set(TOOLS_KEY, [record, ...added]);
  return record;
}

export async function editTool(slug: string, updates: Partial<Tool>): Promise<Tool | null> {
  const added = await getAdded<Tool>(TOOLS_KEY);
  const addedIndex = added.findIndex((t) => t.slug === slug);

  if (addedIndex !== -1) {
    const updated = { ...added[addedIndex], ...updates, slug };
    const next = [...added];
    next[addedIndex] = updated;
    await kv.set(TOOLS_KEY, next);
    return updated;
  }

  const curated = getTools().find((t) => t.slug === slug);
  if (!curated) return null;

  const overrides = await getOverrides<Tool>(TOOLS_OVERRIDES_KEY);
  overrides[slug] = { ...overrides[slug], ...updates };
  await kv.set(TOOLS_OVERRIDES_KEY, overrides);
  return { ...curated, ...overrides[slug], slug };
}

export async function deleteTool(slug: string): Promise<boolean> {
  const added = await getAdded<Tool>(TOOLS_KEY);
  const next = added.filter((t) => t.slug !== slug);
  const changed = next.length !== added.length;
  if (changed) await kv.set(TOOLS_KEY, next);
  return changed;
}
