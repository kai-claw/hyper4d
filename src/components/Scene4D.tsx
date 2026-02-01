// Main 4D→3D scene renderer

import { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { SHAPE_CATALOG } from '../engine/shapes4d';
import type { Vec3, Vec4 } from '../engine/math4d';
import {
  composeRotations,
  mulMatVec4,
  rotateXY, rotateXZ, rotateXW,
  rotateYZ, rotateYW, rotateZW,
  projectPerspective4Dto3D,
  projectOrthographic4Dto3D,
  projectStereographic4Dto3D,
} from '../engine/math4d';

// Map W-coordinate to color (blue = near, red = far in 4th dimension)
function wToColor(w: number, minW: number, maxW: number): THREE.Color {
  const range = maxW - minW || 1;
  const t = (w - minW) / range;
  const r = t < 0.5 ? t * 2 : 1;
  const g = t < 0.5 ? t * 2 : 2 - t * 2;
  const b = t < 0.5 ? 1 : 2 - t * 2;
  return new THREE.Color(r, g, b);
}

export function Scene4D() {
  const {
    activeShape,
    rotation, autoRotation, isAutoRotating,
    projectionMode, viewDistance,
    showVertices, showEdges, showAxes,
    edgeOpacity, vertexSize,
    showSlice, wSlicePosition, wSliceThickness,
    colorByW,
  } = useStore();

  const rotationRef = useRef({ ...rotation });
  const groupRef = useRef<THREE.Group>(null);

  // Get the current shape
  const shape = useMemo(() => {
    const key = activeShape;
    return SHAPE_CATALOG[key].create(1);
  }, [activeShape]);

  // Project a 4D point to 3D based on projection mode
  const project = useCallback((p: Vec4): Vec3 => {
    switch (projectionMode) {
      case 'orthographic':
        return projectOrthographic4Dto3D(p);
      case 'stereographic':
        return projectStereographic4Dto3D(p, viewDistance);
      default:
        return projectPerspective4Dto3D(p, viewDistance);
    }
  }, [projectionMode, viewDistance]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Update auto-rotation
    if (isAutoRotating) {
      rotationRef.current.xy += autoRotation.xy * delta;
      rotationRef.current.xz += autoRotation.xz * delta;
      rotationRef.current.xw += autoRotation.xw * delta;
      rotationRef.current.yz += autoRotation.yz * delta;
      rotationRef.current.yw += autoRotation.yw * delta;
      rotationRef.current.zw += autoRotation.zw * delta;
    }

    const r = rotationRef.current;
    const totalR = {
      xy: r.xy + rotation.xy,
      xz: r.xz + rotation.xz,
      xw: r.xw + rotation.xw,
      yz: r.yz + rotation.yz,
      yw: r.yw + rotation.yw,
      zw: r.zw + rotation.zw,
    };

    const rotMatrix = composeRotations(
      rotateXY(totalR.xy),
      rotateXZ(totalR.xz),
      rotateXW(totalR.xw),
      rotateYZ(totalR.yz),
      rotateYW(totalR.yw),
      rotateZW(totalR.zw),
    );

    // Transform all vertices
    const transformed: Vec4[] = shape.vertices.map((v: Vec4) => mulMatVec4(rotMatrix, v));
    const projected: Vec3[] = transformed.map((v: Vec4) => project(v));

    // W range for color
    const wValues = transformed.map((v: Vec4) => v[3]);
    const minW = Math.min(...wValues);
    const maxW = Math.max(...wValues);

    // Update vertex meshes
    const vertGroup = groupRef.current.children[1] as THREE.Group;
    if (vertGroup) {
      for (let i = 0; i < projected.length && i < vertGroup.children.length; i++) {
        const mesh = vertGroup.children[i] as THREE.Mesh;
        mesh.visible = showVertices;
        mesh.position.set(projected[i][0], projected[i][1], projected[i][2]);
        mesh.scale.setScalar(vertexSize / 0.06);

        if (showSlice) {
          const w = transformed[i][3];
          mesh.visible = showVertices && Math.abs(w - wSlicePosition) < wSliceThickness;
        }

        if (colorByW) {
          const color = wToColor(transformed[i][3], minW, maxW);
          (mesh.material as THREE.MeshStandardMaterial).color = color;
          (mesh.material as THREE.MeshStandardMaterial).emissive = color;
        }
      }
    }

    // Update edges (using line segments)
    const lineSegments = groupRef.current.children[0] as THREE.LineSegments;
    if (lineSegments) {
      const pos = lineSegments.geometry.attributes.position as THREE.BufferAttribute;
      const col = lineSegments.geometry.attributes.color as THREE.BufferAttribute;

      for (let i = 0; i < shape.edges.length; i++) {
        const [a, b] = shape.edges[i];
        const p1 = projected[a];
        const p2 = projected[b];

        let visible = showEdges;
        if (showSlice) {
          const w1 = transformed[a][3];
          const w2 = transformed[b][3];
          const in1 = Math.abs(w1 - wSlicePosition) < wSliceThickness;
          const in2 = Math.abs(w2 - wSlicePosition) < wSliceThickness;
          visible = showEdges && (in1 || in2);
        }

        if (visible) {
          pos.setXYZ(i * 2, p1[0], p1[1], p1[2]);
          pos.setXYZ(i * 2 + 1, p2[0], p2[1], p2[2]);
        } else {
          // Hide by collapsing to origin
          pos.setXYZ(i * 2, 0, 0, 0);
          pos.setXYZ(i * 2 + 1, 0, 0, 0);
        }

        if (colorByW) {
          const c1 = wToColor(transformed[a][3], minW, maxW);
          const c2 = wToColor(transformed[b][3], minW, maxW);
          col.setXYZ(i * 2, c1.r, c1.g, c1.b);
          col.setXYZ(i * 2 + 1, c2.r, c2.g, c2.b);
        }
      }
      pos.needsUpdate = true;
      col.needsUpdate = true;
    }
  });

  // Create LineSegments geometry
  const linesGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(shape.edges.length * 2 * 3);
    const colors = new Float32Array(shape.edges.length * 2 * 3);
    // Initialize colors to shape color
    const c = new THREE.Color(shape.color);
    for (let i = 0; i < shape.edges.length * 2; i++) {
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [shape.edges.length, activeShape, shape.color]);

  return (
    <group ref={groupRef}>
      {/* Edges as LineSegments */}
      <lineSegments geometry={linesGeo}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={edgeOpacity}
        />
      </lineSegments>

      {/* Vertices */}
      <group>
        {shape.vertices.map((_: Vec4, i: number) => (
          <mesh key={`vert-${activeShape}-${i}`}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial
              color={shape.color}
              emissive={shape.color}
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
      </group>

      {/* 3D Axes */}
      {showAxes && (
        <group>
          <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1.5, 0xff4444]} />
          <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1.5, 0x44ff44]} />
          <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1.5, 0x4444ff]} />
        </group>
      )}
    </group>
  );
}
