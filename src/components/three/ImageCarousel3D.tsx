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
 * A true perspective coverflow. The slide elements are rendered once by
 * React; from then on a single requestAnimationFrame loop reads the
 * scrub position straight off a ref and writes transform/opacity directly
 * to each slide's DOM node. Nothing here calls setState per frame, so
 * dragging this does not cost a single React render — the only render
 * this component does after mount is when the active index actually
 * changes (for the caption/dots), a few times a second at most instead
 * of sixty.
 */
export function ImageCarousel3D({ images }: { images: CarouselImage[] }) {
  const { positionRef, activeIndex, isDragging, setUnitPx, bind, goTo } = useMagneticScrub(images.length);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setUnitPx(SLIDE_SPACING);
  }, [setUnitPx]);

  // The only per-frame work in this component — direct style writes, no
  // React involved at all.
  useEffect(() => {
    let raf: number;
    const n = images.length;

    function paint() {
      const position = positionRef.current;
      for (let i = 0; i < n; i++) {
        const el = slideRefs.current[i];
        if (!el) continue;

        let offset = i - position;
        offset = ((offset + n / 2) % n + n) % n - n / 2;
        const abs = Math.abs(offset);

        if (abs > 3.2) {
          if (el.style.display !== 'none') el.style.display = 'none';
          continue;
        }
        if (el.style.display === 'none') el.style.display = '';

        el.style.transform = `translate(-50%, -50%) translateX(${offset * SLIDE_SPACING}px) translateZ(${-abs * 180}px) rotateY(${-offset * 32}deg)`;
        el.style.opacity = String(abs > 2.6 ? 0 : 1 - abs * 0.26);
        el.style.zIndex = String(Math.round(10 - abs));
        el.style.pointerEvents = abs < 0.5 ? 'auto' : 'none';
      }
      raf = requestAnimationFrame(paint);
    }
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [images.length, positionRef]);

  return (
    <div
      {...bind}
      className="relative h-[32rem] w-full touch-pan-y select-none"
      style={{ perspective: '1400px', cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d' }}>
        {images.map((img, i) => (
          <div
            key={img.src + i}
            ref={(el) => { slideRefs.current[i] = el; }}
            className="absolute left-1/2 top-1/2 h-80 w-56 -translate-x-1/2 -translate-y-1/2"
            style={{ willChange: 'transform, opacity' }}
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
          </div>
        ))}
      </div>

      {images[activeIndex]?.caption && !isDragging && (
        <p
          ref={captionRef}
          className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 text-center font-mono text-[10px] uppercase tracking-widest2 text-bone/60"
        >
          {images[activeIndex]?.caption}
        </p>
      )}

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
