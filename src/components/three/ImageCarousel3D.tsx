'use client';

import { useEffect, useRef } from 'react';
import { SafeImage } from '@/components/ui/SafeImage';
import { useMagneticScrub } from '@/hooks/useMagneticScrub';

export interface CarouselImage {
  src: string;
  alt: string;
  caption?: string;
}

const SLIDE_SPACING = 230;

/**
 * A true perspective coverflow: each image sits on its own plane in 3D
 * space (translateZ + rotateY based on distance from center), so the
 * whole thing reads as physical depth, not a flat slider. Position is a
 * continuous float driven by drag, wheel, and momentum (see
 * useMagneticScrub) — there is no per-tick snap; the settle is a spring,
 * which is what actually reads as "luxury" rather than "slideshow".
 */
export function ImageCarousel3D({ images }: { images: CarouselImage[] }) {
  const { position, isDragging, setUnitPx, bind, goTo } = useMagneticScrub(images.length);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUnitPx(SLIDE_SPACING);
  }, [setUnitPx]);

  const activeIndex = Math.round(((position % images.length) + images.length) % images.length);

  return (
    <div
      ref={wrapperRef}
      {...bind}
      className="relative h-[32rem] w-full touch-pan-y select-none"
      style={{ perspective: '1400px', cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d' }}>
        {images.map((img, i) => {
          let offset = i - position;
          // Shortest cyclic distance, so wrap-around slides in from the near side.
          const n = images.length;
          offset = ((offset + n / 2) % n + n) % n - n / 2;

          const isActive = i === activeIndex;
          const abs = Math.abs(offset);
          if (abs > 3.2) return null;

          return (
            <div
              key={img.src + i}
              className="absolute left-1/2 top-1/2 h-80 w-56 -translate-x-1/2 -translate-y-1/2"
              style={{
                transform: `translate(-50%, -50%) translateX(${offset * SLIDE_SPACING}px) translateZ(${-abs * 180}px) rotateY(${-offset * 32}deg)`,
                opacity: abs > 2.6 ? 0 : 1 - abs * 0.26,
                zIndex: Math.round(10 - abs),
                pointerEvents: isActive ? 'auto' : 'none',
                willChange: 'transform, opacity',
              }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-sm shadow-2xl">
                <SafeImage
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover pointer-events-none"
                  sizes="224px"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent" />
              </div>
              {img.caption && isActive && !isDragging && (
                <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest2 text-bone/60">
                  {img.caption}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            data-cursor-hover
            aria-label={`Go to slide ${i + 1}`}
            className="pointer-events-auto h-1 w-6 rounded-full transition-colors duration-300"
            style={{ background: i === activeIndex ? '#e5c158' : 'rgba(236,231,221,0.2)' }}
          />
        ))}
      </div>
    </div>
  );
}
