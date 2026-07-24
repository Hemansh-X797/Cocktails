'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { SafeImage } from '@/components/ui/SafeImage';
import { pointerVelocity, ensurePointerVelocityTracking } from '@/lib/pointerVelocity';
import type { Cocktail } from '@/lib/adapter';

/**
 * Same two mechanisms as before — global velocity-driven skew, plus a
 * per-card proximity tilt — but neither one touches React state anymore.
 * Both read the one shared `pointerVelocity` singleton (see
 * lib/pointerVelocity.ts) inside this card's own rAF loop and write the
 * transform straight to the DOM node. A grid of these costs one shared
 * listener plus N cheap style writes per frame — not N independent
 * render loops.
 */
export function KineticMeshCard({ cocktail }: { cocktail: Cocktail }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const tiltRef = useRef(0);

  useEffect(() => {
    const cleanup = ensurePointerVelocityTracking();
    let raf: number;

    function paint() {
      const el = cardRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const distance = pointerVelocity.x - centerX;
        const targetTilt = clampDistanceTilt(distance);
        tiltRef.current += (targetTilt - tiltRef.current) * 0.15;

        el.style.transform = `perspective(1000px) rotateY(${tiltRef.current}deg) skewX(${pointerVelocity.skew * 0.4}deg)`;
      }
      raf = requestAnimationFrame(paint);
    }
    raf = requestAnimationFrame(paint);

    return () => {
      cancelAnimationFrame(raf);
      cleanup();
    };
  }, []);

  return (
    <Link
      ref={cardRef}
      href={`/cocktails/${cocktail.slug}`}
      data-cursor-hover
      className="group block"
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-sm"
        style={{ background: `linear-gradient(180deg, ${cocktail.heroColor}, #050505)` }}
      >
        <SafeImage
          src={cocktail.image}
          alt={cocktail.name}
          fill
          className="object-cover opacity-90 transition-transform duration-700 ease-velvet group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: cocktail.rimColor }} />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6" style={{ transform: 'translateZ(30px)' }}>
          <span className="section-eyebrow">{cocktail.difficulty} · {cocktail.abv}% ABV</span>
          <h3 className="font-display text-2xl text-bone mt-2">{cocktail.name}</h3>
          <p className="text-sm text-bone/60 mt-1">{cocktail.tagline}</p>
        </div>
      </div>
    </Link>
  );
}

function clampDistanceTilt(distance: number) {
  const raw = distance * -0.02;
  return Math.max(-14, Math.min(14, raw));
}
