'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, MeshTransmissionMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * A procedurally-built wine glass — no external model file. The bowl,
 * stem, and foot are all one revolved silhouette (THREE.LatheGeometry),
 * rendered with a physically-based transmission material for real glass
 * refraction. A separate, slightly-inset lathe holds the "liquid" — a deep
 * ruby mesh whose height is set below the rim so it reads as a pour, not
 * a full glass.
 */

function buildGlassProfile(): THREE.Vector2[] {
  // Points trace the outer silhouette from foot to rim, in (radius, height).
  return [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.55, 0.0),
    new THREE.Vector2(0.55, 0.04),
    new THREE.Vector2(0.08, 0.08),
    new THREE.Vector2(0.06, 0.55),
    new THREE.Vector2(0.05, 0.6),
    new THREE.Vector2(0.05, 0.62),
    new THREE.Vector2(0.32, 0.72),
    new THREE.Vector2(0.5, 0.95),
    new THREE.Vector2(0.56, 1.15),
    new THREE.Vector2(0.5, 1.35),
    new THREE.Vector2(0.36, 1.46),
    new THREE.Vector2(0.34, 1.47),
    new THREE.Vector2(0.36, 1.475),
    new THREE.Vector2(0.34, 1.48),
  ];
}

function buildLiquidProfile(fillLevel: number): THREE.Vector2[] {
  // A shorter profile matching the bowl's interior curve up to fillLevel.
  return [
    new THREE.Vector2(0.0, 0.63),
    new THREE.Vector2(0.05, 0.63),
    new THREE.Vector2(0.3, 0.7),
    new THREE.Vector2(0.46, 0.9),
    new THREE.Vector2(0.5, fillLevel),
  ];
}

function GlassBody() {
  const points = useMemo(buildGlassProfile, []);
  const geometry = useMemo(
    () => new THREE.LatheGeometry(points, 64),
    [points]
  );

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <MeshTransmissionMaterial
        transmission={1}
        thickness={0.35}
        roughness={0.02}
        ior={1.5}
        chromaticAberration={0.02}
        anisotropy={0.1}
        distortion={0.1}
        distortionScale={0.2}
        temporalDistortion={0.05}
        color="#fefdfb"
        background={new THREE.Color('#050505')}
      />
    </mesh>
  );
}

function Liquid({ fillLevel = 1.05 }: { fillLevel?: number }) {
  const points = useMemo(() => buildLiquidProfile(fillLevel), [fillLevel]);
  const geometry = useMemo(() => new THREE.LatheGeometry(points, 64), [points]);

  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial
        color="#6b0016"
        roughness={0.15}
        transmission={0.6}
        thickness={1.2}
        ior={1.33}
        emissive="#2a0008"
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

function Scene({ fillLevel }: { fillLevel: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.15) * 0.4 + t * 0.08;
    // Subtle parallax toward pointer position.
    groupRef.current.rotation.x = state.pointer.y * 0.08;
  });

  return (
    <group ref={groupRef} position={[0, -0.75, 0]}>
      <GlassBody />
      <Liquid fillLevel={fillLevel} />
    </group>
  );
}

export function WineGlass3D({ fillLevel = 1.05 }: { fillLevel?: number }) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0.2, 3.4], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.6}>
            <Scene fillLevel={fillLevel} />
          </Float>
          <Environment preset="city" />
          <spotLight position={[3, 5, 4]} intensity={2} color="#e5c158" angle={0.4} penumbra={1} />
          <spotLight position={[-4, 2, -3]} intensity={1.2} color="#8b0000" angle={0.5} penumbra={1} />
          <ambientLight intensity={0.15} />
        </Suspense>
      </Canvas>
    </div>
  );
}
