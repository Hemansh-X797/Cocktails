'use client';

import { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { lerp } from '@/lib/utils';
import { ShakerMesh, JiggerMesh, RocksGlassMesh } from '@/components/three/ToolMeshes';

const OBJECTS = [
  { key: 'shaker', label: 'Damascus Cobbler Shaker', Mesh: ShakerMesh },
  { key: 'jigger', label: 'Precision Titanium Jigger', Mesh: JiggerMesh },
  { key: 'glass', label: 'Rocks Glass', Mesh: RocksGlassMesh },
];

// Slot 0 = center (facing forward, largest), 1 = right, 2 = left(behind),
// forming the "bent film strip" arc — a shallow curve rather than a flat row.
const SLOTS = [
  { x: 0, z: 0.6, y: 0, rotY: 0, scale: 1.15 },
  { x: 2.1, z: -0.4, y: -0.05, rotY: -0.5, scale: 0.78 },
  { x: -2.1, z: -0.4, y: -0.05, rotY: 0.5, scale: 0.78 },
];

function CarouselObject({
  Mesh,
  slotIndex,
}: {
  Mesh: React.ComponentType;
  slotIndex: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const target = SLOTS[slotIndex];

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    // Continuous per-frame lerp toward the target slot — this is the
    // "magnetic" feel: it always eases toward wherever it's been assigned,
    // smoothly re-targeting mid-flight if the user scrolls again quickly.
    g.position.x = lerp(g.position.x, target.x, 0.09);
    g.position.y = lerp(g.position.y, target.y, 0.09);
    g.position.z = lerp(g.position.z, target.z, 0.09);
    g.rotation.y = lerp(g.rotation.y, target.rotY, 0.09);
    const s = lerp(g.scale.x || target.scale, target.scale, 0.09);
    g.scale.setScalar(s);
  });

  return (
    <group ref={groupRef} position={[target.x, target.y, target.z]} scale={target.scale}>
      <Mesh />
    </group>
  );
}

function Scene({ activeOffset }: { activeOffset: number }) {
  // Each object's current slot = (its original index - activeOffset) mod 3.
  const assignments = useMemo(
    () => OBJECTS.map((_, i) => ((i - activeOffset) % 3 + 3) % 3),
    [activeOffset]
  );

  return (
    <>
      {OBJECTS.map((obj, i) => (
        <Float key={obj.key} speed={1.2} rotationIntensity={0.08} floatIntensity={0.3}>
          <CarouselObject Mesh={obj.Mesh} slotIndex={assignments[i]} />
        </Float>
      ))}
      <Environment preset="studio" />
      <spotLight position={[4, 6, 5]} intensity={2} color="#e5c158" angle={0.5} penumbra={1} />
      <spotLight position={[-4, 2, -4]} intensity={1} color="#8b0000" angle={0.6} penumbra={1} />
      <ambientLight intensity={0.2} />
    </>
  );
}

export function ObjectCarousel3D() {
  const [activeOffset, setActiveOffset] = useState(0);
  const cooldown = useRef(false);

  const advance = useCallback((dir: 1 | -1) => {
    if (cooldown.current) return;
    cooldown.current = true;
    setActiveOffset((prev) => ((prev + dir) % 3 + 3) % 3);
    setTimeout(() => {
      cooldown.current = false;
    }, 500);
  }, []);

  function handleWheel(e: React.WheelEvent) {
    if (Math.abs(e.deltaY) < 4) return;
    advance(e.deltaY > 0 ? 1 : -1);
  }

  const centerIndex = useMemo(
    () => OBJECTS.findIndex((_, i) => (((i - activeOffset) % 3 + 3) % 3) === 0),
    [activeOffset]
  );

  return (
    <div onWheel={handleWheel} className="relative h-[34rem] w-full">
      <Canvas camera={{ position: [0, 0.6, 6], fov: 40 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Scene activeOffset={activeOffset} />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <span className="section-eyebrow">{OBJECTS[centerIndex]?.label}</span>
      </div>

      <div className="absolute bottom-8 right-8 flex gap-3">
        <button
          onClick={() => advance(-1)}
          data-cursor-hover
          aria-label="Previous object"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne/30 text-champagne hover:bg-champagne hover:text-void transition-colors"
        >
          ‹
        </button>
        <button
          onClick={() => advance(1)}
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
