/**
 * Loading state component while Three.js initializes
 */
import { useState, useEffect } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface LoadingStateProps {
  isLoading: boolean;
}

export function LoadingState({ isLoading }: LoadingStateProps) {
  const [dots, setDots] = useState('');
  const reducedMotion = useReducedMotion();
  
  useEffect(() => {
    if (!isLoading || reducedMotion) return;
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, [isLoading, reducedMotion]);

  if (!isLoading) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#0a0a14',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
        color: '#ffffff',
      }}
      role="status"
      aria-label="Loading 4D visualization"
    >
      <div style={{ fontSize: '24px', marginBottom: '20px' }}>
        ⚡ Hyper4D
      </div>
      <div style={{ fontSize: '16px', opacity: 0.7 }}>
        {reducedMotion ? 'Loading...' : `Loading${dots}`}
      </div>
      <div style={{ 
        marginTop: '30px', 
        padding: '20px',
        maxWidth: '300px',
        textAlign: 'center',
        fontSize: '14px',
        opacity: 0.5,
        lineHeight: 1.4
      }}>
        Preparing 4D mathematics engine and WebGL context...
      </div>
    </div>
  );
}

// Hook to track if Three.js has fully initialized
export function useThreeJSReady(): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure everything is mounted and ready
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000); // 1 second should be enough for initialization

    return () => clearTimeout(timer);
  }, []);

  return isReady;
}