'use client';

import { useEffect, useRef, useState } from 'react';
import { SketchfabEmbed } from '@/components/three/SketchfabEmbed';

export function SecondHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void"
    >
      <div className="bg-ruby-radial absolute inset-0" />

      {visible && (
        <SketchfabEmbed
          modelId="92d9d82f45ea40be8cb4774d929454db"
          title="Wine Bottle and Glasses"
          author="Karolina Renkiewicz"
          authorUrl="https://sketchfab.com/KarolinaRenkiewicz"
          modelUrl="https://sketchfab.com/3d-models/wine-bottle-and-glasses-92d9d82f45ea40be8cb4774d929454db"
          className="absolute inset-0"
        />
      )}

      <div className="pointer-events-none relative z-10 flex flex-col items-center text-center px-8">
        <span className="section-eyebrow mb-6">Poured, Suspended, Held</span>
        <h2 className="font-display text-5xl md:text-7xl text-bone max-w-3xl leading-[0.95]">
          Bottle to glass,
          <br />
          nothing left to chance.
        </h2>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest2 text-bone/30">
        Scroll to continue ↓
      </div>
    </section>
  );
}
