'use client';

import { useEffect, useMemo, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import type { SearchEntry } from '@/lib/adapter';

const TYPE_LABEL: Record<SearchEntry['type'], string> = {
  cocktail: 'Cocktail',
  spirit: 'Spirit',
  tool: 'Tool',
};

export function CommandPalette({ index: initialIndex = [] }: { index?: SearchEntry[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<SearchEntry[]>(initialIndex);
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Refresh from the live API (includes anything added via the dashboard)
  // the first time the palette is opened, so search always reflects reality.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    Promise.all([
      fetch('/api/cocktails').then((r) => r.json()),
      fetch('/api/spirits').then((r) => r.json()),
      fetch('/api/tools').then((r) => r.json()),
    ])
      .then(([c, s, t]) => {
        if (cancelled) return;
        const next: SearchEntry[] = [
          ...c.cocktails.map((x: { slug: string; name: string; tagline: string }) => ({
            slug: x.slug,
            name: x.name,
            tagline: x.tagline,
            type: 'cocktail' as const,
            href: `/cocktails/${x.slug}`,
          })),
          ...s.spirits.map((x: { slug: string; name: string; tagline: string }) => ({
            slug: x.slug,
            name: x.name,
            tagline: x.tagline,
            type: 'spirit' as const,
            href: `/spirits/${x.slug}`,
          })),
          ...t.tools.map((x: { slug: string; name: string; tagline: string }) => ({
            slug: x.slug,
            name: x.name,
            tagline: x.tagline,
            type: 'tool' as const,
            href: `/tools/${x.slug}`,
          })),
        ];
        setIndex(next);
      })
      .catch(() => {
        /* keep whatever index we already had */
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const grouped = useMemo(() => {
    const groups: Record<SearchEntry['type'], SearchEntry[]> = {
      cocktail: [],
      spirit: [],
      tool: [],
    };
    index.forEach((entry) => groups[entry.type].push(entry));
    return groups;
  }, [index]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-start justify-center bg-void/80 backdrop-blur-sm pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <Command
        className="w-full max-w-xl overflow-hidden rounded-sm border border-champagne/20 bg-obsidian shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        shouldFilter
      >
        <div className="flex items-center border-b border-champagne/10 px-4">
          <span className="font-mono text-xs text-champagne mr-3">⌘K</span>
          <Command.Input
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Search cocktails, spirits, tools…"
            className="w-full bg-transparent py-4 text-bone placeholder:text-bone/30 outline-none font-body"
          />
        </div>
        <Command.List className="max-h-[50vh] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-bone/40">
            No pour matches that search.
          </Command.Empty>

          {(Object.keys(grouped) as SearchEntry['type'][]).map((type) =>
            grouped[type].length > 0 ? (
              <Command.Group
                key={type}
                heading={TYPE_LABEL[type]}
                className="[&_[cmdk-group-heading]]:section-eyebrow [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2"
              >
                {grouped[type].map((entry) => (
                  <Command.Item
                    key={entry.href}
                    value={`${entry.name} ${entry.tagline}`}
                    onSelect={() => {
                      router.push(entry.href);
                      setOpen(false);
                      setQuery('');
                    }}
                    className="flex cursor-pointer flex-col rounded-sm px-3 py-2 aria-selected:bg-ruby/20"
                  >
                    <span className="font-display text-bone">{entry.name}</span>
                    <span className="text-xs text-bone/50">{entry.tagline}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null
          )}
        </Command.List>
      </Command>
    </div>
  );
}
