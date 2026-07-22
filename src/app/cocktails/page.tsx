import { CocktailGrid } from '@/components/sections/CocktailGrid';
import { getAllCocktails } from '@/lib/content-store';

export const dynamic = 'force-dynamic';

export default async function CocktailsPage() {
  const cocktails = await getAllCocktails();
  return (
    <main className="min-h-screen bg-void pt-32">
      <CocktailGrid cocktails={cocktails} />
    </main>
  );
}
