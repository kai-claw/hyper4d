// Subtle grid floor for spatial reference

import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

export function GridFloor() {
  const showGrid = useStore((s) => s.showGrid);

  const gridGeometry = useMemo(() => {
    const size = 10;
    const divisions = 20;
    const step = size / divisions;
    const half = size / 2;
    const vertices: number[] = [];

    for (let i = 0; i <= divisions; i++) {
      const pos = -half + i * step;
      // Lines along X
      vertices.push(-half, 0, pos, half, 0, pos);
      // Lines along Z
      vertices.push(pos, 0, -half, pos, 0, half);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geo;
  }, []);

  const crossGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array([
      -5, 0, 0, 5, 0, 0,
      0, 0, -5, 0, 0, 5,
    ]);
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  if (!showGrid) return null;

  return (
    <group position={[0, -2, 0]}>
      <lineSegments geometry={gridGeometry}>
        <lineBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.04}
          depthWrite={false}
        />
      </lineSegments>
      {/* Center cross slightly brighter */}
      <lineSegments geometry={crossGeometry}>
        <lineBasicMaterial color="#4fc3f7" transparent opacity={0.08} />
      </lineSegments>
    </group>
  );
}
