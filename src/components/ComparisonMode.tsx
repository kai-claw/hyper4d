// Side-by-side comparison of 3D analogue vs 4D shape
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { Scene4D } from './Scene4D';
import './ComparisonMode.css';

// 3D analogues for each 4D shape
const SHAPE_ANALOGUES = {
  tesseract: { name: 'Cube', description: 'A cube is to a square as a tesseract is to a cube' },
  '16cell': { name: 'Octahedron', description: 'Both are duals of their respective hypercubes' },
  '24cell': { name: 'None', description: 'No 3D analogue exists! This is purely 4D' },
  '5cell': { name: 'Tetrahedron', description: 'Both are the simplest shapes in their dimensions' },
  torus: { name: 'Torus', description: 'But 3D torus has curvature; 4D Clifford torus is flat!' },
  sphere: { name: 'Sphere', description: 'Circle → Sphere → Hypersphere progression' },
  '600cell': { name: 'Icosahedron', description: 'Both have complex geometries with many faces' },
  'duoprism33': { name: 'None', description: 'Duoprisms are purely 4D — no 3D equivalent' },
  'duoprism44': { name: 'None', description: 'Product of two 2D shapes living in 4D' },
} as const;

// Simple 3D shape components
function Cube3D({ size = 1 }: { size?: number }) {
  return (
    <mesh>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial 
        color="#4fc3f7" 
        wireframe 
        transparent 
        opacity={0.8}
      />
    </mesh>
  );
}

function Octahedron3D({ size = 1 }: { size?: number }) {
  return (
    <mesh>
      <octahedronGeometry args={[size]} />
      <meshStandardMaterial 
        color="#ff7043" 
        wireframe 
        transparent 
        opacity={0.8}
      />
    </mesh>
  );
}

function Tetrahedron3D({ size = 1 }: { size?: number }) {
  return (
    <mesh>
      <tetrahedronGeometry args={[size]} />
      <meshStandardMaterial 
        color="#66bb6a" 
        wireframe 
        transparent 
        opacity={0.8}
      />
    </mesh>
  );
}

function Torus3D({ size = 1 }: { size?: number }) {
  return (
    <mesh>
      <torusGeometry args={[size * 0.6, size * 0.3, 8, 16]} />
      <meshStandardMaterial 
        color="#ffa726" 
        wireframe 
        transparent 
        opacity={0.8}
      />
    </mesh>
  );
}

function Sphere3D({ size = 1 }: { size?: number }) {
  return (
    <mesh>
      <sphereGeometry args={[size, 12, 8]} />
      <meshStandardMaterial 
        color="#ef5350" 
        wireframe 
        transparent 
        opacity={0.8}
      />
    </mesh>
  );
}

function Icosahedron3D({ size = 1 }: { size?: number }) {
  return (
    <mesh>
      <icosahedronGeometry args={[size]} />
      <meshStandardMaterial 
        color="#8e24aa" 
        wireframe 
        transparent 
        opacity={0.8}
      />
    </mesh>
  );
}

function NoAnalogue() {
  return (
    <group>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.3}
        color="#ff6b6b"
      >
        NO 3D
      </Text>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.2}
        color="#ff6b6b"
      >
        ANALOGUE
      </Text>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial 
          color="#ff6b6b" 
          transparent 
          opacity={0.3}
          emissive="#ff6b6b"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

function get3DComponent(shapeKey: string) {
  switch (shapeKey) {
    case 'tesseract': return Cube3D;
    case '16cell': return Octahedron3D;
    case '5cell': return Tetrahedron3D;
    case 'torus': return Torus3D;
    case 'sphere': return Sphere3D;
    case '600cell': return Icosahedron3D;
    default: return NoAnalogue;
  }
}

export function ComparisonMode() {
  const { showComparison, activeShape } = useStore();
  const cameraDistance = useStore((s) => s.cameraDistance);

  if (!showComparison) return null;

  const analogue = SHAPE_ANALOGUES[activeShape as keyof typeof SHAPE_ANALOGUES];
  const Shape3D = get3DComponent(activeShape);

  return (
    <div className="comparison-overlay">
      <div className="comparison-container">
        <div className="comparison-header">
          <h2>3D vs 4D Comparison</h2>
          <button 
            className="btn-close-comparison"
            onClick={() => useStore.getState().toggleComparison()}
          >
            ×
          </button>
        </div>

        <div className="comparison-panels">
          {/* 3D View */}
          <div className="comparison-panel">
            <div className="panel-header">
              <h3>3D: {analogue?.name || 'No Analogue'}</h3>
              <span className="dimension-label">3 dimensions</span>
            </div>
            <div className="panel-viewport">
              <Canvas
                camera={{
                  position: [0, 0, cameraDistance],
                  fov: 60,
                  near: 0.1,
                  far: 100,
                }}
              >
                <ambientLight intensity={0.4} />
                <pointLight position={[5, 5, 5]} intensity={0.8} />
                <Shape3D size={1.5} />
                <OrbitControls 
                  enablePan={false}
                  minDistance={2}
                  maxDistance={10}
                  autoRotate
                  autoRotateSpeed={2}
                />
              </Canvas>
            </div>
            <div className="panel-description">
              <p>{analogue?.description}</p>
            </div>
          </div>

          {/* 4D View */}
          <div className="comparison-panel">
            <div className="panel-header">
              <h3>4D: {activeShape}</h3>
              <span className="dimension-label">4 dimensions</span>
            </div>
            <div className="panel-viewport">
              <Canvas
                camera={{
                  position: [0, 0, cameraDistance],
                  fov: 60,
                  near: 0.1,
                  far: 100,
                }}
              >
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={0.8} />
                <pointLight position={[-10, -10, -10]} intensity={0.3} />
                <Scene4D />
                <OrbitControls 
                  enablePan={false}
                  minDistance={2}
                  maxDistance={10}
                  autoRotate
                  autoRotateSpeed={2}
                  mouseButtons={{
                    LEFT: THREE.MOUSE.ROTATE,
                    MIDDLE: THREE.MOUSE.DOLLY,
                    RIGHT: undefined as unknown as THREE.MOUSE,
                  }}
                />
              </Canvas>
            </div>
            <div className="panel-description">
              <p>The 4D version adds a whole new dimension to explore!</p>
            </div>
          </div>
        </div>

        <div className="comparison-info">
          <div className="info-card">
            <h4>🔄 Synchronized Rotation</h4>
            <p>Both shapes rotate together so you can see the relationship between 3D and 4D versions.</p>
          </div>
          <div className="info-card">
            <h4>📐 Key Differences</h4>
            <p>Notice how the 4D shape has more complexity — more vertices, edges, and internal structure.</p>
          </div>
          <div className="info-card">
            <h4>🎯 Projection Effect</h4>
            <p>The 4D shape you see is actually a 3D projection — like a shadow of the true 4D object!</p>
          </div>
        </div>
      </div>
    </div>
  );
}