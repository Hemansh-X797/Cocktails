'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';
import { mapRange, clamp, lerp } from '@/lib/utils';
import type { Spirit } from '@/lib/adapter';

/**
 * Previously called setState twice on every raw mousemove event over the
 * card — with no throttling, a fast mouse or trackpad can fire well over
 * 100 of those a second, each one a full React re-render. Rewritten to
 * the same ref + own-rAF-loop pattern as BespokeCursor: mousemove just
 * updates a target in a ref, and one paint loop lerps toward it and
 * writes the transform/gradient directly to the DOM. As a side benefit,
 * the tilt now eases toward the cursor instead of snapping to it.
 */
export function FloatingBottleCard({ spirit }: { spirit: Spirit }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const target = useRef({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });
  const current = useRef({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });

  useEffect(() => {
    let raf: number;

    function paint() {
      current.current.rotateX = lerp(current.current.rotateX, target.current.rotateX, 0.14);
      current.current.rotateY = lerp(current.current.rotateY, target.current.rotateY, 0.14);
      current.current.glowX = lerp(current.current.glowX, target.current.glowX, 0.14);
      current.current.glowY = lerp(current.current.glowY, target.current.glowY, 0.14);

      const card = cardRef.current;
      if (card) {
        card.style.transform = `rotateX(${current.current.rotateX}deg) rotateY(${current.current.rotateY}deg)`;
      }
      const glow = glowRef.current;
      if (glow) {
        glow.style.background = `radial-gradient(circle at ${current.current.glowX}% ${current.current.glowY}%, ${spirit.color}33, transparent 60%)`;
      }
      raf = requestAnimationFrame(paint);
    }
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [spirit.color]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    target.current.rotateY = mapRange(px, 0, 1, -10, 10);
    target.current.rotateX = mapRange(py, 0, 1, 10, -10);
    target.current.glowX = clamp(px * 100, 0, 100);
    target.current.glowY = clamp(py * 100, 0, 100);
  }

  function handleMouseLeave() {
    target.current.rotateX = 0;
    target.current.rotateY = 0;
  }

  return (
    <Link href={`/spirits/${spirit.slug}`} data-cursor-hover className="block">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transformStyle: 'preserve-3d', perspective: '900px', willChange: 'transform' }}
        className="card-velvet group relative overflow-hidden rounded-sm p-6"
      >
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <div className="relative h-64 w-full" style={{ transform: 'translateZ(40px)' }}>
          <SafeImage
            src={spirit.image}
            alt={spirit.name}
            fill
            className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <div className="relative mt-6" style={{ transform: 'translateZ(20px)' }}>
          <span className="section-eyebrow">{spirit.category}</span>
          <h3 className="font-display text-2xl text-bone mt-2">{spirit.name}</h3>
          <p className="text-sm text-bone/60 mt-2">{spirit.tagline}</p>
        </div>
      </div>
    </Link>
  );
}
