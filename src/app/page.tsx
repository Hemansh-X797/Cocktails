import { HeroSection } from '@/components/sections/HeroSection';
import { SecondHero } from '@/components/sections/SecondHero';
import { GalleryCarousels } from '@/components/sections/GalleryCarousels';
import { CocktailGrid } from '@/components/sections/CocktailGrid';
import { SpiritsVault } from '@/components/sections/SpiritsVault';
import { ToolsArsenal } from '@/components/sections/ToolsArsenal';
import { getAllCocktails, getAllSpirits, getAllTools } from '@/lib/content-store';

export const dynamic = 'force-dynamic'; // always reflect dashboard-added content

export default async function HomePage() {
  const [cocktails, spirits, tools] = await Promise.all([
    getAllCocktails(),
    getAllSpirits(),
    getAllTools(),
  ]);

  return (
    <main className="relative bg-void">
      <HeroSection />
      <SecondHero />
      <CocktailGrid cocktails={cocktails} />
      <GalleryCarousels cocktails={cocktails} spirits={spirits} tools={tools} />
      <SpiritsVault spirits={spirits} />
      <ToolsArsenal tools={tools} />
      <footer className="border-t border-champagne/10 bg-void px-8 py-12 text-center">
        <p className="font-mono text-xs uppercase tracking-widest2 text-bone/40">
          My Cocktail Guide — a private archive of haute mixology
        </p>
      </footer>
    </main>
  );
}
