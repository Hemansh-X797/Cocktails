'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

/** A cobbler shaker: cylindrical body, tapered cap, small cap-of-the-cap. */
export function ShakerMesh() {
  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.5, 1.4, 32]} />
        <meshStandardMaterial color="#d8d8dc" metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.55, 0.3, 32]} />
        <meshStandardMaterial color="#c9c9cf" metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.42, 0.35, 32]} />
        <meshStandardMaterial color="#bfbfc6" metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.34, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.22, 0.12, 32]} />
        <meshStandardMaterial color="#e5c158" metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
  );
}

/** A jigger: two truncated cones joined at their narrow ends (hourglass). */
export function JiggerMesh() {
  const geometry = useMemo(() => {
    const points = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.38, 0.0),
      new THREE.Vector2(0.38, 0.06),
      new THREE.Vector2(0.12, 0.45),
      new THREE.Vector2(0.1, 0.5),
      new THREE.Vector2(0.12, 0.55),
      new THREE.Vector2(0.3, 0.92),
      new THREE.Vector2(0.3, 1.0),
    ];
    return new THREE.LatheGeometry(points, 32);
  }, []);

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.3} />
    </mesh>
  );
}

/** A rocks/tumbler glass, built the same lathe-revolve way as the hero wine glass. */
export function RocksGlassMesh() {
  const geometry = useMemo(() => {
    const points = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.5, 0.0),
      new THREE.Vector2(0.5, 0.05),
      new THREE.Vector2(0.48, 0.75),
      new THREE.Vector2(0.5, 0.85),
      new THREE.Vector2(0.52, 0.86),
    ];
    return new THREE.LatheGeometry(points, 48);
  }, []);

  return (
    <mesh geometry={geometry} castShadow>
      <meshPhysicalMaterial
        transmission={0.95}
        thickness={0.4}
        roughness={0.05}
        ior={1.5}
        color="#fefdfb"
      />
    </mesh>
  );
}
