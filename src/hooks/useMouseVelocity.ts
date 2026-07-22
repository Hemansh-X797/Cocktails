'use client';

import { useEffect, useRef, useState } from 'react';
import { clamp } from '@/lib/utils';

interface VelocityState {
  vx: number;
  vy: number;
  speed: number;
  skew: number;
}

/**
 * Tracks instantaneous mouse velocity, decaying toward zero when the
 * pointer stops. Used to drive velocity-proportional skew/scale on
 * KineticMeshCard and similar components — the faster the cursor moves
 * across a card, the more it visually "drags" in that direction.
 */
export function useMouseVelocity(decay = 0.92, skewLimit = 12): VelocityState {
  const [state, setState] = useState<VelocityState>({ vx: 0, vy: 0, speed: 0, skew: 0 });
  const last = useRef({ x: 0, y: 0, t: performance.now() });
  const frame = useRef<number>();

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      const now = performance.now();
      const dt = Math.max(now - last.current.t, 1);
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;

      const vx = (dx / dt) * 16;
      const vy = (dy / dt) * 16;
      const speed = Math.sqrt(vx * vx + vy * vy);
      const skew = clamp(vx * 0.6, -skewLimit, skewLimit);

      setState({ vx, vy, speed, skew });
      last.current = { x: e.clientX, y: e.clientY, t: now };
    }

    function decayLoop() {
      setState((prev) => ({
        vx: prev.vx * decay,
        vy: prev.vy * decay,
        speed: prev.speed * decay,
        skew: prev.skew * decay,
      }));
      frame.current = requestAnimationFrame(decayLoop);
    }

    window.addEventListener('mousemove', handleMove, { passive: true });
    frame.current = requestAnimationFrame(decayLoop);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [decay, skewLimit]);

  return state;
}
