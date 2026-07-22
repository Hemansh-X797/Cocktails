'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { mapRange, clamp } from '@/lib/utils';
import type { Spirit } from '@/lib/adapter';

export function FloatingBottleCard({ spirit }: { spirit: Spirit }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('rotateX(0deg) rotateY(0deg)');
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotateY = mapRange(px, 0, 1, -10, 10);
    const rotateX = mapRange(py, 0, 1, 10, -10);

    setTransform(`rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    setGlow({ x: clamp(px * 100, 0, 100), y: clamp(py * 100, 0, 100) });
  }

  function handleMouseLeave() {
    setTransform('rotateX(0deg) rotateY(0deg)');
  }

  return (
    <Link href={`/spirits/${spirit.slug}`} data-cursor-hover className="block">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform, transformStyle: 'preserve-3d', perspective: '900px' }}
        className="card-velvet group relative overflow-hidden rounded-sm p-6 transition-transform duration-300 ease-velvet"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, ${spirit.color}33, transparent 60%)`,
          }}
        />
        <div className="relative h-64 w-full" style={{ transform: 'translateZ(40px)' }}>
          <Image
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
