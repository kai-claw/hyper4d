// Cinematic camera controller for immersive 4D experience

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

interface CameraControllerProps {
  orbitControlsRef: React.RefObject<any>;
}

export function CameraController({ orbitControlsRef }: CameraControllerProps) {
  const { camera } = useThree();
  const { 
    cameraMode, 
    cameraOrbitSpeed, 
    cameraDistance, 
    activeShape,
    isImmersiveMode 
  } = useStore();
  
  const orbitPhase = useRef(0);
  const breathingPhase = useRef(0);
  const transitionStartTime = useRef<number | null>(null);
  const transitionDuration = 2.0; // seconds
  const lastActiveShape = useRef(activeShape);
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  
  // Shape-specific camera positions for smooth transitions
  const shapeViewpoints = {
    tesseract: { position: [3, 2, 5], lookAt: [0, 0, 0] },
    cell5: { position: [4, 3, 4], lookAt: [0, 0, 0] },
    cell16: { position: [3, 4, 4], lookAt: [0, 0, 0] },
    cell24: { position: [5, 3, 4], lookAt: [0, 0, 0] },
    cell120: { position: [6, 4, 5], lookAt: [0, 0, 0] },
    cell600: { position: [7, 5, 6], lookAt: [0, 0, 0] },
    sphere4d: { position: [4, 2, 6], lookAt: [0, 0, 0] },
    torus: { position: [3, 5, 4], lookAt: [0, 0, 0] },
  };
  
  // Smooth shape transition animation
  useEffect(() => {
    if (lastActiveShape.current !== activeShape && cameraMode === 'manual') {
      const viewpoint = shapeViewpoints[activeShape as keyof typeof shapeViewpoints];
      if (viewpoint) {
        targetPosition.current.set(...viewpoint.position);
        targetLookAt.current.set(...viewpoint.lookAt);
        transitionStartTime.current = Date.now() / 1000;
      }
      lastActiveShape.current = activeShape;
    }
  }, [activeShape, cameraMode]);
  
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    // Update orbit and breathing phases
    orbitPhase.current += delta * cameraOrbitSpeed;
    breathingPhase.current += delta * 0.8; // Breathing rate
    
    if (cameraMode === 'manual') {
      // Handle smooth transitions between shapes
      if (transitionStartTime.current !== null) {
        const elapsed = time - transitionStartTime.current;
        const progress = Math.min(1, elapsed / transitionDuration);
        const easeProgress = progress * progress * (3 - 2 * progress); // Smooth step
        
        if (orbitControlsRef.current && progress < 1) {
          const controls = orbitControlsRef.current;
          const currentPos = camera.position.clone();
          const newPos = currentPos.lerp(targetPosition.current, easeProgress * 0.1);
          
          // Smooth camera movement
          controls.object.position.copy(newPos);
          controls.target.lerp(targetLookAt.current, easeProgress * 0.05);
          controls.update();
        } else {
          transitionStartTime.current = null; // Transition complete
        }
      }
      
    } else if (cameraMode === 'orbit') {
      // Auto-orbit mode - smooth circular motion
      if (orbitControlsRef.current) {
        const controls = orbitControlsRef.current;
        const radius = cameraDistance;
        
        // Calculate orbital position
        const x = Math.cos(orbitPhase.current) * radius;
        const z = Math.sin(orbitPhase.current) * radius;
        const y = Math.sin(orbitPhase.current * 0.3) * radius * 0.3; // Gentle vertical oscillation
        
        controls.object.position.set(x, y, z);
        controls.target.set(0, 0, 0);
        controls.update();
      }
      
    } else if (cameraMode === 'breathing') {
      // Breathing zoom - subtle in/out oscillation
      if (orbitControlsRef.current) {
        const controls = orbitControlsRef.current;
        const breathingAmount = 0.8; // Amplitude of breathing
        const baseDistance = cameraDistance;
        const breathingDistance = baseDistance + Math.sin(breathingPhase.current) * breathingAmount;
        
        // Maintain camera direction but change distance
        const direction = camera.position.clone().normalize();
        const newPosition = direction.multiplyScalar(breathingDistance);
        
        controls.object.position.copy(newPosition);
        controls.target.set(0, 0, 0);
        controls.update();
      }
    }
    
    // In immersive mode, add subtle camera sway
    if (isImmersiveMode && orbitControlsRef.current) {
      const sway = Math.sin(time * 0.2) * 0.02;
      const controls = orbitControlsRef.current;
      
      if (cameraMode === 'manual') {
        // Add gentle sway to manual mode in immersive
        camera.position.x += sway;
        camera.position.y += Math.cos(time * 0.15) * 0.01;
        controls.update();
      }
    }
  });
  
  return null; // This component doesn't render anything
}

// Hook for triggering camera animations
export function useCameraAnimations() {
  const { setCameraMode } = useStore();
  
  const focusOnShape = (duration: number = 2.0) => {
    // Animate camera to focus on the current shape
    setCameraMode('breathing');
    setTimeout(() => setCameraMode('manual'), duration * 1000);
  };
  
  const orbitShape = () => {
    setCameraMode('orbit');
  };
  
  const breathingMode = () => {
    setCameraMode('breathing');
  };
  
  const manualMode = () => {
    setCameraMode('manual');
  };
  
  return {
    focusOnShape,
    orbitShape,
    breathingMode,
    manualMode,
  };
}