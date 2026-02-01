/**
 * Performance monitoring FPS counter
 * Uses requestAnimationFrame instead of R3F useFrame since
 * this component renders OUTSIDE the Canvas context.
 */
import { useRef, useState, useEffect } from 'react';

interface FPSCounterProps {
  visible: boolean;
}

export function FPSCounter({ visible }: FPSCounterProps) {
  const [fps, setFPS] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (!visible) return;

    const tick = () => {
      frameCount.current++;
      const now = performance.now();

      if (now - lastTime.current >= 1000) {
        const elapsed = now - lastTime.current;
        setFPS(Math.round((frameCount.current / elapsed) * 1000));
        frameCount.current = 0;
        lastTime.current = now;
      }

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [visible]);

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
      {showFPS && <FPSCounter visible={showFPS} />}
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
