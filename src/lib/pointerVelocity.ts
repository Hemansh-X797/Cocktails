'use client';

/**
 * Previously, every `useMouseVelocity()` call site (one per card in a
 * grid) ran its own `window.addEventListener('mousemove')` AND its own
 * `requestAnimationFrame` decay loop calling `setState` forever, for the
 * component's whole lifetime — regardless of whether the mouse was
 * moving. On a grid of a dozen cards that's a dozen independent 60fps
 * React re-render loops running simultaneously in the background. That
 * is the actual mechanism behind "the site feels laggy": not any single
 * animation, but a multiplying number of redundant render loops stacking
 * up as the page grows content.
 *
 * The fix: exactly one mousemove listener and one decay loop, ever, at
 * module scope — started lazily on first use, shared by every consumer.
 * Consumers read a plain mutable object inside their own paint loop
 * (already the pattern used by BespokeCursor); nothing here ever calls
 * setState, so it can have as many "subscribers" as the page wants at
 * zero additional render cost.
 */

interface PointerVelocity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  skew: number;
}

export const pointerVelocity: PointerVelocity = { x: 0, y: 0, vx: 0, vy: 0, speed: 0, skew: 0 };

let started = false;
let listenerCount = 0;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function startSingleton(decay: number, skewLimit: number) {
  if (started) return;
  started = true;

  let last = { x: 0, y: 0, t: performance.now() };

  function handleMove(e: MouseEvent) {
    const now = performance.now();
    const dt = Math.max(now - last.t, 1);
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;

    pointerVelocity.x = e.clientX;
    pointerVelocity.y = e.clientY;
    pointerVelocity.vx = (dx / dt) * 16;
    pointerVelocity.vy = (dy / dt) * 16;
    pointerVelocity.speed = Math.sqrt(pointerVelocity.vx ** 2 + pointerVelocity.vy ** 2);
    pointerVelocity.skew = clamp(pointerVelocity.vx * 0.6, -skewLimit, skewLimit);

    last = { x: e.clientX, y: e.clientY, t: now };
  }

  function decayLoop() {
    pointerVelocity.vx *= decay;
    pointerVelocity.vy *= decay;
    pointerVelocity.speed *= decay;
    pointerVelocity.skew *= decay;
    requestAnimationFrame(decayLoop);
  }

  window.addEventListener('mousemove', handleMove, { passive: true });
  requestAnimationFrame(decayLoop);
}

/** Call from a component's mount effect to guarantee the singleton is running. Cheap and idempotent. */
export function ensurePointerVelocityTracking(decay = 0.92, skewLimit = 12) {
  listenerCount += 1;
  startSingleton(decay, skewLimit);
  return () => {
    listenerCount -= 1;
    // Intentionally never torn down once started: the listener/loop cost
    // is negligible (one listener, one rAF, no allocations, no setState),
    // and re-starting it per mount/unmount cycle across many cards would
    // cost more than just leaving it running for the page's lifetime.
  };
}
