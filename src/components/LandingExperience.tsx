// Landing experience — premium first impression with cinematic fade
import { useEffect, useState, useCallback } from 'react';
import { useStore } from '../store/useStore';
import './LandingExperience.css';

export function LandingExperience() {
  const [phase, setPhase] = useState<'intro' | 'reveal' | 'done'>('intro');

  const initScene = useCallback(() => {
    const store = useStore.getState();
    if (store.activeShape !== 'tesseract') store.setActiveShape('tesseract');
    if (!store.isAutoRotating) store.toggleAutoRotation();
    store.setAutoRotation('xw', 0.4);
    store.setAutoRotation('yw', 0.3);
    store.setAutoRotation('zw', 0.1);
    store.setProjectionMode('perspective');
    if (!store.colorByW) store.toggleColorByW();
    if (!store.showVertices) store.toggleShowVertices();
    if (!store.showEdges) store.toggleShowEdges();
  }, []);

  useEffect(() => {
    initScene();
    const revealTimer = setTimeout(() => setPhase('reveal'), 800);
    const doneTimer   = setTimeout(() => setPhase('done'), 3800);
    return () => { clearTimeout(revealTimer); clearTimeout(doneTimer); };
  }, [initScene]);

  if (phase === 'done') return null;

  return (
    <div className={`landing-overlay ${phase}`} aria-hidden="true">
      {/* Radial vignette */}
      <div className="landing-vignette" />

      <div className="landing-content">
        <h1 className="landing-brand">Hyper4D</h1>
        <p className="landing-tagline">Explore the Fourth Dimension</p>

        {phase === 'reveal' && (
          <div className="landing-cta">
            <span className="landing-interaction">Drag to orbit&nbsp;&nbsp;·&nbsp;&nbsp;Shift-drag for 4D rotation</span>
          </div>
        )}
      </div>

      {/* Decorative corner accents */}
      <div className="landing-corner tl" />
      <div className="landing-corner tr" />
      <div className="landing-corner bl" />
      <div className="landing-corner br" />
    </div>
  );
}
