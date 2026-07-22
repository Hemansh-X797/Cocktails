'use client';

import { useEffect, useRef, useState } from 'react';
import { WineGlass3D } from '@/components/three/WineGlass3D';

export function SecondHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.3 }
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

      {visible && <WineGlass3D fillLevel={1.05} />}

      <div className="pointer-events-none relative z-10 flex flex-col items-center text-center px-8">
        <span className="section-eyebrow mb-6">Poured, Suspended, Held</span>
        <h2 className="font-display text-5xl md:text-7xl text-bone max-w-3xl leading-[0.95]">
          A single pour,
          <br />
          rendered in real time.
        </h2>
        <p className="mt-6 max-w-md text-bone/50 text-sm">
          Move your cursor — the glass responds. Every facet here is built from geometry, not a photograph.
        </p>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest2 text-bone/30">
        Scroll to continue ↓
      </div>
    </section>
  );
}
