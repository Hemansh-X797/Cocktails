'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Drives a continuous, fractional "position" value (in item-index units)
 * from three input sources — pointer drag, wheel, and momentum — and
 * settles it toward the nearest whole index with a spring once the input
 * stops. This is the actual mechanism behind a "luxury" scroll feel:
 *
 *  - While dragging, position tracks the pointer 1:1 (no lag, no rubber
 *    banding against the input itself) so the hand always feels obeyed.
 *  - On release, the pointer's recent velocity carries the position
 *    forward (real inertia, not a hard stop).
 *  - Once velocity decays below a threshold, a critically-damped spring
 *    pulls position to the nearest integer — the "magnetic" settle — and
 *    that final glide always eases, it never snaps in a single frame.
 *  - Wheel input is treated as a continuous velocity impulse rather than
 *    "one tick = one slide", so a light touch nudges gently and a hard
 *    flick spins several slides, exactly like a heavy rotary dial.
 *
 * `loop`, when true, wraps position into [0, count) so dragging past the
 * last item continues into the first rather than stopping dead.
 */
export function useMagneticScrub(count: number, opts?: { loop?: boolean }) {
  const loop = opts?.loop ?? true;
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const dragStartX = useRef(0);
  const dragStartPos = useRef(0);
  const lastX = useRef(0);
  const lastT = useRef(0);
  const rafRef = useRef<number>();
  const wrapperWidthRef = useRef(240); // px per "slide" — calibrated by caller via setUnit
  const targetOverrideRef = useRef<number | null>(null);

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
          // Programmatic goTo(): spring-chase an explicit target (which may
          // be more than one index away) rather than only the nearest one.
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
            // Momentum phase: coast, with friction.
            positionRef.current += velocityRef.current;
            velocityRef.current *= 0.92;
          } else {
            // Magnetic settle phase: critically-damped spring to nearest index.
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
        setPosition(positionRef.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [wrap]);

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
      setPosition(positionRef.current);

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
    // Clamp residual velocity so a very fast flick still settles gracefully.
    velocityRef.current = Math.max(-0.35, Math.min(0.35, velocityRef.current));
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (Math.abs(e.deltaY) < 1) return;
      const impulse = (e.deltaY / wrapperWidthRef.current) * 2.1;
      velocityRef.current = Math.max(-0.4, Math.min(0.4, velocityRef.current + impulse));
    },
    []
  );

  const goTo = useCallback(
    (index: number) => {
      // Approach via the shortest cyclic path so clicking a distant dot
      // still glides the short way around rather than the long way.
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
    position,
    isDragging,
    setUnitPx,
    bind: { onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerLeave: endDrag, onWheel },
    goTo,
  };
}
