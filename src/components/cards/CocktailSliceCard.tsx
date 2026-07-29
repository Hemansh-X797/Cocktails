'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SafeImage } from '@/components/ui/SafeImage';
import { HexFlavorChart } from '@/components/stats/HexFlavorChart';
import type { Cocktail } from '@/lib/adapter';

/**
 * Cocktail-flavored version of the "Elite Cinematic Displace Engine" card:
 * the single hero image is split into two vertical slices that shear apart
 * in opposite directions on hover (desaturated → full color, 8% zoom),
 * with a difference-blended display-type overlay that expands its letter
 * spacing on the same 0.8s velvet ease used site-wide. On hover, the base
 * caption cross-fades into a compact flavor-profile hexagon, so the card
 * doubles as a stats-card teaser for what's in the glass.
 */
export function CocktailSliceCard({ cocktail }: { cocktail: Cocktail }) {
  const [hovered, setHovered] = useState(false);
  const firstWord = cocktail.name.replace(/^The\s+/i, '').split(' ')[0];

  return (
    <Link
      href={`/cocktails/${cocktail.slug}`}
      data-cursor-hover
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative block h-[26rem] overflow-hidden bg-void"
      style={{ background: `linear-gradient(180deg, ${cocktail.heroColor}22, #050505)` }}
    >
      <div className="relative h-full w-full">
        {/* Left slice */}
        <div
          className="absolute inset-y-0 left-0 w-1/2 overflow-hidden transition-transform duration-[800ms] ease-velvet"
          style={{ transform: hovered ? 'translateY(-18px)' : 'translateY(0)' }}
        >
          <div className="relative h-full" style={{ width: '13rem' }}>
            <SafeImage
              src={cocktail.image}
              alt={cocktail.name}
              fill
              className="object-cover transition-transform duration-[800ms] ease-velvet"
              style={{
                filter: hovered ? 'grayscale(0%) brightness(1)' : 'grayscale(55%) brightness(0.75)',
                transform: hovered ? 'scale(1.08)' : 'scale(1)',
              }}
              sizes="260px"
            />
          </div>
        </div>

        {/* Right slice */}
        <div
          className="absolute inset-y-0 right-0 w-1/2 overflow-hidden transition-transform duration-[800ms] ease-velvet"
          style={{ transform: hovered ? 'translateY(18px)' : 'translateY(0)' }}
        >
          <div className="relative h-full ml-auto" style={{ width: '13rem' }}>
            <SafeImage
              src={cocktail.image}
              alt={cocktail.name}
              fill
              className="object-cover transition-transform duration-[800ms] ease-velvet"
              style={{
                filter: hovered ? 'grayscale(0%) brightness(1)' : 'grayscale(55%) brightness(0.75)',
                transform: hovered ? 'scale(1.08)' : 'scale(1)',
              }}
              sizes="260px"
            />
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: cocktail.rimColor }} />
      </div>

      {/* Difference-blended typography overlay */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 w-[140%] -translate-x-1/2 -translate-y-1/2 text-center transition-opacity duration-500"
        style={{ mixBlendMode: 'difference', opacity: hovered ? 0.35 : 0.85 }}
      >
        <h2
          className="font-display font-light uppercase text-bone transition-all duration-[800ms] ease-velvet"
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            letterSpacing: hovered ? '0.1em' : '-0.02em',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          {firstWord}
        </h2>
      </div>

      {/* Base caption */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 p-6 transition-opacity duration-400"
        style={{ opacity: hovered ? 0 : 1 }}
      >
        <span className="section-eyebrow">{cocktail.difficulty} · {cocktail.abv}% ABV</span>
        <h3 className="font-display text-2xl text-bone mt-2">{cocktail.name}</h3>
        <p className="text-sm text-bone/60 mt-1">{cocktail.tagline}</p>
      </div>

      {/* Hover reveal: compact flavor-profile hexagon */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-void/75 backdrop-blur-[2px] transition-opacity duration-500"
        style={{ opacity: hovered ? 1 : 0, pointerEvents: hovered ? 'auto' : 'none' }}
      >
        <span className="section-eyebrow mb-1">Flavor Profile</span>
        <div className="scale-[0.62] origin-center -my-16">
          <HexFlavorChart profile={cocktail.flavorProfile} size={280} accent={cocktail.rimColor} />
        </div>
      </div>
    </Link>
  );
}
