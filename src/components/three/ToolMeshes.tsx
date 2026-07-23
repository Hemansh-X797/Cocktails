'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { splineLatheProfile } from '@/lib/geometry';

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

/** A jigger: two truncated cones joined at their narrow ends (hourglass), smoothed. */
export function JiggerMesh() {
  const geometry = useMemo(() => {
    const anchors: [number, number][] = [
      [0.0, 0.0],
      [0.38, 0.0],
      [0.37, 0.055],
      [0.13, 0.43],
      [0.1, 0.5],
      [0.13, 0.57],
      [0.29, 0.9],
      [0.295, 1.0],
    ];
    const points = splineLatheProfile(anchors, 48);
    const geo = new THREE.LatheGeometry(points, 40);
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.28} />
    </mesh>
  );
}

/** A rocks/tumbler glass, spline-smoothed the same way as the hero wine glass. */
export function RocksGlassMesh() {
  const geometry = useMemo(() => {
    const anchors: [number, number][] = [
      [0.0, 0.0],
      [0.5, 0.0],
      [0.49, 0.05],
      [0.465, 0.7],
      [0.48, 0.82],
      [0.5, 0.86],
    ];
    const points = splineLatheProfile(anchors, 48);
    const geo = new THREE.LatheGeometry(points, 56);
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} castShadow>
      <meshPhysicalMaterial
        transmission={0.95}
        thickness={0.4}
        roughness={0.04}
        ior={1.5}
        clearcoat={0.8}
        clearcoatRoughness={0.08}
        color="#fefdfb"
      />
    </mesh>
  );
}
