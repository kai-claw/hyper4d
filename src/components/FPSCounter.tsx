/**
 * Performance monitoring FPS counter
 */
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

interface FPSCounterProps {
  visible: boolean;
}

export function FPSCounter({ visible }: FPSCounterProps) {
  const [fps, setFPS] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const times = useRef<number[]>([]);

  useFrame(() => {
    if (!visible) return;

    frameCount.current++;
    const now = performance.now();
    
    // Sample FPS every 60 frames or every second, whichever comes first
    if (frameCount.current >= 60 || now - lastTime.current >= 1000) {
      times.current.push(now);
      
      // Keep only last 5 measurements for smoothing
      if (times.current.length > 5) {
        times.current.shift();
      }
      
      // Calculate average FPS from recent measurements
      if (times.current.length >= 2) {
        const avgTime = (times.current[times.current.length - 1] - times.current[0]) / (times.current.length - 1);
        const avgFPS = 1000 / avgTime * frameCount.current / times.current.length;
        setFPS(Math.round(avgFPS));
      }
      
      frameCount.current = 0;
      lastTime.current = now;
    }
  });

  if (!visible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: fps < 30 ? '#ff4444' : fps < 50 ? '#ffaa00' : '#44ff44',
        padding: '4px 8px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      title="Frames Per Second - Performance Indicator"
    >
      FPS: {fps}
    </div>
  );
}

// UI toggle component for the FPS counter
export function FPSToggle() {
  const [showFPS, setShowFPS] = useState(false);

  return (
    <>
      <FPSCounter visible={showFPS} />
      <button
        onClick={() => setShowFPS(!showFPS)}
        style={{
          position: 'fixed',
          top: showFPS ? '40px' : '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#ffffff',
          border: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 1001,
          backdropFilter: 'blur(4px)',
        }}
        title="Toggle FPS Counter"
        aria-label="Toggle FPS performance counter"
      >
        ⚡ FPS
      </button>
    </>
  );
}