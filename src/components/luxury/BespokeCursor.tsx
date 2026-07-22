'use client';

import { useEffect, useRef } from 'react';
import { lerp } from '@/lib/utils';

/**
 * A single dot that lerps toward the real cursor position each frame
 * (rather than snapping to it), and scales up when hovering anything
 * interactive. `mix-blend-mode: difference` means it's always visible
 * regardless of what's underneath — no color coordination needed.
 */
export function BespokeCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const scale = useRef(1);
  const targetScale = useRef(1);
  const frame = useRef<number>();

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;

    function handleMove(e: MouseEvent) {
      target.current.x = e.clientX;
      target.current.y = e.clientY;

      const el = e.target as HTMLElement;
      const interactive = el.closest('a, button, [data-cursor-hover]');
      targetScale.current = interactive ? 2.4 : 1;
    }

    function tick() {
      pos.current.x = lerp(pos.current.x, target.current.x, 0.18);
      pos.current.y = lerp(pos.current.y, target.current.y, 0.18);
      scale.current = lerp(scale.current, targetScale.current, 0.15);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%) scale(${scale.current})`;
      }
      frame.current = requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', handleMove, { passive: true });
    frame.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  return <div ref={dotRef} className="bespoke-cursor" aria-hidden="true" />;
}
