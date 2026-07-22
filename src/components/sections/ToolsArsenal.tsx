import { CinematicSliceCard } from '@/components/cards/CinematicSliceCard';
import type { Tool } from '@/lib/adapter';

export function ToolsArsenal({ tools }: { tools: Tool[] }) {
  return (
    <section className="relative bg-void px-8 py-32">
      <div className="mb-16">
        <span className="section-eyebrow">The Arsenal</span>
        <h2 className="font-display text-5xl text-bone mt-3">Bartender's Tools</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {tools.map((tool) => (
          <CinematicSliceCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </section>
  );
}
