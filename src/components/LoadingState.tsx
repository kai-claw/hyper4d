/**
 * Loading state — clean, branded spinner while Three.js boots
 */
import { useState, useEffect } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface LoadingStateProps {
  isLoading: boolean;
}

export function LoadingState({ isLoading }: LoadingStateProps) {
  const reducedMotion = useReducedMotion();

  if (!isLoading) return null;

  return (
    <div className="loading-screen" role="status" aria-label="Loading 4D visualization">
      <div className="loading-logo">
        {/* Inline mini tesseract wireframe */}
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"
             className={reducedMotion ? '' : 'loading-spin'}>
          <rect x="8" y="8" width="32" height="32" rx="1" stroke="#4fc3f7" strokeWidth="1.2" opacity="0.6"/>
          <rect x="16" y="16" width="16" height="16" rx="1" stroke="#ab47bc" strokeWidth="1.2" opacity="0.8"/>
          <line x1="8" y1="8" x2="16" y2="16" stroke="#4fc3f7" strokeWidth="0.8" opacity="0.4"/>
          <line x1="40" y1="8" x2="32" y2="16" stroke="#4fc3f7" strokeWidth="0.8" opacity="0.4"/>
          <line x1="40" y1="40" x2="32" y2="32" stroke="#4fc3f7" strokeWidth="0.8" opacity="0.4"/>
          <line x1="8" y1="40" x2="16" y2="32" stroke="#4fc3f7" strokeWidth="0.8" opacity="0.4"/>
        </svg>
      </div>
      <p className="loading-label">Hyper4D</p>
      <p className="loading-sub">Preparing 4D engine…</p>

      <style>{`
        .loading-screen {
          position: fixed; inset: 0;
          background: #0a0a14;
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          z-index: 10000; color: #fff;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        .loading-logo { margin-bottom: 16px; }
        .loading-spin {
          animation: lspin 3s linear infinite;
        }
        @keyframes lspin {
          to { transform: rotate(360deg); }
        }
        .loading-label {
          font-size: 20px; font-weight: 700; margin: 0 0 6px;
          background: linear-gradient(135deg,#4fc3f7,#ab47bc);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .loading-sub {
          font-size: 13px; margin: 0; color: rgba(255,255,255,0.4);
          letter-spacing: 0.04em;
        }
      `}</style>
    </div>
  );
}

// Hook to track if Three.js has fully initialized
export function useThreeJSReady(): boolean {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 800);
    return () => clearTimeout(timer);
  }, []);
  return isReady;
}
