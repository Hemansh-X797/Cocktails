'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, MeshTransmissionMaterial, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { splineLatheProfile } from '@/lib/geometry';

/**
 * A procedurally-built wine glass — no external model file. Rather than
 * lathing a raw polyline (which reads as faceted and slightly "broken" at
 * the rim and stem knuckle), the outer silhouette is authored as a small
 * set of anchor points and passed through a Catmull-Rom-style spline, then
 * densely resampled. That's what makes the bowl wall, the stem taper, and
 * the foot lip read as one continuous, hand-blown curve instead of a
 * chain of straight segments. The liquid gets its own, independently
 * sampled curve so the meniscus stays glassy-smooth at any fill level.
 */

// Anchor points from foot to rim, in (radius, height). Kept sparse —
// the spline does the smoothing, more points here would just fight it.
const GLASS_ANCHORS: [number, number][] = [
  [0.0, 0.0],
  [0.52, 0.0],
  [0.5, 0.035],
  [0.07, 0.075],
  [0.065, 0.5],
  [0.06, 0.6],
  [0.16, 0.66],
  [0.44, 0.88],
  [0.53, 1.08],
  [0.535, 1.22],
  [0.47, 1.4],
  [0.35, 1.5],
  [0.345, 1.505],
];

const LIQUID_ANCHORS_BASE: [number, number][] = [
  [0.0, 0.6],
  [0.06, 0.61],
  [0.17, 0.665],
  [0.4, 0.85],
];

function buildLiquidProfile(fillLevel: number): THREE.Vector2[] {
  const anchors: [number, number][] = [...LIQUID_ANCHORS_BASE, [0.5, fillLevel]];
  return splineLatheProfile(anchors, 40);
}

function GlassBody() {
  const points = useMemo(() => splineLatheProfile(GLASS_ANCHORS, 90), []);
  const geometry = useMemo(() => {
    const geo = new THREE.LatheGeometry(points, 96);
    geo.computeVertexNormals();
    return geo;
  }, [points]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <MeshTransmissionMaterial
        transmission={1}
        thickness={0.32}
        roughness={0.015}
        ior={1.52}
        chromaticAberration={0.015}
        anisotropy={0.06}
        distortion={0.06}
        distortionScale={0.15}
        temporalDistortion={0.03}
        clearcoat={1}
        clearcoatRoughness={0.05}
        color="#fefdfb"
        background={new THREE.Color('#050505')}
      />
    </mesh>
  );
}

function Liquid({ fillLevel = 1.02 }: { fillLevel?: number }) {
  const points = useMemo(() => buildLiquidProfile(fillLevel), [fillLevel]);
  const geometry = useMemo(() => {
    const geo = new THREE.LatheGeometry(points, 96);
    geo.computeVertexNormals();
    return geo;
  }, [points]);

  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial
        color="#5e0014"
        roughness={0.1}
        transmission={0.55}
        thickness={1.4}
        ior={1.35}
        emissive="#22000a"
        emissiveIntensity={0.12}
        clearcoat={0.6}
        clearcoatRoughness={0.2}
      />
    </mesh>
  );
}

function Scene({ fillLevel }: { fillLevel: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const pointerLerp = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Slow, autonomous turntable drift — the piece is always alive, never inert.
    const autoY = t * 0.06;

    // Pointer parallax is blended in gently underneath the autonomous drift
    // rather than replacing it, so the object never looks "dead" when the
    // cursor sits still, and never snaps when the cursor arrives.
    pointerLerp.current.x += (state.pointer.y * 0.06 - pointerLerp.current.x) * 0.04;
    pointerLerp.current.y += (state.pointer.x * 0.15 - pointerLerp.current.y) * 0.04;

    groupRef.current.rotation.y = autoY + pointerLerp.current.y;
    groupRef.current.rotation.x = pointerLerp.current.x;
  });

  return (
    <group ref={groupRef} position={[0, -0.78, 0]}>
      <GlassBody />
      <Liquid fillLevel={fillLevel} />
    </group>
  );
}

export function WineGlass3D({ fillLevel = 1.02 }: { fillLevel?: number }) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0.15, 3.6], fov: 32 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Float speed={1.1} rotationIntensity={0.06} floatIntensity={0.45}>
            <Scene fillLevel={fillLevel} />
          </Float>
          <Environment preset="city" />
          <spotLight position={[3, 5, 4]} intensity={2.2} color="#e5c158" angle={0.35} penumbra={1} />
          <spotLight position={[-4, 2, -3]} intensity={1.1} color="#8b0000" angle={0.5} penumbra={1} />
          <spotLight position={[0, -3, 2]} intensity={0.4} color="#ffffff" angle={0.6} penumbra={1} />
          <ambientLight intensity={0.12} />
          <ContactShadows position={[0, -1.55, 0]} opacity={0.55} scale={6} blur={2.4} far={2} color="#000000" />
        </Suspense>
      </Canvas>
    </div>
  );
}
