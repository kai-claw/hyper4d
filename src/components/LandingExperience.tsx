// Landing experience with breathtaking tesseract and fade-in UI
import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import './LandingExperience.css';

export function LandingExperience() {
  const [isLandingComplete, setIsLandingComplete] = useState(false);
  const [showUI, setShowUI] = useState(false);

  useEffect(() => {
    // Set up the perfect landing state
    const store = useStore.getState();
    
    // Ensure we start with tesseract and auto-rotation
    if (store.activeShape !== 'tesseract') {
      store.setActiveShape('tesseract');
    }
    
    // Ensure auto-rotation is on for the landing
    if (!store.isAutoRotating) {
      store.toggleAutoRotation();
    }

    // Set beautiful starting auto-rotation speeds
    store.setAutoRotation('xw', 0.4);
    store.setAutoRotation('yw', 0.3);
    store.setAutoRotation('zw', 0.1);
    
    // Set optimal visual settings for landing
    store.setProjectionMode('perspective');
    if (!store.colorByW) {
      store.toggleColorByW();
    }
    if (!store.showVertices) {
      store.toggleShowVertices();
    }
    if (!store.showEdges) {
      store.toggleShowEdges();
    }

    // Timing for UI fade-in
    const showUITimer = setTimeout(() => {
      setShowUI(true);
    }, 1500); // 1.5 second delay

    const landingCompleteTimer = setTimeout(() => {
      setIsLandingComplete(true);
    }, 3000); // 3 seconds total

    return () => {
      clearTimeout(showUITimer);
      clearTimeout(landingCompleteTimer);
    };
  }, []);

  if (isLandingComplete) {
    return null; // Landing is complete, show normal UI
  }

  return (
    <div className={`landing-overlay ${showUI ? 'show-ui' : ''}`}>
      <div className="landing-content">
        <div className="landing-title">
          <h1 className="landing-brand">⚡ Hyper4D</h1>
          <p className="landing-subtitle">Explore the Fourth Dimension</p>
        </div>
        {showUI && (
          <div className="landing-hint">
            <p>Watch the tesseract rotate through 4D space</p>
            <p className="landing-hint-small">Double-click to focus • Right-click for quick actions</p>
          </div>
        )}
      </div>
    </div>
  );
}