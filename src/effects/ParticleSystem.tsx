// Particle effects for 4D visualization - subtle and aesthetic

import React, { useRef, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

interface ParticleData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  color: THREE.Color;
}

export interface ParticleSystemHandle {
  triggerCrossSectionBurst: (position: THREE.Vector3) => void;
  addTrailParticle: (position: THREE.Vector3, speed: number) => void;
}

const MAX_PARTICLES = 200;
const PARTICLE_LIFETIME = 2.0; // seconds

export const ParticleSystem = forwardRef<ParticleSystemHandle>(function ParticleSystem(_props, ref) {
  const { colorTheme, enableShaderEffects } = useStore();
  const particlesRef = useRef<THREE.Points>(null);
  const particleData = useRef<ParticleData[]>([]);
  const nextParticleIndex = useRef(0);
  
  // Pre-allocate particle arrays for performance
  const positions = useMemo(() => new Float32Array(MAX_PARTICLES * 3), []);
  const colors = useMemo(() => new Float32Array(MAX_PARTICLES * 3), []);
  const sizes = useMemo(() => new Float32Array(MAX_PARTICLES), []);
  const alphas = useMemo(() => new Float32Array(MAX_PARTICLES), []);
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    return geo;
  }, [positions, colors, sizes, alphas]);
  
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: /* glsl */ `
        attribute float size;
        attribute float alpha;
        varying float vAlpha;
        varying vec3 vColor;
        
        void main() {
          vAlpha = alpha;
          vColor = color;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vAlpha;
        varying vec3 vColor;
        
        void main() {
          // Create a soft circular particle
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          float alpha = (1.0 - smoothstep(0.3, 0.5, dist)) * vAlpha;
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      vertexColors: true,
    });
  }, []);
  
  // Initialize particle pool
  for (let i = 0; i < MAX_PARTICLES; i++) {
    if (!particleData.current[i]) {
      particleData.current[i] = {
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: PARTICLE_LIFETIME,
        size: 0,
        color: new THREE.Color(),
      };
    }
  }
  
  const addParticle = useCallback((position: THREE.Vector3, velocity?: THREE.Vector3, color?: THREE.Color, size = 8) => {
    if (!enableShaderEffects) return;
    
    const particle = particleData.current[nextParticleIndex.current];
    
    particle.position.copy(position);
    particle.velocity.copy(velocity || new THREE.Vector3());
    particle.life = PARTICLE_LIFETIME;
    particle.maxLife = PARTICLE_LIFETIME;
    particle.size = size;
    particle.color.copy(color || new THREE.Color(0x4fc3f7));
    
    nextParticleIndex.current = (nextParticleIndex.current + 1) % MAX_PARTICLES;
  }, [enableShaderEffects]);
  
  // Trigger cross-section particle burst
  const triggerCrossSectionBurst = useCallback((position: THREE.Vector3) => {
    const burstCount = Math.min(15, MAX_PARTICLES / 10);
    
    for (let i = 0; i < burstCount; i++) {
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      );
      
      const color = new THREE.Color().setHSL(
        0.6 + Math.random() * 0.2, // Blue-cyan range
        0.8,
        0.6 + Math.random() * 0.3
      );
      
      addParticle(
        position.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        )),
        velocity,
        color,
        6 + Math.random() * 4
      );
    }
  }, [addParticle]);
  
  // Add rotation trail particle
  const addTrailParticle = useCallback((position: THREE.Vector3, rotationSpeed: number) => {
    if (Math.random() > 0.02 * rotationSpeed) return; // Spawn rate based on rotation
    
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1
    );
    
    const hue = colorTheme === 'synthwave' ? 0.8 + Math.random() * 0.2 :
                colorTheme === 'aurora' ? 0.3 + Math.random() * 0.3 :
                0.6 + Math.random() * 0.1; // Default cyan
    
    const color = new THREE.Color().setHSL(hue, 0.7, 0.5);
    
    addParticle(position, velocity, color, 3 + Math.random() * 2);
  }, [addParticle, colorTheme]);
  
  useFrame((_, delta) => {
    if (!enableShaderEffects) return;
    
    // Update particle positions and life
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const particle = particleData.current[i];
      
      if (particle.life > 0) {
        particle.life -= delta;
        
        // Update position
        particle.position.add(particle.velocity.clone().multiplyScalar(delta));
        
        // Add gravity/drift
        particle.velocity.y -= 0.2 * delta;
        particle.velocity.multiplyScalar(0.98); // Damping
        
        // Calculate alpha based on life
        const lifeRatio = particle.life / particle.maxLife;
        const alpha = Math.min(1, lifeRatio * 3) * Math.min(1, particle.life * 2);
        
        // Update buffer arrays
        const i3 = i * 3;
        positions[i3] = particle.position.x;
        positions[i3 + 1] = particle.position.y;
        positions[i3 + 2] = particle.position.z;
        
        colors[i3] = particle.color.r;
        colors[i3 + 1] = particle.color.g;
        colors[i3 + 2] = particle.color.b;
        
        sizes[i] = particle.size * lifeRatio;
        alphas[i] = alpha;
      } else {
        // Dead particle - hide it
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0; 
        positions[i * 3 + 2] = 0;
        alphas[i] = 0;
        sizes[i] = 0;
      }
    }
    
    // Mark attributes as needing update
    if (particlesRef.current) {
      const geo = particlesRef.current.geometry;
      (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
      (geo.attributes.size as THREE.BufferAttribute).needsUpdate = true;
      (geo.attributes.alpha as THREE.BufferAttribute).needsUpdate = true;
    }
  });
  
  // Expose particle functions to parent components via forwarded ref
  useImperativeHandle(ref, () => ({
    triggerCrossSectionBurst,
    addTrailParticle,
  }), [triggerCrossSectionBurst, addTrailParticle]);
  
  if (!enableShaderEffects) {
    return null;
  }
  
  return (
    <points ref={particlesRef} geometry={geometry} material={material} />
  );
});

// Window type augmentation for Scene4D access (no longer needed with forwardRef)
declare global {
  interface Window {
    __hyper4d_particles?: {
      triggerCrossSectionBurst: (position: THREE.Vector3) => void;
      addTrailParticle: (position: THREE.Vector3, speed: number) => void;
    };
  }
}