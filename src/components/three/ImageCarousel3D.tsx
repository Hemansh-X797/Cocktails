'use client';

import { useCallback, useRef, useState } from 'react';
import { SafeImage } from '@/components/ui/SafeImage';

export interface CarouselImage {
  src: string;
  alt: string;
  caption?: string;
}

/**
 * A true perspective coverflow: each image sits on its own plane in 3D
 * space (translateZ + rotateY based on distance from center), so the
 * whole thing reads as physical depth, not a flat slider. Scrolling
 * inside the section advances one slide per "tick" with a cooldown,
 * so it snaps cleanly rather than spinning wildly — the magnetic feel
 * comes from the CSS transition easing doing the settling, not JS math.
 */
export function ImageCarousel3D({ images }: { images: CarouselImage[] }) {
  const [active, setActive] = useState(0);
  const cooldown = useRef(false);

  const advance = useCallback(
    (dir: 1 | -1) => {
      if (cooldown.current) return;
      cooldown.current = true;
      setActive((prev) => (prev + dir + images.length) % images.length);
      setTimeout(() => {
        cooldown.current = false;
      }, 550);
    },
    [images.length]
  );

  function handleWheel(e: React.WheelEvent) {
    if (Math.abs(e.deltaY) < 4) return;
    advance(e.deltaY > 0 ? 1 : -1);
  }

  return (
    <div
      onWheel={handleWheel}
      className="relative h-[32rem] w-full overflow-hidden"
      style={{ perspective: '1400px' }}
    >
      <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d' }}>
        {images.map((img, i) => {
          let offset = i - active;
          // Shortest cyclic distance, so wrap-around slides in from the near side.
          if (offset > images.length / 2) offset -= images.length;
          if (offset < -images.length / 2) offset += images.length;

          const isActive = offset === 0;
          const abs = Math.abs(offset);

          return (
            <div
              key={img.src + i}
              className="absolute left-1/2 top-1/2 h-80 w-56 -translate-x-1/2 -translate-y-1/2 transition-all duration-[600ms] ease-velvet"
              style={{
                transform: `translate(-50%, -50%) translateX(${offset * 230}px) translateZ(${-abs * 180}px) rotateY(${-offset * 35}deg)`,
                opacity: abs > 2 ? 0 : 1 - abs * 0.28,
                zIndex: 10 - abs,
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-sm shadow-2xl">
                <SafeImage src={img.src} alt={img.alt} fill className="object-cover" sizes="224px" />
                <div className="absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent" />
              </div>
              {img.caption && isActive && (
                <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest2 text-bone/60">
                  {img.caption}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            data-cursor-hover
            aria-label={`Go to slide ${i + 1}`}
            className="h-1 w-6 rounded-full transition-colors"
            style={{ background: i === active ? '#e5c158' : 'rgba(236,231,221,0.2)' }}
          />
        ))}
      </div>
    </div>
  );
}
