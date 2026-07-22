'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

let registered = false;

/** Registers GSAP plugins exactly once, client-side only. Call before any ScrollTrigger use. */
export function registerGsap() {
  if (registered || typeof window === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out', duration: 1 });
  registered = true;
}

export { gsap, ScrollTrigger };
