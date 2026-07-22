'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSession } from '@/hooks/useAuthSession';
import { ImageField } from '@/components/dashboard/ImageField';
import type { Cocktail, Spirit, Tool } from '@/lib/adapter';

type Tab = 'cocktails' | 'spirits' | 'tools';

const emptyCocktail = {
  name: '',
  tagline: '',
  heroColor: '#050505',
  rimColor: '#8b0000',
  abv: 30,
  servingGlass: '',
  prepTime: '',
  difficulty: 'Intermediate',
  description: '',
  story: '',
  image: '',
  ingredientsRaw: '',
  methodRaw: '',
  pairingsRaw: '',
};

const emptySpirit = {
  name: '',
  category: '',
  origin: '',
  abv: 40,
  color: '#121212',
  tagline: '',
  description: '',
  image: '',
  tastingNotesRaw: '',
};

const emptyTool = {
  name: '',
  category: '',
  material: '',
  tagline: '',
  description: '',
  image: '',
  specsRaw: '',
};

export default function DashboardPage() {
  const { session, loading, can, logout, isAuthenticated } = useAuthSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('cocktails');

  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [spirits, setSpirits] = useState<Spirit[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);

  const [cocktailForm, setCocktailForm] = useState(emptyCocktail);
  const [spiritForm, setSpiritForm] = useState(emptySpirit);
  const [toolForm, setToolForm] = useState(emptyTool);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  async function refreshAll() {
    const [c, s, t] = await Promise.all([
      fetch('/api/cocktails').then((r) => r.json()),
      fetch('/api/spirits').then((r) => r.json()),
      fetch('/api/tools').then((r) => r.json()),
    ]);
    setCocktails(c.cocktails);
    setSpirits(s.spirits);
    setTools(t.tools);
  }

  useEffect(() => {
    if (isAuthenticated) refreshAll();
  }, [isAuthenticated]);

  async function submitCocktail(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback('');
    const payload = {
      ...cocktailForm,
      ingredients: cocktailForm.ingredientsRaw
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [name, amount] = line.split('|').map((s) => s.trim());
          return { name, amount: amount || '' };
        }),
      method: cocktailForm.methodRaw.split('\n').filter(Boolean),
      pairings: cocktailForm.pairingsRaw.split(',').map((s) => s.trim()).filter(Boolean),
      flavorProfile: {},
    };
    const res = await fetch('/api/cocktails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setFeedback(`Added "${data.cocktail.name}".`);
      setCocktailForm(emptyCocktail);
      refreshAll();
    } else {
      setFeedback(data.error || 'Failed to add cocktail.');
    }
  }

  async function submitSpirit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback('');
    const payload = {
      ...spiritForm,
      tastingNotes: spiritForm.tastingNotesRaw.split(',').map((s) => s.trim()).filter(Boolean),
      bestIn: [],
    };
    const res = await fetch('/api/spirits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setFeedback(`Added "${data.spirit.name}".`);
      setSpiritForm(emptySpirit);
      refreshAll();
    } else {
      setFeedback(data.error || 'Failed to add spirit.');
    }
  }

  async function submitTool(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback('');
    const payload = {
      ...toolForm,
      specs: toolForm.specsRaw
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [label, value] = line.split('|').map((s) => s.trim());
          return { label, value: value || '' };
        }),
    };
    const res = await fetch('/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setFeedback(`Added "${data.tool.name}".`);
      setToolForm(emptyTool);
      refreshAll();
    } else {
      setFeedback(data.error || 'Failed to add tool.');
    }
  }

  async function handleDelete(kind: Tab, slug: string) {
    if (!confirm('Remove this permanently?')) return;
    await fetch(`/api/${kind}?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' });
    refreshAll();
  }

  if (loading || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-void">
        <p className="font-mono text-xs text-bone/40 uppercase tracking-widest2">Verifying access…</p>
      </main>
    );
  }

  if (!can('upload')) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-void px-8 text-center">
        <div>
          <h1 className="font-display text-3xl text-bone">Guest access</h1>
          <p className="mt-4 text-bone/60">Your key only grants viewing rights. Ask for a Mixologist or Master key to add content.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-void px-8 py-16">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <span className="section-eyebrow">Signed in as {session.role}</span>
          <h1 className="font-display text-4xl text-bone mt-2">The Cellar Desk</h1>
        </div>
        <button
          onClick={() => logout().then(() => router.push('/'))}
          data-cursor-hover
          className="font-mono text-xs uppercase tracking-widest2 text-bone/50 hover:text-crimson"
        >
          Log out
        </button>
      </div>

      <div className="mb-10 flex gap-2 border-b border-champagne/10">
        {(['cocktails', 'spirits', 'tools'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            data-cursor-hover
            className={`px-4 py-3 font-mono text-xs uppercase tracking-widest2 ${
              tab === t ? 'text-champagne border-b-2 border-champagne' : 'text-bone/40'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {feedback && <p className="mb-6 text-sm text-champagne">{feedback}</p>}

      {tab === 'cocktails' && (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <form onSubmit={submitCocktail} className="space-y-4">
            <span className="section-eyebrow">Add a cocktail</span>
            <input required placeholder="Name" value={cocktailForm.name} onChange={(e) => setCocktailForm({ ...cocktailForm, name: e.target.value })} className="w-full border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
            <input placeholder="Tagline" value={cocktailForm.tagline} onChange={(e) => setCocktailForm({ ...cocktailForm, tagline: e.target.value })} className="w-full border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
            <textarea required placeholder="Description" value={cocktailForm.description} onChange={(e) => setCocktailForm({ ...cocktailForm, description: e.target.value })} rows={3} className="w-full border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="ABV %" value={cocktailForm.abv} onChange={(e) => setCocktailForm({ ...cocktailForm, abv: Number(e.target.value) })} className="border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
              <input placeholder="Serving glass" value={cocktailForm.servingGlass} onChange={(e) => setCocktailForm({ ...cocktailForm, servingGlass: e.target.value })} className="border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
            </div>
            <textarea placeholder={'Ingredients — one per line: Name | Amount'} value={cocktailForm.ingredientsRaw} onChange={(e) => setCocktailForm({ ...cocktailForm, ingredientsRaw: e.target.value })} rows={4} className="w-full border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
            <textarea placeholder="Method — one step per line" value={cocktailForm.methodRaw} onChange={(e) => setCocktailForm({ ...cocktailForm, methodRaw: e.target.value })} rows={4} className="w-full border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
            <input placeholder="Pairings, comma separated" value={cocktailForm.pairingsRaw} onChange={(e) => setCocktailForm({ ...cocktailForm, pairingsRaw: e.target.value })} className="w-full border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
            <textarea placeholder="Story" value={cocktailForm.story} onChange={(e) => setCocktailForm({ ...cocktailForm, story: e.target.value })} rows={2} className="w-full border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
            <ImageField value={cocktailForm.image} onChange={(url) => setCocktailForm({ ...cocktailForm, image: url })} />
            <button disabled={saving} data-cursor-hover className="w-full border border-champagne/40 py-3 font-mono text-xs uppercase tracking-widest2 text-champagne hover:bg-champagne hover:text-void disabled:opacity-40">
              {saving ? 'Saving…' : 'Add cocktail'}
            </button>
          </form>

          <div>
            <span className="section-eyebrow">Existing ({cocktails.length})</span>
            <ul className="mt-4 space-y-2">
              {cocktails.map((c) => (
                <li key={c.slug} className="flex items-center justify-between border-b border-champagne/10 py-2">
                  <span className="text-bone">{c.name}</span>
                  {can('delete') && (
                    <button onClick={() => handleDelete('cocktails', c.slug)} data-cursor-hover className="font-mono text-[10px] uppercase text-bone/40 hover:text-crimson">
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === 'spirits' && (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <form onSubmit={submitSpirit} className="space-y-4">
            <span className="section-eyebrow">Add a spirit</span>
            <input required placeholder="Name" value={spiritForm.name} onChange={(e) => setSpiritForm({ ...spiritForm, name: e.target.value })} className="w-full border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Category" value={spiritForm.category} onChange={(e) => setSpiritForm({ ...spiritForm, category: e.target.value })} className="border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
              <input placeholder="Origin" value={spiritForm.origin} onChange={(e) => setSpiritForm({ ...spiritForm, origin: e.target.value })} className="border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
            </div>
            <input placeholder="Tagline" value={spiritForm.tagline} onChange={(e) => setSpiritForm({ ...spiritForm, tagline: e.target.value })} className="w-full border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
            <textarea required placeholder="Description" value={spiritForm.description} onChange={(e) => setSpiritForm({ ...spiritForm, description: e.target.value })} rows={3} className="w-full border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
            <input type="number" placeholder="ABV %" value={spiritForm.abv} onChange={(e) => setSpiritForm({ ...spiritForm, abv: Number(e.target.value) })} className="w-full border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
            <input placeholder="Tasting notes, comma separated" value={spiritForm.tastingNotesRaw} onChange={(e) => setSpiritForm({ ...spiritForm, tastingNotesRaw: e.target.value })} className="w-full border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
            <ImageField value={spiritForm.image} onChange={(url) => setSpiritForm({ ...spiritForm, image: url })} />
            <button disabled={saving} data-cursor-hover className="w-full border border-champagne/40 py-3 font-mono text-xs uppercase tracking-widest2 text-champagne hover:bg-champagne hover:text-void disabled:opacity-40">
              {saving ? 'Saving…' : 'Add spirit'}
            </button>
          </form>

          <div>
            <span className="section-eyebrow">Existing ({spirits.length})</span>
            <ul className="mt-4 space-y-2">
              {spirits.map((s) => (
                <li key={s.slug} className="flex items-center justify-between border-b border-champagne/10 py-2">
                  <span className="text-bone">{s.name}</span>
                  {can('delete') && (
                    <button onClick={() => handleDelete('spirits', s.slug)} data-cursor-hover className="font-mono text-[10px] uppercase text-bone/40 hover:text-crimson">
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === 'tools' && (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <form onSubmit={submitTool} className="space-y-4">
            <span className="section-eyebrow">Add a tool</span>
            <input required placeholder="Name" value={toolForm.name} onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })} className="w-full border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Category" value={toolForm.category} onChange={(e) => setToolForm({ ...toolForm, category: e.target.value })} className="border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
              <input placeholder="Material" value={toolForm.material} onChange={(e) => setToolForm({ ...toolForm, material: e.target.value })} className="border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
            </div>
            <input placeholder="Tagline" value={toolForm.tagline} onChange={(e) => setToolForm({ ...toolForm, tagline: e.target.value })} className="w-full border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
            <textarea required placeholder="Description" value={toolForm.description} onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })} rows={3} className="w-full border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
            <textarea placeholder={'Specs — one per line: Label | Value'} value={toolForm.specsRaw} onChange={(e) => setToolForm({ ...toolForm, specsRaw: e.target.value })} rows={4} className="w-full border-b border-champagne/20 bg-transparent py-2 text-bone outline-none focus:border-champagne" />
            <ImageField value={toolForm.image} onChange={(url) => setToolForm({ ...toolForm, image: url })} />
            <button disabled={saving} data-cursor-hover className="w-full border border-champagne/40 py-3 font-mono text-xs uppercase tracking-widest2 text-champagne hover:bg-champagne hover:text-void disabled:opacity-40">
              {saving ? 'Saving…' : 'Add tool'}
            </button>
          </form>

          <div>
            <span className="section-eyebrow">Existing ({tools.length})</span>
            <ul className="mt-4 space-y-2">
              {tools.map((t) => (
                <li key={t.slug} className="flex items-center justify-between border-b border-champagne/10 py-2">
                  <span className="text-bone">{t.name}</span>
                  {can('delete') && (
                    <button onClick={() => handleDelete('tools', t.slug)} data-cursor-hover className="font-mono text-[10px] uppercase text-bone/40 hover:text-crimson">
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
