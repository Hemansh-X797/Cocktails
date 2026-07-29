'use client';

import { useEffect, useRef } from 'react';

/**
 * Replaces the broken Sketchfab iframe (embed reliably fails to load in
 * production — CSP/referrer/ad-block sensitive, and there's no local
 * fallback). In its place: the word is never drawn as a font. It's sampled
 * as a field of particles from an offscreen text mask, then rendered as
 * a slow-moving swarm of soft, blurred droplets — closer to ink dropped in
 * wine than to type. Particles rest in formation, then bulge and trail
 * away from the cursor like the surface of a held glass, and drift back
 * with a lazy, viscous spring. Pure canvas, no GPU model, nothing to
 * fail to load.
 */
export function LiquidTypography({
  words = ['Poured', 'Suspended', 'Held'],
  className = '',
}: {
  words?: string[];
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Particle = {
      hx: number; // home x/y (formation target)
      hy: number;
      x: number; // current
      y: number;
      vx: number;
      vy: number;
      r: number;
      hue: number;
    };

    let particles: Particle[] = [];
    let wordIndex = 0;
    let morphT = 1; // 1 = settled at current word, animates 0->1 after a swap

    const mouse = { x: -9999, y: -9999, active: false };

    function sampleWord(word: string, w: number, h: number): { x: number; y: number }[] {
      const off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      const octx = off.getContext('2d')!;
      octx.clearRect(0, 0, w, h);
      octx.fillStyle = '#fff';
      const fontSize = Math.min(w / (word.length * 0.62), h * 0.5);
      octx.font = `700 ${fontSize}px Georgia, serif`;
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.fillText(word, w / 2, h / 2);

      const img = octx.getImageData(0, 0, w, h).data;
      const step = Math.max(3, Math.floor(fontSize / 22));
      const pts: { x: number; y: number }[] = [];
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const alpha = img[(y * w + x) * 4 + 3];
          if (alpha > 120) pts.push({ x, y });
        }
      }
      return pts;
    }

    function buildParticles() {
      const pts = sampleWord(words[wordIndex], width, height);
      // Reuse existing particle count where possible for a smoother morph
      const next: Particle[] = pts.map((p, i) => {
        const prev = particles[i];
        return {
          hx: p.x,
          hy: p.y,
          x: prev ? prev.x : p.x + (Math.random() - 0.5) * 200,
          y: prev ? prev.y : p.y + (Math.random() - 0.5) * 200,
          vx: 0,
          vy: 0,
          r: 1.4 + Math.random() * 1.8,
          hue: Math.random() > 0.82 ? 0 : 1, // ~18% ruby droplets, rest champagne
        };
      });
      particles = next;
      morphT = 0;
    }

    function resize() {
      if (!canvas) return; // Guard against null reference for TS
      const parent = canvas.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    }

    function onMove(e: MouseEvent) {
      if (!canvas) return; // Guard against null reference for TS
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }
    function onLeave() {
      mouse.active = false;
    }

    let lastSwap = performance.now();
    const swapEvery = 4200;

    function tick(now: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      if (now - lastSwap > swapEvery) {
        wordIndex = (wordIndex + 1) % words.length;
        buildParticles();
        lastSwap = now;
      }

      morphT = Math.min(1, morphT + 0.02);
      const ease = 1 - Math.pow(1 - morphT, 3);

      ctx.globalCompositeOperation = 'lighter';

      for (const p of particles) {
        // Target = interpolate toward home as morph settles
        const tx = p.hx;
        const ty = p.hy;

        // Spring toward home (viscous — low stiffness, high damping)
        const dxHome = tx - p.x;
        const dyHome = ty - p.y;
        p.vx += dxHome * 0.02 * ease;
        p.vy += dyHome * 0.02 * ease;

        // Cursor repulsion — wine surface pushed by a fingertip
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const radius = 110;
          if (dist < radius) {
            const force = (1 - dist / radius) * 3.2;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        p.vx *= 0.9;
        p.vy *= 0.9;
        p.x += p.vx;
        p.y += p.vy;

        const color = p.hue === 0 ? '139,0,0' : '229,193,88';
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        grad.addColorStop(0, `rgba(${color},0.55)`);
        grad.addColorStop(1, `rgba(${color},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [words]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ filter: 'blur(0.4px) saturate(1.1)' }}
    />
  );
}