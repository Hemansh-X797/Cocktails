import { notFound } from 'next/navigation';
import { SafeImage } from '@/components/ui/SafeImage';
import Link from 'next/link';
import { getAllCocktails } from '@/lib/content-store';

export const dynamic = 'force-dynamic';

export default async function CocktailDetailPage({ params }: { params: { slug: string } }) {
  const cocktails = await getAllCocktails();
  const cocktail = cocktails.find((c) => c.slug === params.slug);
  if (!cocktail) notFound();

  return (
    <main className="min-h-screen bg-void">
      <section
        className="relative flex min-h-[70vh] items-end px-8 pb-16 pt-32"
        style={{ background: `radial-gradient(circle at 50% 20%, ${cocktail.heroColor}, #050505 70%)` }}
      >
        <Link href="/cocktails" data-cursor-hover className="absolute top-8 left-8 font-mono text-xs text-bone/60 hover:text-champagne">
          ← Back to the Codex
        </Link>
        <div className="relative z-10 max-w-3xl">
          <span className="section-eyebrow">{cocktail.difficulty} · {cocktail.abv}% ABV · {cocktail.servingGlass}</span>
          <h1 className="font-display text-6xl text-bone mt-4">{cocktail.name}</h1>
          <p className="text-lg text-bone/70 mt-4 max-w-xl">{cocktail.description}</p>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: cocktail.rimColor }} />
      </section>

      <section className="grid grid-cols-1 gap-12 px-8 py-20 md:grid-cols-2">
        <div>
          <span className="section-eyebrow">Ingredients</span>
          <ul className="mt-6 space-y-3">
            {cocktail.ingredients.map((ing) => (
              <li key={ing.name} className="flex justify-between border-b border-champagne/10 pb-2">
                <span className="text-bone">{ing.name}</span>
                <span className="font-mono text-champagne">{ing.amount}</span>
              </li>
            ))}
          </ul>

          <span className="section-eyebrow mt-12 block">Flavor Profile</span>
          <div className="mt-6 space-y-3">
            {Object.entries(cocktail.flavorProfile).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-xs font-mono text-bone/50 mb-1">
                  <span className="uppercase">{key}</span>
                  <span>{value}%</span>
                </div>
                <div className="h-px bg-obsidian overflow-hidden">
                  <div className="h-full bg-champagne" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="section-eyebrow">Method</span>
          <ol className="mt-6 space-y-4">
            {cocktail.method.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="font-mono text-champagne text-sm">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-bone/80">{step}</span>
              </li>
            ))}
          </ol>

          <span className="section-eyebrow mt-12 block">Pairs With</span>
          <ul className="mt-4 flex flex-wrap gap-2">
            {cocktail.pairings.map((pairing) => (
              <li key={pairing} className="rounded-full border border-champagne/20 px-4 py-1 text-xs text-bone/70">
                {pairing}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative h-[60vh] w-full">
        <SafeImage src={cocktail.image} alt={cocktail.name} fill className="object-cover" />
      </section>

      <section className="px-8 py-20 max-w-3xl">
        <span className="section-eyebrow">The Story</span>
        <p className="mt-6 text-bone/70 leading-relaxed">{cocktail.story}</p>
      </section>
    </main>
  );
}
