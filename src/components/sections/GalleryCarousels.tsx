import { ImageCarousel3D } from '@/components/three/ImageCarousel3D';
import { ObjectCarousel3D } from '@/components/three/ObjectCarousel3D';
import type { Cocktail, Spirit, Tool } from '@/lib/adapter';

export function GalleryCarousels({
  cocktails,
  spirits,
  tools,
}: {
  cocktails: Cocktail[];
  spirits: Spirit[];
  tools: Tool[];
}) {
  const images = [
    ...cocktails.map((c) => ({ src: c.image, alt: c.name, caption: c.name })),
    ...spirits.map((s) => ({ src: s.image, alt: s.name, caption: s.name })),
  ];

  return (
    <>
      <section className="relative bg-obsidian px-8 py-28">
        <div className="mb-14">
          <span className="section-eyebrow">The Gallery</span>
          <h2 className="font-display text-5xl text-bone mt-3">Scroll Through the Archive</h2>
          <p className="mt-3 max-w-md text-bone/50 text-sm">
            Scroll inside the frame below — each pour drifts into place.
          </p>
        </div>
        <ImageCarousel3D images={images} />
      </section>

      <section className="relative bg-void px-8 py-28">
        <div className="mb-14">
          <span className="section-eyebrow">The Instruments</span>
          <h2 className="font-display text-5xl text-bone mt-3">A Carousel, Rendered</h2>
          <p className="mt-3 max-w-md text-bone/50 text-sm">
            No photographs here — every object is built from geometry and scrolls into rotation.
          </p>
        </div>
        <ObjectCarousel3D />
      </section>
    </>
  );
}
