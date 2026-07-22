'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { SafeImage } from '@/components/ui/SafeImage';
import { useMouseVelocity } from '@/hooks/useMouseVelocity';
import type { Cocktail } from '@/lib/adapter';

/**
 * Combines two mechanisms from the "Inertial Mesh Interaction" reference:
 *   1. Global mouse velocity drives a shared skewX with inertial decay
 *      (fast horizontal cursor movement "drags" every card in the grid).
 *   2. Each card additionally tilts on rotateY based on the cursor's
 *      horizontal distance from its own center — proximity-based, not
 *      just hover — so the whole grid reads as one responsive plane.
 */
export function KineticMeshCard({ cocktail }: { cocktail: Cocktail }) {
  const { skew } = useMouseVelocity();
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState(0);

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const distance = e.clientX - centerX;
    setTilt(distance * -0.02);
  }

  return (
    <Link
      ref={cardRef}
      href={`/cocktails/${cocktail.slug}`}
      data-cursor-hover
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt(0)}
      className="group block"
      style={{
        transform: `perspective(1000px) rotateY(${tilt}deg) skewX(${skew * 0.4}deg)`,
        transition: 'transform 0.15s ease-out',
        transformStyle: 'preserve-3d',
      }}
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
