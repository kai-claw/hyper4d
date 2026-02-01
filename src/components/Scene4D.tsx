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
  vec4,
} from '../engine/math4d';

// Enhanced W-depth to color mapping with premium gradients
function wToColor(w: number, minW: number, maxW: number): THREE.Color {
  const range = maxW - minW || 1;
  const t = Math.max(0, Math.min(1, (w - minW) / range));
  
  // Premium color palette: deep blue → cyan → magenta → gold
  if (t < 0.33) {
    const s = t / 0.33;
    return new THREE.Color().lerpColors(
      new THREE.Color(0x0a1a3d), // Deep midnight blue
      new THREE.Color(0x00bcd4), // Cyan
      s
    );
  } else if (t < 0.67) {
    const s = (t - 0.33) / 0.34;
    return new THREE.Color().lerpColors(
      new THREE.Color(0x00bcd4), // Cyan
      new THREE.Color(0xe91e63), // Magenta
      s
    );
  } else {
    const s = (t - 0.67) / 0.33;
    return new THREE.Color().lerpColors(
      new THREE.Color(0xe91e63), // Magenta
      new THREE.Color(0xffc107), // Gold
      s
    );
  }
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
    updateAnimations,
  } = useStore();

  const rotationRef = useRef({ ...rotation });
  const groupRef = useRef<THREE.Group>(null);
  const shapeTransitionRef = useRef({ progress: 1, fromShape: null as any, toShape: null as any });
  const lastActiveShapeRef = useRef(activeShape);
  const lastUpdateRef = useRef({
    rotation: { ...rotation },
    projectionMode,
    viewDistance,
    showSlice,
    wSlicePosition,
    wSliceThickness,
    colorByW,
  });

  // Get the current shape with morphing support
  const shape = useMemo(() => {
    const newShape = SHAPE_CATALOG[activeShape].create(1);
    
    // Start shape transition animation
    if (lastActiveShapeRef.current !== activeShape) {
      const oldShape = SHAPE_CATALOG[lastActiveShapeRef.current].create(1);
      shapeTransitionRef.current = {
        progress: 0,
        fromShape: oldShape,
        toShape: newShape,
      };
      lastActiveShapeRef.current = activeShape;
    }
    
    return newShape;
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

    // Update smooth parameter animations
    updateAnimations(delta);

    // Check if anything that affects the geometry has changed
    const last = lastUpdateRef.current;
    let needsUpdate = false;

    // Update shape transition animation
    if (shapeTransitionRef.current.progress < 1) {
      shapeTransitionRef.current.progress = Math.min(1, shapeTransitionRef.current.progress + delta * 2.5);
      needsUpdate = true;
    }

    // Update auto-rotation with smoother interpolation
    if (isAutoRotating) {
      rotationRef.current.xy += autoRotation.xy * delta;
      rotationRef.current.xz += autoRotation.xz * delta;
      rotationRef.current.xw += autoRotation.xw * delta;
      rotationRef.current.yz += autoRotation.yz * delta;
      rotationRef.current.yw += autoRotation.yw * delta;
      rotationRef.current.zw += autoRotation.zw * delta;
      needsUpdate = true; // Auto-rotation always needs update
    }

    // Update slice animation (MRI scan effect)
    const { isSliceAnimating, sliceAnimationSpeed, setWSlicePosition } = useStore.getState();
    if (isSliceAnimating && showSlice) {
      const speed = sliceAnimationSpeed * delta * 2; // 2 units per second at speed 1
      const newPos = wSlicePosition + speed;
      if (newPos > 2) {
        setWSlicePosition(-2); // Reset to start
      } else {
        setWSlicePosition(newPos);
      }
      needsUpdate = true;
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

    // Check if manual rotation changed
    if (!needsUpdate) {
      for (const key in rotation) {
        if (Math.abs(rotation[key as keyof typeof rotation] - last.rotation[key as keyof typeof rotation]) > 0.001) {
          needsUpdate = true;
          break;
        }
      }
    }

    // Check other properties that affect rendering
    if (!needsUpdate) {
      needsUpdate = 
        last.projectionMode !== projectionMode ||
        Math.abs(last.viewDistance - viewDistance) > 0.01 ||
        last.showSlice !== showSlice ||
        Math.abs(last.wSlicePosition - wSlicePosition) > 0.01 ||
        Math.abs(last.wSliceThickness - wSliceThickness) > 0.01 ||
        last.colorByW !== colorByW;
    }

    if (!needsUpdate) return; // Skip expensive calculations

    // Update last values
    lastUpdateRef.current = {
      rotation: { ...rotation },
      projectionMode,
      viewDistance,
      showSlice,
      wSlicePosition,
      wSliceThickness,
      colorByW,
    };

    const rotMatrix = composeRotations(
      rotateXY(totalR.xy),
      rotateXZ(totalR.xz),
      rotateXW(totalR.xw),
      rotateYZ(totalR.yz),
      rotateYW(totalR.yw),
      rotateZW(totalR.zw),
    );

    // Get vertices (possibly morphed between shapes)
    let currentVertices = shape.vertices;
    if (shapeTransitionRef.current.progress < 1 && shapeTransitionRef.current.fromShape) {
      const t = shapeTransitionRef.current.progress;
      const easeT = t * t * (3 - 2 * t); // Smooth step easing
      const fromShape = shapeTransitionRef.current.fromShape;
      const toShape = shapeTransitionRef.current.toShape;
      
      // Morph vertices between shapes (interpolate positions)
      currentVertices = toShape.vertices.map((toV: Vec4, i: number) => {
        const fromV = fromShape.vertices[i] || toV; // Use toV if fromShape has fewer vertices
        return vec4(
          fromV[0] + (toV[0] - fromV[0]) * easeT,
          fromV[1] + (toV[1] - fromV[1]) * easeT,
          fromV[2] + (toV[2] - fromV[2]) * easeT,
          fromV[3] + (toV[3] - fromV[3]) * easeT,
        );
      });
    }

    // Transform all vertices
    const transformed: Vec4[] = currentVertices.map((v: Vec4) => mulMatVec4(rotMatrix, v));
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
      {/* Edges with glow effect */}
      <lineSegments geometry={linesGeo}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={edgeOpacity}
          linewidth={2}
          toneMapped={false}
        />
      </lineSegments>
      
      {/* Second layer for glow effect */}
      <lineSegments geometry={linesGeo}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={edgeOpacity * 0.3}
          linewidth={4}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Vertices with enhanced glow */}
      <group>
        {shape.vertices.map((_: Vec4, i: number) => (
          <group key={`vert-${activeShape}-${i}`}>
            {/* Main vertex */}
            <mesh>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial
                color={shape.color}
                emissive={shape.color}
                emissiveIntensity={0.4}
                metalness={0.1}
                roughness={0.2}
                toneMapped={false}
              />
            </mesh>
            {/* Glow halo */}
            <mesh>
              <sphereGeometry args={[0.09, 12, 12]} />
              <meshBasicMaterial
                color={shape.color}
                transparent
                opacity={0.2}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* 4D Cross-section plane visualization */}
      {showSlice && (
        <mesh position={[0, 0, wSlicePosition * 2]}>
          <planeGeometry args={[4, 4]} />
          <meshBasicMaterial
            color="#4fc3f7"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* 3D Axes */}
      {showAxes && (
        <group>
          <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1.5, 0xff4444]} />
          <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1.5, 0x44ff44]} />
          <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1.5, 0x4444ff]} />
          {/* W-axis indicator */}
          <mesh position={[2, 2, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial 
              color="#ab47bc"
              emissive="#ab47bc"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
