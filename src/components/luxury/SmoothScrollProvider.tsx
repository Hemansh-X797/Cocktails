'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, registerGsap } from '@/lib/gsap';

/**
 * Wraps the app in a Lenis smooth-scroll instance and drives it from GSAP's
 * own ticker rather than requestAnimationFrame directly. This is the piece
 * that keeps ScrollTrigger-pinned sections (like the frame-scrub hero) from
 * drifting out of sync with the smoothed scroll position — both systems
 * agree on exactly one clock.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis>();

  useEffect(() => {
    registerGsap();

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf as unknown as gsap.TickerCallback);
    };
  }, []);

  return <>{children}</>;
}
