'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Tool } from '@/lib/adapter';

export function CinematicSliceCard({ tool }: { tool: Tool }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/tools/${tool.slug}`}
      data-cursor-hover
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative block h-[26rem] overflow-hidden rounded-sm border border-champagne/15 bg-obsidian"
    >
      {/* Left slice: photographic */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 overflow-hidden transition-[width] duration-700 ease-velvet"
        style={{ width: hovered ? '50%' : '100%' }}
      >
        <Image
          src={tool.image}
          alt={tool.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />
      </div>

      {/* Right slice: wireframe blueprint spec sheet */}
      <div
        className="absolute inset-y-0 right-0 w-1/2 bg-void/95 px-6 py-8 opacity-0 transition-opacity duration-500 ease-velvet"
        style={{ opacity: hovered ? 1 : 0, width: '50%' }}
      >
        <svg className="absolute inset-0 h-full w-full opacity-20" aria-hidden="true">
          <defs>
            <pattern id={`grid-${tool.slug}`} width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e5c158" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${tool.slug})`} />
        </svg>
        <div className="relative">
          <span className="section-eyebrow">{tool.category}</span>
          <h3 className="font-display text-xl text-bone mt-2 mb-4">{tool.name}</h3>
          <dl className="space-y-2">
            {tool.specs.map((spec) => (
              <div key={spec.label} className="flex justify-between border-b border-champagne/10 pb-1">
                <dt className="text-xs uppercase tracking-wider text-bone/50 font-mono">{spec.label}</dt>
                <dd className="text-xs text-champagne font-mono">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 z-10 p-6" style={{ opacity: hovered ? 0 : 1, transition: 'opacity 0.4s' }}>
        <h3 className="font-display text-2xl text-bone">{tool.name}</h3>
        <p className="text-sm text-bone/60 mt-1">{tool.tagline}</p>
      </div>
    </Link>
  );
}
