import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Scene4D } from './components/Scene4D';
import { Controls } from './components/Controls';
import { InfoPanel } from './components/InfoPanel';
import { HelpModal } from './components/HelpModal';
import { GridFloor } from './components/GridFloor';
import { TutorialOverlay } from './components/TutorialOverlay';
import { TourMode } from './components/TourMode';
import { LearnMode } from './components/LearnMode';
import { ComparisonMode } from './components/ComparisonMode';
import { FPSToggle } from './components/FPSCounter';
import { LoadingState, useThreeJSReady } from './components/LoadingState';
import { ContextMenu, useContextMenu } from './components/ContextMenu';
import { LandingExperience } from './components/LandingExperience';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CameraController } from './components/CameraController';
import { ImmersiveMode } from './components/ImmersiveMode';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useDrag4D } from './components/Drag4D';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useStore } from './store/useStore';
import { parseURLState, captureCanvasScreenshot } from './utils/screenshot';
import './App.css';

function App() {
  const cameraDistance = useStore((s) => s.cameraDistance);
  const isImmersiveMode = useStore((s) => s.isImmersiveMode);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitControlsRef = useRef<any>(null);
  const isReady = useThreeJSReady();
  const reducedMotion = useReducedMotion();
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();
  
  // Update body class for immersive mode
  useEffect(() => {
    if (isImmersiveMode) {
      document.body.classList.add('immersive-mode');
    } else {
      document.body.classList.remove('immersive-mode');
    }
    
    return () => {
      document.body.classList.remove('immersive-mode');
    };
  }, [isImmersiveMode]);

  useKeyboardShortcuts();
  useDrag4D(containerRef);

  // Apply reduced motion preferences
  useEffect(() => {
    if (reducedMotion) {
      // Disable auto-rotation if user prefers reduced motion
      const { isAutoRotating, toggleAutoRotation } = useStore.getState();
      if (isAutoRotating) {
        toggleAutoRotation();
      }
    }
  }, [reducedMotion]);

  // Parse URL state on load and set up global state tracking
  useEffect(() => {
    const urlState = parseURLState();
    if (urlState) {
      const store = useStore.getState();
      if (urlState.activeShape && urlState.activeShape !== store.activeShape) {
        store.setActiveShape(urlState.activeShape);
      }
      if (urlState.projectionMode && urlState.projectionMode !== store.projectionMode) {
        store.setProjectionMode(urlState.projectionMode);
      }
      if (urlState.colorByW !== undefined && urlState.colorByW !== store.colorByW) {
        store.toggleColorByW();
      }
      if (urlState.showSlice !== undefined && urlState.showSlice !== store.showSlice) {
        store.toggleShowSlice();
      }
      if (urlState.rotation) {
        Object.entries(urlState.rotation).forEach(([key, value]: [string, any]) => {
          store.setRotation(key as any, value);
        });
      }
    }

    // Track active shape globally for screenshot naming
    (window as any).__hyper4d_activeShape = useStore.getState().activeShape;
    const unsubscribe = useStore.subscribe((state) => {
      (window as any).__hyper4d_activeShape = state.activeShape;
    });

    return unsubscribe;
  }, []);

  // Double-click focus mode
  const handleDoubleClick = () => {
    if (orbitControlsRef.current) {
      // Smooth zoom to focus on the shape
      const controls = orbitControlsRef.current;
      const targetDistance = 3;
      
      // Animate camera distance
      const startDistance = controls.getDistance();
      const startTime = Date.now();
      const duration = 1000;
      
      const animateZoom = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = progress * progress * (3 - 2 * progress); // Smooth step
        
        const currentDistance = startDistance + (targetDistance - startDistance) * easeProgress;
        controls.dollyTo(currentDistance, false);
        
        if (progress < 1) {
          requestAnimationFrame(animateZoom);
        }
      };
      
      animateZoom();
    }
  };

  // Scroll wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const { setCameraDistance } = useStore.getState();
    const delta = e.deltaY * 0.001;
    const currentDistance = useStore.getState().cameraDistance;
    const newDistance = Math.max(2, Math.min(20, currentDistance + delta));
    setCameraDistance(newDistance);
  };

  // Keyboard shortcuts for screenshot and share
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const canvas = document.querySelector('canvas');
        if (canvas) {
          captureCanvasScreenshot(canvas);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100vw', height: '100vh', background: '#0a0a14' }}
      onContextMenu={showContextMenu}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
    >
      <main id="main-content" style={{ width: '100%', height: '100%' }}>
      <LoadingState isLoading={!isReady} />
      <ErrorBoundary>
        <Canvas
          camera={{
            position: [0, 0, cameraDistance],
            fov: 60,
            near: 0.1,
            far: 100,
          }}
          style={{ background: '#0a0a14' }}
          aria-label="4D shape visualization viewport"
        >
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />
          <Stars radius={50} depth={40} count={3000} factor={4} fade speed={0.3} />
          <Scene4D />
          <GridFloor />
          <OrbitControls
            ref={orbitControlsRef}
            enablePan={false}
            minDistance={2}
            maxDistance={20}
            dampingFactor={0.03}
            enableDamping
            autoRotateSpeed={0.5}
            // Disable right-click orbit so right-drag can do 4D rotation
            mouseButtons={{
              LEFT: THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: undefined as unknown as THREE.MOUSE,
            }}
          />
          <CameraController orbitControlsRef={orbitControlsRef} />
        </Canvas>
      </ErrorBoundary>
      </main>
      <Controls />
      <InfoPanel />
      <HelpModal />
      <TutorialOverlay />
      <TourMode />
      <LearnMode />
      <ComparisonMode />
      <FPSToggle />
      <ContextMenu 
        x={contextMenu.x} 
        y={contextMenu.y} 
        visible={contextMenu.visible} 
        onClose={hideContextMenu} 
      />
      <LandingExperience />
      <ImmersiveMode />
      
      {/* Live region for screen reader announcements */}
      <div
        id="hyper4d-live-region"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden'
        }}
      />
      
      {/* Skip link for keyboard navigation */}
      <a
        href="#main-content"
        className="skip-link"
        style={{
          position: 'absolute',
          top: '-40px',
          left: '6px',
          background: '#4fc3f7',
          color: 'white',
          padding: '8px',
          textDecoration: 'none',
          borderRadius: '4px',
          zIndex: 10000,
          transition: 'top 0.3s'
        }}
        onFocus={(e) => e.target.style.top = '6px'}
        onBlur={(e) => e.target.style.top = '-40px'}
      >
        Skip to main content
      </a>
    </div>
  );
}

export default App;
