// Control panel for 4D manipulation

import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { ProjectionMode } from '../store/useStore';
import { SHAPE_CATALOG } from '../engine/shapes4d';
import type { ShapeKey } from '../engine/shapes4d';
import { captureCanvasScreenshot, generateShareURL } from '../utils/screenshot';
import './Controls.css';

const ROTATION_PLANES = [
  { key: 'xy' as const, label: 'XY', desc: 'Rotates X↔Y (familiar: like spinning a top)' },
  { key: 'xz' as const, label: 'XZ', desc: 'Rotates X↔Z (familiar: like turning left/right)' },
  { key: 'yz' as const, label: 'YZ', desc: 'Rotates Y↔Z (familiar: like tilting forward/back)' },
  { key: 'xw' as const, label: 'XW', desc: '4D rotation: X↔W (shifts X into the 4th dimension)' },
  { key: 'yw' as const, label: 'YW', desc: '4D rotation: Y↔W (shifts Y into the 4th dimension)' },
  { key: 'zw' as const, label: 'ZW', desc: '4D rotation: Z↔W (shifts Z into the 4th dimension)' },
];

const PROJECTION_MODES: { value: ProjectionMode; label: string; desc: string }[] = [
  { value: 'perspective', label: 'Perspective', desc: 'Objects farther in W appear smaller' },
  { value: 'orthographic', label: 'Orthographic', desc: 'Flat projection — drops W coordinate' },
  { value: 'stereographic', label: 'Stereographic', desc: 'Conformal — preserves angles' },
];

