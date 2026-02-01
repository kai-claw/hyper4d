// Main 4D→3D scene renderer - OPTIMIZED FOR PERFORMANCE

import { useRef, useMemo, useCallback, useEffect } from 'react';
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
import { wToColorCached } from '../utils/ColorCache';
import { HyperEdgeMaterial, HyperVertexMaterial } from '../materials/HyperShader';
import { ParticleSystem } from '../effects/ParticleSystem';
import { AmbientAudio } from '../audio/AmbientAudio';

// Performance constants
const UPDATE_THRESHOLD = 0.001;
const MORPH_SPEED = 2.5;

// Pre-allocated objects to avoid GC pressure
const _tempColor = new THREE.Color();

// Memory pool for matrix caching
const _rotationMatrixCache = new Map<string, any>();
const _lastTransformCache = {
  vertices: [] as Vec4[],
  projected: [] as Vec3[],
  wValues: [] as number[],
  minW: 0,
  maxW: 0,
};

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
    colorTheme,
    enableShaderEffects,
    pulseSpeed,
    isAudioMuted,
    audioVolume,
  } = useStore();

  const rotationRef = useRef({ ...rotation });
  const groupRef = useRef<THREE.Group>(null);
  const particleSystemRef = useRef<any>(null);
  const audioSystemRef = useRef<AmbientAudio | null>(null);
  const shapeTransitionRef = useRef({ progress: 1, fromShape: null as any, toShape: null as any });
  const lastActiveShapeRef = useRef(activeShape);
  const lastWSlicePosition = useRef(wSlicePosition);
  const lastUpdateRef = useRef({
    rotation: { ...rotation },
    projectionMode,
    viewDistance,
    showSlice,
    wSlicePosition,
    wSliceThickness,
    colorByW,
  });
  
  // Shader materials
  const edgeMaterialRef = useRef<HyperEdgeMaterial | null>(null);
  const vertexMaterialRef = useRef<HyperVertexMaterial | null>(null);

  // Initialize audio system
  useEffect(() => {
    const audio = new AmbientAudio();
    audioSystemRef.current = audio;
    
    // Add click listener to start audio (Web Audio requires user gesture)
    const handleUserGesture = () => {
      audio.startWithUserGesture();
      document.removeEventListener('click', handleUserGesture);
    };
    document.addEventListener('click', handleUserGesture);
    
    return () => {
      document.removeEventListener('click', handleUserGesture);
      audio.dispose();
    };
  }, []);
  
  // Update audio settings
  useEffect(() => {
    if (audioSystemRef.current) {
      audioSystemRef.current.setMuted(isAudioMuted);
      audioSystemRef.current.setVolume(audioVolume);
    }
  }, [isAudioMuted, audioVolume]);
  
  useEffect(() => {
    if (audioSystemRef.current) {
      audioSystemRef.current.setShape(activeShape);
    }
  }, [activeShape]);

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

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const time = state.clock.elapsedTime;

    // Update smooth parameter animations
    updateAnimations(delta);
    
    // Update shader materials time
    if (enableShaderEffects) {
      if (edgeMaterialRef.current) {
        edgeMaterialRef.current.updateTime(time);
        edgeMaterialRef.current.setPulseSpeed(pulseSpeed);
      }
      if (vertexMaterialRef.current) {
        vertexMaterialRef.current.updateTime(time);
        vertexMaterialRef.current.setPulseSpeed(pulseSpeed);
      }
    }

    // Check if anything that affects the geometry has changed
    const last = lastUpdateRef.current;
    let needsUpdate = false;

    // Update shape transition animation
    if (shapeTransitionRef.current.progress < 1) {
      shapeTransitionRef.current.progress = Math.min(1, shapeTransitionRef.current.progress + delta * MORPH_SPEED);
      needsUpdate = true;
    }

    // Update auto-rotation with smoother interpolation
    const autoRotationActive = isAutoRotating;
    if (autoRotationActive) {
      rotationRef.current.xy += autoRotation.xy * delta;
      rotationRef.current.xz += autoRotation.xz * delta;
      rotationRef.current.xw += autoRotation.xw * delta;
      rotationRef.current.yz += autoRotation.yz * delta;
      rotationRef.current.yw += autoRotation.yw * delta;
      rotationRef.current.zw += autoRotation.zw * delta;
      needsUpdate = true; // Auto-rotation always needs update
    }

    // Update slice animation (MRI scan effect) - batched store access
    const storeState = useStore.getState();
    if (storeState.isSliceAnimating && showSlice) {
      const speed = storeState.sliceAnimationSpeed * delta * 2; // 2 units per second at speed 1
      const newPos = wSlicePosition + speed;
      if (newPos > 2) {
        storeState.setWSlicePosition(-2); // Reset to start
      } else {
        storeState.setWSlicePosition(newPos);
      }
      needsUpdate = true;
      
      // Detect when slice crosses vertices for audio/particle effects
      const sliceMovement = Math.abs(newPos - lastWSlicePosition.current);
      if (sliceMovement > 0.1) { // Threshold to avoid too many triggers
        checkCrossSectionEvents(newPos, lastWSlicePosition.current);
        lastWSlicePosition.current = newPos;
      }
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

    // Check if manual rotation changed (optimized comparison)
    if (!needsUpdate) {
      const rotKeys = Object.keys(rotation) as (keyof typeof rotation)[];
      for (let i = 0; i < rotKeys.length; i++) {
        const key = rotKeys[i];
        if (Math.abs(rotation[key] - last.rotation[key]) > UPDATE_THRESHOLD) {
          needsUpdate = true;
          break;
        }
      }
    }

    // Check other properties that affect rendering (optimized)
    if (!needsUpdate) {
      needsUpdate = 
        last.projectionMode !== projectionMode ||
        Math.abs(last.viewDistance - viewDistance) > 0.01 ||
        last.showSlice !== showSlice ||
        Math.abs(last.wSlicePosition - wSlicePosition) > 0.01 ||
        Math.abs(last.wSliceThickness - wSliceThickness) > 0.01 ||
        last.colorByW !== colorByW;
    }

    if (!needsUpdate) return; // Skip expensive calculations - EARLY RETURN

    // Calculate rotation speed for audio feedback
    const rotationSpeed = Math.sqrt(
      totalR.xy * totalR.xy + totalR.xz * totalR.xz + totalR.xw * totalR.xw +
      totalR.yz * totalR.yz + totalR.yw * totalR.yw + totalR.zw * totalR.zw
    );
    
    // Update audio with rotation speed
    if (audioSystemRef.current) {
      audioSystemRef.current.setRotationSpeed(rotationSpeed);
    }

    // Update last values (deep copy avoided where possible)
    Object.assign(lastUpdateRef.current.rotation, rotation);
    lastUpdateRef.current.projectionMode = projectionMode;
    lastUpdateRef.current.viewDistance = viewDistance;
    lastUpdateRef.current.showSlice = showSlice;
    lastUpdateRef.current.wSlicePosition = wSlicePosition;
    lastUpdateRef.current.wSliceThickness = wSliceThickness;
    lastUpdateRef.current.colorByW = colorByW;

    // Cache rotation matrix computation
    const rotKey = `${totalR.xy.toFixed(3)},${totalR.xz.toFixed(3)},${totalR.xw.toFixed(3)},${totalR.yz.toFixed(3)},${totalR.yw.toFixed(3)},${totalR.zw.toFixed(3)}`;
    let rotMatrix = _rotationMatrixCache.get(rotKey);
    if (!rotMatrix) {
      rotMatrix = composeRotations(
        rotateXY(totalR.xy),
        rotateXZ(totalR.xz),
        rotateXW(totalR.xw),
        rotateYZ(totalR.yz),
        rotateYW(totalR.yw),
        rotateZW(totalR.zw),
      );
      // Limit cache size to prevent memory bloat
      if (_rotationMatrixCache.size > 100) {
        _rotationMatrixCache.clear();
      }
      _rotationMatrixCache.set(rotKey, rotMatrix);
    }

    // Get vertices (possibly morphed between shapes) - OPTIMIZED
    let currentVertices = shape.vertices;
    if (shapeTransitionRef.current.progress < 1 && shapeTransitionRef.current.fromShape) {
      const t = shapeTransitionRef.current.progress;
      const easeT = t * t * (3 - 2 * t); // Smooth step easing
      const fromShape = shapeTransitionRef.current.fromShape;
      const toShape = shapeTransitionRef.current.toShape;
      
      // Morph vertices between shapes (reuse cache array to avoid allocation)
      if (_lastTransformCache.vertices.length !== toShape.vertices.length) {
        _lastTransformCache.vertices = new Array(toShape.vertices.length);
      }
      
      for (let i = 0; i < toShape.vertices.length; i++) {
        const toV = toShape.vertices[i];
        const fromV = fromShape.vertices[i] || toV;
        
        if (!_lastTransformCache.vertices[i]) {
          _lastTransformCache.vertices[i] = vec4(0, 0, 0, 0);
        }
        
        const target = _lastTransformCache.vertices[i];
        target[0] = fromV[0] + (toV[0] - fromV[0]) * easeT;
        target[1] = fromV[1] + (toV[1] - fromV[1]) * easeT;
        target[2] = fromV[2] + (toV[2] - fromV[2]) * easeT;
        target[3] = fromV[3] + (toV[3] - fromV[3]) * easeT;
      }
      currentVertices = _lastTransformCache.vertices;
    }

    // Transform all vertices - REUSE ARRAYS
    const vertexCount = currentVertices.length;
    if (_lastTransformCache.projected.length !== vertexCount) {
      _lastTransformCache.projected = new Array(vertexCount);
      _lastTransformCache.wValues = new Array(vertexCount);
      for (let i = 0; i < vertexCount; i++) {
        _lastTransformCache.projected[i] = [0, 0, 0];
        _lastTransformCache.wValues[i] = 0;
      }
    }

    const transformed = _lastTransformCache.vertices.length === vertexCount ? _lastTransformCache.vertices : currentVertices;
    const projected = _lastTransformCache.projected;
    const wValues = _lastTransformCache.wValues;
    
    // Transform and project in one loop to avoid multiple iterations
    let minW = Infinity;
    let maxW = -Infinity;
    
    for (let i = 0; i < vertexCount; i++) {
      const v = currentVertices[i];
      // Transform vertex
      const transformedV = mulMatVec4(rotMatrix, v);
      if (transformed !== currentVertices) {
        transformed[i] = transformedV;
      }
      
      // Project to 3D
      const proj = project(transformedV);
      projected[i][0] = proj[0];
      projected[i][1] = proj[1];
      projected[i][2] = proj[2];
      
      // Track W values for coloring
      const w = transformedV[3];
      wValues[i] = w;
      if (w < minW) minW = w;
      if (w > maxW) maxW = w;
    }
    
    _lastTransformCache.minW = minW;
    _lastTransformCache.maxW = maxW;
    
    // Update shader materials with W range and theme
    if (enableShaderEffects) {
      if (edgeMaterialRef.current) {
        edgeMaterialRef.current.updateWRange(minW, maxW);
        edgeMaterialRef.current.updateTheme(colorTheme);
      }
      if (vertexMaterialRef.current) {
        vertexMaterialRef.current.updateWRange(minW, maxW);
        vertexMaterialRef.current.updateTheme(colorTheme);
        vertexMaterialRef.current.setRotationSpeed(rotationSpeed);
      }
    }

    // Update vertex meshes - OPTIMIZED
    const vertGroup = groupRef.current.children[1] as THREE.Group;
    if (vertGroup) {
      for (let i = 0; i < vertexCount && i < vertGroup.children.length; i++) {
        const mesh = vertGroup.children[i] as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;
        const pos = projected[i];
        
        mesh.position.set(pos[0], pos[1], pos[2]);
        mesh.scale.setScalar(vertexSize / 0.06);

        // Visibility check
        let visible = showVertices;
        if (showSlice) {
          const w = wValues[i];
          visible = showVertices && Math.abs(w - wSlicePosition) < wSliceThickness;
        }
        mesh.visible = visible;

        // Color update (avoid object creation)
        if (visible && colorByW) {
          wToColorCached(wValues[i], minW, maxW, _tempColor);
          material.color.copy(_tempColor);
          material.emissive.copy(_tempColor);
        }
      }
    }

    // Update edges (using line segments) - OPTIMIZED
    const lineSegments = groupRef.current.children[0] as THREE.LineSegments;
    if (lineSegments) {
      const pos = lineSegments.geometry.attributes.position as THREE.BufferAttribute;
      const col = lineSegments.geometry.attributes.color as THREE.BufferAttribute;

      for (let i = 0; i < shape.edges.length; i++) {
        const [a, b] = shape.edges[i];
        const p1 = projected[a];
        const p2 = projected[b];
        const i2 = i * 2;
        const i2plus1 = i2 + 1;

        let visible = showEdges;
        if (showSlice) {
          const w1 = wValues[a];
          const w2 = wValues[b];
          const in1 = Math.abs(w1 - wSlicePosition) < wSliceThickness;
          const in2 = Math.abs(w2 - wSlicePosition) < wSliceThickness;
          visible = showEdges && (in1 || in2);
        }

        if (visible) {
          pos.setXYZ(i2, p1[0], p1[1], p1[2]);
          pos.setXYZ(i2plus1, p2[0], p2[1], p2[2]);
        } else {
          // Hide by collapsing to origin
          pos.setXYZ(i2, 0, 0, 0);
          pos.setXYZ(i2plus1, 0, 0, 0);
        }

        if (colorByW) {
          wToColorCached(wValues[a], minW, maxW, _tempColor);
          col.setXYZ(i2, _tempColor.r, _tempColor.g, _tempColor.b);
          
          wToColorCached(wValues[b], minW, maxW, _tempColor);
          col.setXYZ(i2plus1, _tempColor.r, _tempColor.g, _tempColor.b);
        }
      }
      pos.needsUpdate = true;
      col.needsUpdate = true;
      // Add trail particles for rotating vertices
      if (enableShaderEffects && rotationSpeed > 0.1) {
        for (let i = 0; i < Math.min(projected.length, 20); i++) { // Limit for performance
          if (Math.random() < 0.05) {
            const pos = new THREE.Vector3(...projected[i]);
            if (particleSystemRef.current?.addTrailParticle) {
              particleSystemRef.current.addTrailParticle(pos, rotationSpeed);
            }
          }
        }
      }
    }
  });

  // Helper function to detect cross-section events
  const checkCrossSectionEvents = useCallback((newSlicePos: number, oldSlicePos: number) => {
    if (!enableShaderEffects || !shape.vertices) return;
    
    for (let i = 0; i < shape.vertices.length; i++) {
      const w = shape.vertices[i][3];
      
      // Check if vertex crossed the slice plane
      if ((oldSlicePos <= w && newSlicePos > w) || (oldSlicePos >= w && newSlicePos < w)) {
        // Vertex crossed the slice plane - trigger effects
        const projected3D = project(shape.vertices[i]);
        const position = new THREE.Vector3(projected3D[0], projected3D[1], projected3D[2]);
        
        // Trigger particle burst
        if (particleSystemRef.current?.triggerCrossSectionBurst) {
          particleSystemRef.current.triggerCrossSectionBurst(position);
        }
        
        // Trigger audio event
        if (audioSystemRef.current) {
          audioSystemRef.current.onCrossSectionEvent();
        }
        
        break; // Only trigger once per frame to avoid spam
      }
    }
  }, [enableShaderEffects, shape.vertices, project]);

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

  // Initialize shader materials
  if (enableShaderEffects && !edgeMaterialRef.current) {
    edgeMaterialRef.current = new HyperEdgeMaterial(colorTheme);
  }
  if (enableShaderEffects && !vertexMaterialRef.current) {
    vertexMaterialRef.current = new HyperVertexMaterial(colorTheme);
  }

  return (
    <group ref={groupRef}>
      {/* Edges with custom shader or basic material */}
      <lineSegments geometry={linesGeo}>
        {enableShaderEffects && edgeMaterialRef.current ? (
          <primitive object={edgeMaterialRef.current} attach="material" />
        ) : (
          <lineBasicMaterial
            vertexColors
            transparent
            opacity={edgeOpacity}
            linewidth={2}
            toneMapped={false}
          />
        )}
      </lineSegments>
      
      {/* Second layer for glow effect (only with basic materials) */}
      {!enableShaderEffects && (
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
      )}
      
      {/* Particle system */}
      <ParticleSystem ref={particleSystemRef} />

      {/* Vertices with enhanced glow */}
      <group>
        {shape.vertices.map((_: Vec4, i: number) => (
          <group key={`vert-${activeShape}-${i}`}>
            {/* Main vertex */}
            <mesh>
              <sphereGeometry args={[0.06, 16, 16]} />
              {enableShaderEffects && vertexMaterialRef.current ? (
                <primitive object={vertexMaterialRef.current} attach="material" />
              ) : (
                <meshStandardMaterial
                  color={shape.color}
                  emissive={shape.color}
                  emissiveIntensity={0.4}
                  metalness={0.1}
                  roughness={0.2}
                  toneMapped={false}
                />
              )}
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
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
