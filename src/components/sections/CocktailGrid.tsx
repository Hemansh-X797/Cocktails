import { KineticMeshCard } from '@/components/cards/KineticMeshCard';
import type { Cocktail } from '@/lib/adapter';

export function CocktailGrid({ cocktails }: { cocktails: Cocktail[] }) {
  return (
    <section className="relative bg-void px-8 py-32">
      <div className="mb-16 flex items-end justify-between">
        <div>
          <span className="section-eyebrow">The Codex</span>
          <h2 className="font-display text-5xl text-bone mt-3">Signature Pours</h2>
        </div>
        <div className="hairline max-w-xs hidden md:block" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cocktails.map((cocktail) => (
          <KineticMeshCard key={cocktail.slug} cocktail={cocktail} />
        ))}
      </div>
    </section>
  );
}
