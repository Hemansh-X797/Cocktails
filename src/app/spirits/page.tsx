import { SpiritsVault } from '@/components/sections/SpiritsVault';
import { getAllSpirits } from '@/lib/content-store';

export const dynamic = 'force-dynamic';

export default async function SpiritsPage() {
  const spirits = await getAllSpirits();
  return (
    <main className="min-h-screen bg-obsidian pt-32">
      <SpiritsVault spirits={spirits} />
    </main>
  );
}
