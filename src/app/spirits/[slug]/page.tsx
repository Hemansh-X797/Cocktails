import { notFound } from 'next/navigation';
import { SafeImage } from '@/components/ui/SafeImage';
import Link from 'next/link';
import { getAllSpirits, getAllCocktails } from '@/lib/content-store';

export const dynamic = 'force-dynamic';

export default async function SpiritDetailPage({ params }: { params: { slug: string } }) {
  const [spirits, cocktails] = await Promise.all([getAllSpirits(), getAllCocktails()]);
  const spirit = spirits.find((s) => s.slug === params.slug);
  if (!spirit) notFound();

  const featuredIn = cocktails.filter((c) => spirit.bestIn.includes(c.slug));

  return (
    <main className="min-h-screen bg-obsidian">
      <section
        className="relative flex min-h-[70vh] items-end px-8 pb-16 pt-32"
        style={{ background: `radial-gradient(circle at 50% 20%, ${spirit.color}55, #121212 70%)` }}
      >
        <Link href="/spirits" data-cursor-hover className="absolute top-8 left-8 font-mono text-xs text-bone/60 hover:text-champagne">
          ← Back to the Vault
        </Link>
        <div className="relative z-10 grid w-full grid-cols-1 gap-12 md:grid-cols-2 items-end">
          <div>
            <span className="section-eyebrow">{spirit.category} · {spirit.origin} · {spirit.abv}% ABV</span>
            <h1 className="font-display text-6xl text-bone mt-4">{spirit.name}</h1>
            <p className="text-lg text-bone/70 mt-4">{spirit.description}</p>
          </div>
          <div className="relative h-96 w-full">
            <SafeImage src={spirit.image} alt={spirit.name} fill className="object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.7)]" />
          </div>
        </div>
      </section>

      <section className="px-8 py-20 max-w-3xl">
        <span className="section-eyebrow">Tasting Notes</span>
        <ul className="mt-6 flex flex-wrap gap-2">
          {spirit.tastingNotes.map((note) => (
            <li key={note} className="rounded-full border border-champagne/20 px-4 py-1 text-xs text-bone/70">
              {note}
            </li>
          ))}
        </ul>

        {featuredIn.length > 0 && (
          <>
            <span className="section-eyebrow mt-12 block">Featured In</span>
            <div className="mt-6 flex flex-col gap-3">
              {featuredIn.map((c) => (
                <Link
                  key={c.slug}
                  href={`/cocktails/${c.slug}`}
                  data-cursor-hover
                  className="flex justify-between border-b border-champagne/10 pb-2 text-bone hover:text-champagne transition-colors"
                >
                  <span>{c.name}</span>
                  <span className="font-mono text-xs text-bone/40">{c.tagline}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
