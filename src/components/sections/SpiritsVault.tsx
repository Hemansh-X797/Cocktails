import { FloatingBottleCard } from '@/components/cards/FloatingBottleCard';
import type { Spirit } from '@/lib/adapter';

export function SpiritsVault({ spirits }: { spirits: Spirit[] }) {
  return (
    <section className="relative bg-obsidian px-8 py-32">
      <div className="mb-16">
        <span className="section-eyebrow">The Liquid Vault</span>
        <h2 className="font-display text-5xl text-bone mt-3">Rare Spirits</h2>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {spirits.map((spirit) => (
          <FloatingBottleCard key={spirit.slug} spirit={spirit} />
        ))}
      </div>
    </section>
  );
}
