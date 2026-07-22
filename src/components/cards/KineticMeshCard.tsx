'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMouseVelocity } from '@/hooks/useMouseVelocity';
import type { Cocktail } from '@/lib/adapter';

export function KineticMeshCard({ cocktail }: { cocktail: Cocktail }) {
  const { skew, speed } = useMouseVelocity();
  const scale = 1 + Math.min(speed, 30) * 0.002;

  return (
    <Link
      href={`/cocktails/${cocktail.slug}`}
      data-cursor-hover
      className="group block"
      style={{
        transform: `skewX(${skew * 0.4}deg) scale(${scale})`,
        transition: 'transform 0.15s ease-out',
      }}
    >
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-sm"
        style={{ background: `linear-gradient(180deg, ${cocktail.heroColor}, #050505)` }}
      >
        <Image
          src={cocktail.image}
          alt={cocktail.name}
          fill
          className="object-cover opacity-90 transition-transform duration-700 ease-velvet group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-1"
          style={{ background: cocktail.rimColor }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <span className="section-eyebrow">{cocktail.difficulty} · {cocktail.abv}% ABV</span>
          <h3 className="font-display text-2xl text-bone mt-2">{cocktail.name}</h3>
          <p className="text-sm text-bone/60 mt-1">{cocktail.tagline}</p>
        </div>
      </div>
    </Link>
  );
}
