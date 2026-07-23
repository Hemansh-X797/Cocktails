'use client';

import { useEffect, useRef, useState } from 'react';
import { registerGsap, gsap, ScrollTrigger } from '@/lib/gsap';

const FRAME_COUNT = 169;
const FRAME_PATH = (i: number) => `/frames/hero_${String(i).padStart(3, '0')}.webp`;

interface TextBeat {
  label: string;
  fromFrame: number;
  toFrame: number;
}

const TEXT_SEQUENCE: TextBeat[] = [
  { label: 'Pour', fromFrame: 1, toFrame: 55 },
  { label: 'Cheers', fromFrame: 56, toFrame: 112 },
  { label: 'Fracture & Heal', fromFrame: 113, toFrame: 169 },
];

export function HeroFrameScrubber() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrame = useRef(0);
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);
  const [activeBeat, setActiveBeat] = useState(0);

  // Preload all frames.
  useEffect(() => {
    let cancelled = false;
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    let loadedCount = 0;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = () => {
        if (cancelled) return;
        loadedCount += 1;
        setLoaded(loadedCount);
        if (loadedCount === FRAME_COUNT) setReady(true);
      };
      img.onerror = () => {
        // Keep progress moving even if a frame is missing so the experience never stalls.
        if (cancelled) return;
        loadedCount += 1;
        setLoaded(loadedCount);
        if (loadedCount === FRAME_COUNT) setReady(true);
      };
      images[i - 1] = img;
    }
    imagesRef.current = images;

    return () => {
      cancelled = true;
    };
  }, []);

  function drawFrame(index: number) {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Cover-fit the frame within the canvas, preserving aspect ratio.
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = displayWidth / displayHeight;
    let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number;

    if (imgRatio > canvasRatio) {
      drawHeight = displayHeight;
      drawWidth = drawHeight * imgRatio;
      offsetX = (displayWidth - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = displayWidth;
      drawHeight = drawWidth / imgRatio;
      offsetX = 0;
      offsetY = (displayHeight - drawHeight) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  // Set up the pinned scrub once every frame is loaded.
  useEffect(() => {
    if (!ready || !wrapperRef.current) return;
    registerGsap();

    drawFrame(0);

    const state = { frame: 0 };
    const st = ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: 'top top',
      end: `+=${FRAME_COUNT * 22}`,
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => {
        const targetFrame = Math.round(self.progress * (FRAME_COUNT - 1));
        state.frame = targetFrame;
        currentFrame.current = targetFrame;
        drawFrame(targetFrame);

        const beatIndex = TEXT_SEQUENCE.findIndex(
          (beat) => targetFrame + 1 >= beat.fromFrame && targetFrame + 1 <= beat.toFrame
        );
        if (beatIndex !== -1) setActiveBeat(beatIndex);
      },
    });

    function handleResize() {
      drawFrame(currentFrame.current);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      st.kill();
      window.removeEventListener('resize', handleResize);
    };
  }, [ready]);

  const progressPct = Math.round((loaded / FRAME_COUNT) * 100);

  return (
    <div ref={wrapperRef} className="hero-canvas-wrapper">
      <canvas ref={canvasRef} aria-hidden="true" />

      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-void">
          <span className="section-eyebrow">Decanting the experience</span>
          <div className="h-px w-48 bg-obsidian overflow-hidden">
            <div
              className="h-full bg-champagne transition-all duration-200"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="font-mono text-xs text-bone/50">{progressPct}%</span>
        </div>
      )}

      {ready && (
        <div className="pointer-events-none absolute inset-0 flex items-end pb-20 justify-center">
          <div key={activeBeat} className="flex flex-col items-center gap-3 animate-[beatIn_0.7s_ease-forwards]">
            <span className="block h-px w-10 bg-gradient-to-r from-transparent via-champagne/60 to-transparent" />
            <span className="font-mono text-xs uppercase tracking-widest2 text-champagne/80">
              {TEXT_SEQUENCE[activeBeat]?.label}
            </span>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes beatIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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
