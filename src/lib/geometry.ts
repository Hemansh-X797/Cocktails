import * as THREE from 'three';

/**
 * Resamples a sparse set of (radius, height) anchor points through a
 * spline so LatheGeometry profiles read as one continuous hand-blown or
 * hand-turned curve rather than a chain of straight segments. Used by
 * every glass/vessel mesh in the app so nothing looks faceted or "cut
 * from cardboard" up close.
 */
export function splineLatheProfile(
  anchors: [number, number][],
  samples = 64
): THREE.Vector2[] {
  const pts = anchors.map(([r, h]) => new THREE.Vector2(r, h));
  const curve = new THREE.SplineCurve(pts);
  const out: THREE.Vector2[] = [];
  for (let i = 0; i <= samples; i++) {
    out.push(curve.getPoint(i / samples));
  }
  return out;
}
