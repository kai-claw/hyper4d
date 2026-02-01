import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Scene4D } from './components/Scene4D';
import { Controls } from './components/Controls';
import { InfoPanel } from './components/InfoPanel';
import { HelpModal } from './components/HelpModal';
import { GridFloor } from './components/GridFloor';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useDrag4D } from './components/Drag4D';
import { useStore } from './store/useStore';

function App() {
  const cameraDistance = useStore((s) => s.cameraDistance);
  const containerRef = useRef<HTMLDivElement>(null);

  useKeyboardShortcuts();
  useDrag4D(containerRef);

  return (
    <div ref={containerRef} style={{ width: '100vw', height: '100vh', background: '#0a0a14' }}>
      <Canvas
        camera={{
          position: [0, 0, cameraDistance],
          fov: 60,
          near: 0.1,
          far: 100,
        }}
        style={{ background: '#0a0a14' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        <Stars radius={50} depth={40} count={2000} factor={3} fade speed={0.5} />
        <Scene4D />
        <GridFloor />
        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={20}
          dampingFactor={0.08}
          enableDamping
          // Disable right-click orbit so right-drag can do 4D rotation
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: undefined as unknown as THREE.MOUSE,
          }}
        />
      </Canvas>
      <Controls />
      <InfoPanel />
      <HelpModal />
    </div>
  );
}

export default App;
