/**
 * Performance monitoring FPS counter
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
        setFPS(Math.round((frameCount.current / (now - lastTime.current)) * 1000));
        frameCount.current = 0;
        lastTime.current = now;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [visible]);

  if (!visible) return null;

  const color = fps < 30 ? '#ff4444' : fps < 50 ? '#ffaa00' : '#44ff44';

  return (
    <div style={{
      position: 'fixed', top: 10, right: 60,
      background: 'rgba(0,0,0,0.65)', color,
      padding: '3px 8px', borderRadius: 4,
      fontFamily: '"SF Mono","Fira Code",monospace', fontSize: 11,
      zIndex: 1000, backdropFilter: 'blur(4px)',
      letterSpacing: '0.04em',
    }}
    title="Frames Per Second"
    >
      {fps} fps
    </div>
  );
}

export function FPSToggle() {
  const [showFPS, setShowFPS] = useState(false);

  return (
    <>
      {showFPS && <FPSCounter visible />}
      <button
        onClick={() => setShowFPS(v => !v)}
        style={{
          position: 'fixed', top: 10, right: 10,
          background: 'rgba(0,0,0,0.5)',
          color: showFPS ? '#4fc3f7' : 'rgba(255,255,255,0.45)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '3px 8px', borderRadius: 4, fontSize: 11,
          cursor: 'pointer', zIndex: 1001,
          backdropFilter: 'blur(4px)',
          fontFamily: '"SF Mono","Fira Code",monospace',
          letterSpacing: '0.02em',
          transition: 'color 0.2s',
        }}
        title="Toggle FPS Counter"
        aria-label="Toggle FPS performance counter"
      >
        FPS
      </button>
    </>
  );
}
