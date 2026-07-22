'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SafeImage } from '@/components/ui/SafeImage';
import type { Tool } from '@/lib/adapter';

/**
 * Adapted from the "Elite Cinematic Displace Engine" reference: the card
 * splits into two vertical slices that shear apart in opposite directions
 * on hover, images shift from desaturated to full color, and a difference-
 * blended typography overlay expands its letter-spacing — all timed on
 * the same signature 0.8s cubic-bezier(0.16, 1, 0.3, 1) "velvet" ease.
 */
export function CinematicSliceCard({ tool }: { tool: Tool }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/tools/${tool.slug}`}
      data-cursor-hover
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative block h-[26rem] overflow-hidden bg-void"
    >
      <div className="relative h-full w-full">
        {/* Left slice */}
        <div
          className="absolute inset-y-0 left-0 w-1/2 overflow-hidden transition-transform duration-[800ms] ease-velvet"
          style={{ transform: hovered ? 'translateY(-18px)' : 'translateY(0)' }}
        >
          <div className="relative h-full" style={{ width: '13rem' }}>
            <SafeImage
              src={tool.image}
              alt={tool.name}
              fill
              className="object-cover transition-[filter,transform] duration-[800ms] ease-velvet"
              sizes="260px"
            />
            <div
              className="absolute inset-0 transition-all duration-[800ms] ease-velvet"
              style={{
                backdropFilter: hovered ? 'none' : 'grayscale(60%) brightness(0.7)',
                transform: hovered ? 'scale(1.08)' : 'scale(1)',
              }}
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
              src={tool.image}
              alt={tool.name}
              fill
              className="object-cover transition-[filter,transform] duration-[800ms] ease-velvet"
              sizes="260px"
            />
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-transparent" />
      </div>

      {/* Difference-blended typography overlay */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 w-[140%] -translate-x-1/2 -translate-y-1/2 text-center"
        style={{ mixBlendMode: 'difference' }}
      >
        <h2
          className="font-display font-light uppercase text-bone transition-all duration-[800ms] ease-velvet"
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            letterSpacing: hovered ? '0.08em' : '-0.02em',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            opacity: 0.85,
          }}
        >
          {tool.name.split(' ')[0]}
        </h2>
      </div>

      {/* Base caption + spec sheet reveal */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between p-6">
        <div style={{ opacity: hovered ? 0 : 1, transition: 'opacity 0.4s' }}>
          <span className="section-eyebrow">{tool.category}</span>
          <h3 className="font-display text-xl text-bone mt-1">{tool.name}</h3>
        </div>
      </div>

      <div
        className="absolute inset-0 flex flex-col justify-end bg-void/70 p-6 transition-opacity duration-500"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        <dl className="space-y-1.5">
          {tool.specs.slice(0, 4).map((spec) => (
            <div key={spec.label} className="flex justify-between border-b border-champagne/10 pb-1 text-xs">
              <dt className="uppercase tracking-wider text-bone/50 font-mono">{spec.label}</dt>
              <dd className="text-champagne font-mono">{spec.value}</dd>
            </div>
          ))}
        </dl>
        <span className="mt-3 font-mono text-[10px] uppercase tracking-widest2 text-bone/40">
          {tool.material}
        </span>
      </div>
    </Link>
  );
}
