'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Same drag/momentum/magnetic-settle mechanics as before, but restructured
 * so nothing here calls setState on every animation frame.
 *
 * The previous version called `setPosition` inside the rAF loop, which
 * meant every one of the ~60 position updates per second triggered a full
 * React re-render of whatever consumed it — for a 3D carousel, that's a
 * full scene-graph reconciliation 60 times a second just to move a
 * number. That's the actual mechanism behind "laggy": not the animation
 * itself, but React doing unrelated work in between every frame of it.
 *
 * The fix: the continuously-changing value lives only in `positionRef`
 * (a plain mutable ref). Consumers that need to *animate* something read
 * `positionRef.current` inside their own rAF/useFrame loop and write
 * directly to the DOM (style.transform) or to a Three.js object's
 * transform — no React render involved. React state (`activeIndex`) is
 * only touched when the rounded index actually changes, which for a
 * carousel is a handful of times per second at most, not sixty.
 */
export function useMagneticScrub(count: number, opts?: { loop?: boolean }) {
  const loop = opts?.loop ?? true;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const dragStartX = useRef(0);
  const dragStartPos = useRef(0);
  const lastX = useRef(0);
  const lastT = useRef(0);
  const rafRef = useRef<number>();
  const wrapperWidthRef = useRef(240);
  const targetOverrideRef = useRef<number | null>(null);
  const lastAnnouncedIndex = useRef(0);

  const setUnitPx = useCallback((px: number) => {
    wrapperWidthRef.current = px || 240;
  }, []);

  const wrap = useCallback(
    (p: number) => {
      if (!loop) return Math.max(0, Math.min(count - 1, p));
      const m = count;
      return ((p % m) + m) % m;
    },
    [count, loop]
  );

  useEffect(() => {
    function tick() {
      if (!draggingRef.current) {
        if (targetOverrideRef.current !== null) {
          const delta = targetOverrideRef.current - positionRef.current;
          velocityRef.current += delta * 0.08;
          velocityRef.current *= 0.78;
          positionRef.current += velocityRef.current;
          if (Math.abs(delta) < 0.001 && Math.abs(velocityRef.current) < 0.001) {
            positionRef.current = targetOverrideRef.current;
            velocityRef.current = 0;
            targetOverrideRef.current = null;
          }
        } else {
          const nearest = Math.round(positionRef.current);
          const speed = Math.abs(velocityRef.current);

          if (speed > 0.0025) {
            positionRef.current += velocityRef.current;
            velocityRef.current *= 0.92;
          } else {
            const delta = nearest - positionRef.current;
            velocityRef.current += delta * 0.09;
            velocityRef.current *= 0.72;
            positionRef.current += velocityRef.current;

            if (Math.abs(delta) < 0.0009 && Math.abs(velocityRef.current) < 0.0009) {
              positionRef.current = nearest;
              velocityRef.current = 0;
            }
          }
        }

        positionRef.current = wrap(positionRef.current);
      }

      // The only React state touch in the whole loop, and only when it
      // actually needs to be — a label or dot indicator doesn't need to
      // know about position at floating-point, sub-frame precision.
      const rounded = ((Math.round(positionRef.current) % count) + count) % count;
      if (rounded !== lastAnnouncedIndex.current) {
        lastAnnouncedIndex.current = rounded;
        setActiveIndex(rounded);
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [wrap, count]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    draggingRef.current = true;
    targetOverrideRef.current = null;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartPos.current = positionRef.current;
    lastX.current = e.clientX;
    lastT.current = performance.now();
    velocityRef.current = 0;
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - dragStartX.current;
      const raw = dragStartPos.current - dx / wrapperWidthRef.current;
      positionRef.current = wrap(raw);

      const now = performance.now();
      const dt = Math.max(now - lastT.current, 1);
      const instV = (-(e.clientX - lastX.current) / wrapperWidthRef.current / dt) * 16;
      velocityRef.current = velocityRef.current * 0.7 + instV * 0.3;
      lastX.current = e.clientX;
      lastT.current = now;
    },
    [wrap]
  );

  const endDrag = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    velocityRef.current = Math.max(-0.35, Math.min(0.35, velocityRef.current));
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 1) return;
    const impulse = (e.deltaY / wrapperWidthRef.current) * 2.1;
    velocityRef.current = Math.max(-0.4, Math.min(0.4, velocityRef.current + impulse));
  }, []);

  const goTo = useCallback(
    (index: number) => {
      let target = index;
      if (loop) {
        let delta = index - positionRef.current;
        delta = (((delta + count / 2) % count) + count) % count - count / 2;
        target = positionRef.current + delta;
      }
      targetOverrideRef.current = target;
    },
    [count, loop]
  );

  return {
    /** Read this inside your own rAF/useFrame loop for smooth, render-free animation. */
    positionRef,
    /** Low-frequency, render-safe: only changes when the active slide actually changes. */
    activeIndex,
    isDragging,
    setUnitPx,
    bind: { onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerLeave: endDrag, onWheel },
    goTo,
  };
}
