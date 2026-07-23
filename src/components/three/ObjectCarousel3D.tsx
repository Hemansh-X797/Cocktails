'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useMagneticScrub } from '@/hooks/useMagneticScrub';
import { ShakerMesh, JiggerMesh, RocksGlassMesh } from '@/components/three/ToolMeshes';

const OBJECTS = [
  { key: 'shaker', label: 'Damascus Cobbler Shaker', Mesh: ShakerMesh },
  { key: 'jigger', label: 'Precision Titanium Jigger', Mesh: JiggerMesh },
  { key: 'glass', label: 'Rocks Glass', Mesh: RocksGlassMesh },
];

const N = OBJECTS.length;
const UNIT_PX = 420;

// Continuous arc: given a signed offset from the active slot (can be any
// real number, not just -1/0/1), returns a placement along the same bent
// "film strip" curve the old version only snapped between. This is what
// lets the whole thing be scrubbed by hand instead of ticking discretely.
function arcPlacement(offset: number) {
  const clamped = THREE.MathUtils.clamp(offset, -1.6, 1.6);
  const x = clamped * 2.1;
  const z = 0.6 - Math.abs(clamped) * (0.6 + 0.4 * Math.abs(clamped));
  const y = -0.05 * Math.abs(clamped);
  const rotY = -clamped * 0.5;
  const scale = THREE.MathUtils.lerp(1.15, 0.72, Math.min(Math.abs(clamped), 1));
  return { x, y, z, rotY, scale };
}

function CarouselObject({ Mesh, offset }: { Mesh: React.ComponentType; offset: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const target = arcPlacement(offset);
    g.position.set(target.x, target.y, target.z);
    g.rotation.y = target.rotY;
    g.scale.setScalar(target.scale);
  });

  return (
    <group ref={groupRef}>
      <Mesh />
    </group>
  );
}

function Scene({ position }: { position: number }) {
  return (
    <>
      {OBJECTS.map((obj, i) => {
        let offset = i - position;
        offset = ((offset + N / 2) % N + N) % N - N / 2;
        return (
          <Float key={obj.key} speed={1.2} rotationIntensity={0.06} floatIntensity={0.25}>
            <CarouselObject Mesh={obj.Mesh} offset={offset} />
          </Float>
        );
      })}
      <Environment preset="studio" />
      <spotLight position={[4, 6, 5]} intensity={2} color="#e5c158" angle={0.5} penumbra={1} />
      <spotLight position={[-4, 2, -4]} intensity={1} color="#8b0000" angle={0.6} penumbra={1} />
      <ambientLight intensity={0.2} />
    </>
  );
}

export function ObjectCarousel3D() {
  const { position, isDragging, setUnitPx, bind, goTo } = useMagneticScrub(N);

  useEffect(() => {
    setUnitPx(UNIT_PX);
  }, [setUnitPx]);

  const centerIndex = Math.round(((position % N) + N) % N);

  return (
    <div
      {...bind}
      className="relative h-[34rem] w-full touch-pan-y select-none"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <Canvas camera={{ position: [0, 0.6, 6], fov: 40 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Scene position={position} />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <span className="section-eyebrow">{OBJECTS[centerIndex]?.label}</span>
      </div>

      <div className="absolute bottom-8 right-8 flex gap-3">
        <button
          onClick={() => goTo(centerIndex - 1)}
          data-cursor-hover
          aria-label="Previous object"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne/30 text-champagne hover:bg-champagne hover:text-void transition-colors"
        >
          ‹
        </button>
        <button
          onClick={() => goTo(centerIndex + 1)}
          data-cursor-hover
          aria-label="Next object"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne/30 text-champagne hover:bg-champagne hover:text-void transition-colors"
        >
          ›
        </button>
      </div>
    </div>
  );
}