export function Controls() {
  const store = useStore();
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // Announce shape changes to screen readers
  useEffect(() => {
    import('../utils/accessibility').then(({ announceToScreenReader }) => {
      const shape = SHAPE_CATALOG[store.activeShape];
      announceToScreenReader(`Selected ${shape.label} shape`, 'polite');
    });
  }, [store.activeShape]);

  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      captureCanvasScreenshot(canvas);
    }
  };

  const handleShare = async () => {
    const url = generateShareURL(store);
    try {
      await navigator.clipboard.writeText(url);
      console.log('Share URL copied to clipboard');
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      prompt('Copy this URL to share:', url);
    }
  };

  return (
    <div 
      className={`controls ${isMobileExpanded ? 'expanded' : ''}`}
      role="complementary"
      aria-label="4D shape controls"
    >
      <div 
        className="controls-header"
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        role="button"
        tabIndex={0}
        aria-expanded={isMobileExpanded}
        aria-label={`4D Controls ${isMobileExpanded ? 'expanded' : 'collapsed'}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsMobileExpanded(!isMobileExpanded);
          }
        }}
      >
        <h2>⚡ Hyper4D</h2>
        <button 
          className="btn-icon" 
          onClick={(e) => {
            e.stopPropagation();
            store.toggleHelp();
          }} 
          aria-label="Open help and keyboard shortcuts"
          title="Help (H)"
        >
          ?
        </button>
      </div>

      {/* Shape selector */}
      <Section title="Shape">
        <div className="shape-grid" role="group" aria-label="4D shape selection">
          {(Object.entries(SHAPE_CATALOG) as [ShapeKey, typeof SHAPE_CATALOG[ShapeKey]][]).map(
            ([key, { label }]) => (
              <button
                key={key}
                className={`shape-btn ${store.activeShape === key ? 'active' : ''}`}
                onClick={() => store.setActiveShape(key)}
                aria-pressed={store.activeShape === key}
                aria-label={`Select ${label} shape`}
              >
                {label}
              </button>
            )
          )}
        </div>
      </Section>

      {/* 4D Rotation */}
      <Section title="4D Rotation" collapsible defaultOpen={true}>
        <div className="rotation-controls">
          <div className="rotation-hint">
            <span>💡 Hold <strong>Shift</strong> and drag on the 3D view for easier 4D rotation</span>
          </div>
          {ROTATION_PLANES.map(({ key, label, desc }) => (
            <div key={key} className="slider-row" title={desc}>
              <label 
                htmlFor={`rotation-${key}`}
                className={key.includes('w') ? 'label-4d' : ''}
              >
                {label} {key.includes('w') ? '(4D)' : '(3D)'}
              </label>
              <input
                id={`rotation-${key}`}
                type="range"
                min={-Math.PI}
                max={Math.PI}
                step={0.01}
                value={store.rotation[key]}
                onChange={(e) => store.setRotation(key, parseFloat(e.target.value))}
                aria-label={`${label} rotation: ${desc}. Current value: ${(store.rotation[key] * 180 / Math.PI).toFixed(0)} degrees`}
                aria-describedby={`rotation-${key}-desc`}
                aria-valuetext={`${(store.rotation[key] * 180 / Math.PI).toFixed(0)} degrees`}
              />
              <span 
                id={`rotation-${key}-value`}
                className="value"
                aria-hidden="true"
              >
                {(store.rotation[key] * 180 / Math.PI).toFixed(0)}°
              </span>
              <span 
                id={`rotation-${key}-desc`} 
                className="sr-only"
              >
                {desc}
              </span>
            </div>
          ))}
          <button className="btn-small" onClick={store.resetRotation}>
            Reset All
          </button>
        </div>
      </Section>

      {/* Auto Rotation */}
      <Section title="Auto Rotation" collapsible defaultOpen={false}>
        <div className="auto-rotate-toggle">
          <label>
            <input
              type="checkbox"
              checked={store.isAutoRotating}
              onChange={store.toggleAutoRotation}
            />
            Enable auto-rotation
          </label>
        </div>
        {store.isAutoRotating && ROTATION_PLANES.map(({ key, label }) => (
          <div key={key} className="slider-row">
            <label className={key.includes('w') ? 'label-4d' : ''}>
              {label}
            </label>
            <input
              type="range"
              min={-2}
              max={2}
              step={0.05}
              value={store.autoRotation[key]}
              onChange={(e) => store.setAutoRotation(key, parseFloat(e.target.value))}
            />
            <span className="value">{store.autoRotation[key].toFixed(1)}</span>
          </div>
        ))}
      </Section>

      {/* Projection */}
      <Section title="Projection" collapsible defaultOpen={false}>
        <div className="projection-modes">
          {PROJECTION_MODES.map(({ value, label, desc }) => (
            <button
              key={value}
              className={`proj-btn ${store.projectionMode === value ? 'active' : ''}`}
              onClick={() => store.setProjectionMode(value)}
              title={desc}
            >
              {label}
            </button>
          ))}
        </div>
        {store.projectionMode !== 'orthographic' && (
          <div className="slider-row">
            <label>4D View Dist</label>
            <input
              type="range"
              min={1.5}
              max={10}
              step={0.1}
              value={store.viewDistance}
              onChange={(e) => store.setViewDistance(parseFloat(e.target.value))}
            />
            <span className="value">{store.viewDistance.toFixed(1)}</span>
          </div>
        )}
      </Section>

      {/* Visual */}
      <Section title="Display" collapsible defaultOpen={true}>
        <div className="checkbox-group">
          <label title="V">
            <input type="checkbox" checked={store.showVertices} onChange={store.toggleShowVertices} />
            Vertices
          </label>
          <label title="E">
            <input type="checkbox" checked={store.showEdges} onChange={store.toggleShowEdges} />
            Edges
          </label>
          <label title="C">
            <input type="checkbox" checked={store.colorByW} onChange={store.toggleColorByW} />
            Color by W
          </label>
          <label title="A">
            <input type="checkbox" checked={store.showAxes} onChange={store.toggleShowAxes} />
            3D Axes
          </label>
          <label title="G">
            <input type="checkbox" checked={store.showGrid} onChange={store.toggleShowGrid} />
            Grid Floor
          </label>
        </div>
        <div className="slider-row">
          <label>Edge α</label>
          <input
            type="range" min={0.1} max={1} step={0.05}
            value={store.edgeOpacity}
            onChange={(e) => store.setEdgeOpacity(parseFloat(e.target.value))}
          />
          <span className="value">{store.edgeOpacity.toFixed(1)}</span>
        </div>
        <div className="slider-row">
          <label>Vertex Size</label>
          <input
            type="range" min={0.02} max={0.2} step={0.01}
            value={store.vertexSize}
            onChange={(e) => store.setVertexSize(parseFloat(e.target.value))}
          />
          <span className="value">{store.vertexSize.toFixed(2)}</span>
        </div>
      </Section>

      {/* 4D Cross-Section */}
      <Section title="4D Cross-Section" collapsible defaultOpen={false}>
        <label className="slice-toggle">
          <input type="checkbox" checked={store.showSlice} onChange={store.toggleShowSlice} />
          Enable W-slice
        </label>
        {store.showSlice && (
          <>
            <div className="slice-hint">
              <span>💡 <strong>Flatland Analogy:</strong> This is like a 2D being seeing slices of a 3D cube — you're seeing slices of a 4D object!</span>
            </div>
            
            <div className="slice-animation">
              <button 
                className={`btn-small ${store.isSliceAnimating ? 'active' : ''}`}
                onClick={store.isSliceAnimating ? store.stopSliceAnimation : store.startSliceAnimation}
              >
                {store.isSliceAnimating ? '⏸️ Stop MRI Scan' : '▶️ Start MRI Scan'}
              </button>
              {store.isSliceAnimating && (
                <div className="slider-row">
                  <label>Scan Speed</label>
                  <input
                    type="range" min={0.5} max={3} step={0.1}
                    value={store.sliceAnimationSpeed}
                    onChange={(e) => store.setSliceAnimationSpeed(parseFloat(e.target.value))}
                  />
                  <span className="value">{store.sliceAnimationSpeed.toFixed(1)}x</span>
                </div>
              )}
            </div>

            <div className="slider-row">
              <label>W pos</label>
              <input
                type="range" min={-2} max={2} step={0.01}
                value={store.wSlicePosition}
                onChange={(e) => store.setWSlicePosition(parseFloat(e.target.value))}
                disabled={store.isSliceAnimating}
              />
              <span className="value">{store.wSlicePosition.toFixed(2)}</span>
            </div>
            <div className="slider-row">
              <label>Thickness</label>
              <input
                type="range" min={0.05} max={1} step={0.01}
                value={store.wSliceThickness}
                onChange={(e) => store.setWSliceThickness(parseFloat(e.target.value))}
              />
              <span className="value">{store.wSliceThickness.toFixed(2)}</span>
            </div>

            <div className="slice-explanation">
              <div className="explanation-item">
                <span className="explain-icon">🔪</span>
                <span>Each slice shows what a 3D being would see when the 4D object intersects their 3D space</span>
              </div>
              <div className="explanation-item">
                <span className="explain-icon">🎥</span>
                <span>Watch how cubes appear and disappear as you slice through a tesseract!</span>
              </div>
            </div>
          </>
        )}
      </Section>

      <div className="controls-footer">
        <div className="footer-buttons">
          <div className="footer-row">
            <button className="btn-small btn-screenshot" onClick={handleScreenshot} title="Save current view as PNG">
              📸 Screenshot
            </button>
            <button className="btn-small btn-share" onClick={handleShare} title="Copy shareable link">
              🔗 Share
            </button>
          </div>
          <button className="btn-small btn-tour" onClick={store.startTour}>
            🎯 Start Tour
          </button>
          <button 
            className="btn-small btn-learn" 
            onClick={() => store.setLearnMode(true)}
          >
            🎓 Learn 4D
          </button>
          <button 
            className="btn-small btn-compare" 
            onClick={store.toggleComparison}
          >
            ⚖️ Compare 3D↔4D
          </button>
          <button className="btn-small" onClick={store.toggleInfo}>
            {store.showInfo ? 'Hide' : 'Show'} Info Panel
          </button>
        </div>
        <div className="hint-text">
          <span>Shift+Drag or Right-Drag → 4D rotation</span>
          <span>Press <strong>H</strong> for all shortcuts</span>
        </div>
      </div>
    </div>
  );
}

// Collapsible section component
function Section({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="section">
      <div
        className={`section-title ${collapsible ? 'collapsible' : ''}`}
        onClick={() => collapsible && setOpen(!open)}
      >
        {title}
        {collapsible && <span className="chevron">{open ? '▾' : '▸'}</span>}
      </div>
      {(!collapsible || open) && <div className="section-content">{children}</div>}
    </div>
  );
}

