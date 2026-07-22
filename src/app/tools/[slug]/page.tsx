import { notFound } from 'next/navigation';
import { SafeImage } from '@/components/ui/SafeImage';
import Link from 'next/link';
import { getAllTools } from '@/lib/content-store';

export const dynamic = 'force-dynamic';

export default async function ToolDetailPage({ params }: { params: { slug: string } }) {
  const tools = await getAllTools();
  const tool = tools.find((t) => t.slug === params.slug);
  if (!tool) notFound();

  return (
    <main className="min-h-screen bg-void">
      <section className="relative grid min-h-[80vh] grid-cols-1 pt-24 md:grid-cols-2">
        <Link href="/tools" data-cursor-hover className="absolute top-8 left-8 z-10 font-mono text-xs text-bone/60 hover:text-champagne">
          ← Back to the Arsenal
        </Link>
        <div className="relative h-96 md:h-full">
          <SafeImage src={tool.image} alt={tool.name} fill className="object-cover" />
        </div>
        <div className="flex flex-col justify-center px-8 py-16">
          <span className="section-eyebrow">{tool.category} · {tool.material}</span>
          <h1 className="font-display text-5xl text-bone mt-4">{tool.name}</h1>
          <p className="text-lg text-bone/70 mt-4">{tool.description}</p>

          <span className="section-eyebrow mt-10 block">Specifications</span>
          <dl className="mt-4 space-y-2">
            {tool.specs.map((spec) => (
              <div key={spec.label} className="flex justify-between border-b border-champagne/10 pb-2">
                <dt className="text-bone/60">{spec.label}</dt>
                <dd className="font-mono text-champagne">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
