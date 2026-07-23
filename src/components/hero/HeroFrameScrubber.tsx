'use client';

import { useEffect, useRef, useState } from 'react';
import { registerGsap, gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * The original version of this hero scrubbed through 169 pre-rendered
 * photo frames on scroll. Those frames were never actually in the repo —
 * every load hit a 404 and the hero rendered blank, which is the root
 * cause of "sometimes things don't load properly." This version needs
 * no external assets at all: it's drawn entirely in SVG/canvas, so there
 * is nothing that can fail to fetch. The scroll-pin mechanics (same
 * ScrollTrigger approach, same three text beats) are preserved.
 *
 * Three beats, tied to scroll progress:
 *   0.00–0.33  Pour    — the glass fills from empty to a held pour.
 *   0.33–0.66  Cheers  — two glasses tilt in and touch rims, a spark of light.
 *   0.66–1.00  Fracture & Heal — hairline cracks race across the glass,
 *              then gold traces the same lines closed, kintsugi-style —
 *              this is the same repair-not-shatter idea as the reference
 *              fracture piece, applied to the hero instead of a portrait.
 */

const BEATS = [
  { label: 'Pour', from: 0, to: 0.33 },
  { label: 'Cheers', from: 0.33, to: 0.66 },
  { label: 'Fracture & Heal', from: 0.66, to: 1.0 },
];

// Hand-authored crack lines radiating from the glass's center, as SVG path
// data. Each is stroked twice: once in near-black (the crack) and once in
// gold, drawn shorter behind it in time — so gold visibly "closes" the
// crack rather than merely tracing over an already-finished line.
const CRACKS = [
  'M320 210 L295 260 L330 300 L300 350 L340 400',
  'M320 210 L365 250 L340 295 L380 330 L355 380',
  'M320 210 L280 195 L245 220 L210 205',
  'M320 210 L370 190 L400 210 L440 195',
  'M320 210 L310 150 L335 110 L320 60',
  'M320 210 L260 300 L270 360 L235 410',
  'M320 210 L385 300 L378 365 L415 405',
];

export function HeroFrameScrubber() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const liquidRef = useRef<SVGRectElement>(null);
  const glassGroupRef = useRef<SVGGElement>(null);
  const partnerGlassRef = useRef<SVGGElement>(null);
  const sparkRef = useRef<SVGCircleElement>(null);
  const crackRefs = useRef<(SVGPathElement | null)[]>([]);
  const goldRefs = useRef<(SVGPathElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeBeat, setActiveBeat] = useState(0);

  // Ambient gold dust, purely decorative, never blocks anything.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let w = 0;
    let h = 0;
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.2,
      vy: 0.00006 + Math.random() * 0.00012,
      a: 0.05 + Math.random() * 0.2,
    }));

    function resize() {
      if (!canvas) return;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.y -= p.vy;
        if (p.y < -0.02) p.y = 1.02;
        ctx!.beginPath();
        ctx!.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(201,161,90,${p.a})`;
        ctx!.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    if (!wrapperRef.current) return;
    registerGsap();

    const cracks = crackRefs.current.filter(Boolean) as SVGPathElement[];
    const golds = goldRefs.current.filter(Boolean) as SVGPathElement[];
    const lengths = cracks.map((p) => p.getTotalLength());

    cracks.forEach((p, i) => {
      p.style.strokeDasharray = String(lengths[i]);
      p.style.strokeDashoffset = String(lengths[i]);
    });
    golds.forEach((p, i) => {
      p.style.strokeDasharray = String(lengths[i]);
      p.style.strokeDashoffset = String(lengths[i]);
    });

    const st = ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: 'top top',
      end: '+=3200',
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;

        const beatIndex = BEATS.findIndex((b) => p >= b.from && p <= b.to) ?? 0;
        setActiveBeat(Math.max(0, beatIndex));

        // --- Beat 1: Pour (0 → 0.33) ---
        const pourT = gsap.utils.clamp(0, 1, gsap.utils.mapRange(0, 0.33, 0, 1, p));
        if (liquidRef.current) {
          liquidRef.current.setAttribute('y', String(300 - pourT * 210));
          liquidRef.current.setAttribute('height', String(pourT * 210));
        }
        if (glassGroupRef.current) {
          const tilt = Math.sin(pourT * Math.PI) * -4;
          glassGroupRef.current.style.transform = `rotate(${tilt}deg)`;
          glassGroupRef.current.style.transformOrigin = '320px 480px';
        }

        // --- Beat 2: Cheers (0.33 → 0.66) ---
        const cheersT = gsap.utils.clamp(0, 1, gsap.utils.mapRange(0.33, 0.66, 0, 1, p));
        if (partnerGlassRef.current) {
          const x = gsap.utils.interpolate(140, -18, cheersT);
          const rot = gsap.utils.interpolate(-18, -2, cheersT);
          partnerGlassRef.current.style.transform = `translateX(${x}px) rotate(${rot}deg)`;
          partnerGlassRef.current.style.transformOrigin = '520px 480px';
          partnerGlassRef.current.style.opacity = String(gsap.utils.clamp(0, 1, cheersT * 2.5));
        }
        if (sparkRef.current) {
          const near1 = cheersT > 0.75 ? 1 : 0;
          sparkRef.current.setAttribute('opacity', String(near1 * (1 - (cheersT - 0.75) * 4)));
        }

        // --- Beat 3: Fracture & Heal (0.66 → 1.0) ---
        const fractureT = gsap.utils.clamp(0, 1, gsap.utils.mapRange(0.66, 0.86, 0, 1, p));
        const healT = gsap.utils.clamp(0, 1, gsap.utils.mapRange(0.82, 1.0, 0, 1, p));
        cracks.forEach((el, i) => {
          el.style.strokeDashoffset = String(lengths[i] * (1 - fractureT));
        });
        golds.forEach((el, i) => {
          el.style.strokeDashoffset = String(lengths[i] * (1 - healT));
        });
      },
    });

    return () => st.kill();
  }, []);

  return (
    <div ref={wrapperRef} className="hero-canvas-wrapper bg-void">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 640 640" className="h-[70vh] w-auto max-w-[90vw]" aria-hidden="true">
          <defs>
            <radialGradient id="vignette" cx="50%" cy="42%" r="65%">
              <stop offset="0%" stopColor="#1a0407" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#050505" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="goldVein" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e8c98a" />
              <stop offset="100%" stopColor="#a8823f" />
            </linearGradient>
          </defs>

          <circle cx="320" cy="300" r="280" fill="url(#vignette)" />

          {/* Second glass, tilts in for the Cheers beat */}
          <g ref={partnerGlassRef} style={{ opacity: 0 }}>
            <path
              d="M470 90 L570 90 L570 130 C570 190 530 220 520 226 C510 220 470 190 470 130 Z"
              fill="none"
              stroke="#c9a15a"
              strokeWidth="1.4"
              opacity="0.75"
            />
            <line x1="520" y1="226" x2="520" y2="420" stroke="#c9a15a" strokeWidth="1.4" opacity="0.75" />
            <ellipse cx="520" cy="428" rx="42" ry="9" fill="none" stroke="#c9a15a" strokeWidth="1.4" opacity="0.75" />
          </g>
          <circle ref={sparkRef} cx="470" cy="150" r="10" fill="#fff7e0" opacity="0" />

          {/* Primary hero glass */}
          <g ref={glassGroupRef}>
            <path
              d="M220 60 L420 60 L420 130 C420 230 350 275 322 292 C294 275 220 230 220 130 Z"
              fill="none"
              stroke="#c9a15a"
              strokeWidth="1.6"
              opacity="0.9"
            />
            <clipPath id="liquidClip">
              <path d="M226 66 L414 66 L414 130 C414 224 348 267 322 284 C296 267 226 224 226 130 Z" />
            </clipPath>
            <rect
              ref={liquidRef}
              x="220"
              y="300"
              width="200"
              height="0"
              fill="#8a0f24"
              clipPath="url(#liquidClip)"
              opacity="0.92"
            />
            <line x1="322" y1="292" x2="322" y2="480" stroke="#c9a15a" strokeWidth="1.6" opacity="0.9" />
            <ellipse cx="322" cy="488" rx="60" ry="12" fill="none" stroke="#c9a15a" strokeWidth="1.6" opacity="0.9" />

            {/* Fracture lines + their gold-heal overlay */}
            {CRACKS.map((d, i) => (
              <path
                key={`crack-${i}`}
                ref={(el) => { crackRefs.current[i] = el; }}
                d={d}
                fill="none"
                stroke="#000000"
                strokeWidth="2.5"
                opacity="0.8"
                strokeLinecap="round"
              />
            ))}
            {CRACKS.map((d, i) => (
              <path
                key={`gold-${i}`}
                ref={(el) => { goldRefs.current[i] = el; }}
                d={d}
                fill="none"
                stroke="url(#goldVein)"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            ))}
          </g>
        </svg>
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-24">
        <h1
          key={activeBeat}
          className="font-display text-6xl md:text-8xl text-bone tracking-tight animate-[fadeUp_0.8s_ease-forwards]"
        >
          {BEATS[activeBeat]?.label}
        </h1>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest2 text-bone/30">
        Scroll to continue ↓
      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
