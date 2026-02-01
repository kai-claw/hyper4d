// Control panel for 4D manipulation

import { useStore } from '../store/useStore';
import type { ProjectionMode } from '../store/useStore';
import { SHAPE_CATALOG } from '../engine/shapes4d';
import type { ShapeKey } from '../engine/shapes4d';
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

  return (
    <div className="controls">
      <div className="controls-header">
        <h2>⚡ Hyper4D</h2>
        <button className="btn-icon" onClick={store.toggleHelp} title="Help">
          ?
        </button>
      </div>

      {/* Shape selector */}
      <Section title="Shape">
        <div className="shape-grid">
          {(Object.entries(SHAPE_CATALOG) as [ShapeKey, typeof SHAPE_CATALOG[ShapeKey]][]).map(
            ([key, { label }]) => (
              <button
                key={key}
                className={`shape-btn ${store.activeShape === key ? 'active' : ''}`}
                onClick={() => store.setActiveShape(key)}
              >
                {label}
              </button>
            )
          )}
        </div>
      </Section>

      {/* 4D Rotation */}
      <Section title="4D Rotation" collapsible>
        <div className="rotation-controls">
          {ROTATION_PLANES.map(({ key, label, desc }) => (
            <div key={key} className="slider-row" title={desc}>
              <label className={key.includes('w') ? 'label-4d' : ''}>
                {label}
              </label>
              <input
                type="range"
                min={-Math.PI}
                max={Math.PI}
                step={0.01}
                value={store.rotation[key]}
                onChange={(e) => store.setRotation(key, parseFloat(e.target.value))}
              />
              <span className="value">{(store.rotation[key] * 180 / Math.PI).toFixed(0)}°</span>
            </div>
          ))}
          <button className="btn-small" onClick={store.resetRotation}>
            Reset
          </button>
        </div>
      </Section>

      {/* Auto Rotation */}
      <Section title="Auto Rotation" collapsible>
        <div className="auto-rotate-toggle">
          <label>
            <input
              type="checkbox"
              checked={store.isAutoRotating}
              onChange={store.toggleAutoRotation}
            />
            Enable
          </label>
        </div>
        {ROTATION_PLANES.map(({ key, label }) => (
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
      <Section title="Projection" collapsible>
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
      <Section title="Display" collapsible>
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
      <Section title="4D Cross-Section" collapsible>
        <label className="slice-toggle">
          <input type="checkbox" checked={store.showSlice} onChange={store.toggleShowSlice} />
          Enable W-slice
        </label>
        {store.showSlice && (
          <>
            <div className="slider-row">
              <label>W pos</label>
              <input
                type="range" min={-2} max={2} step={0.01}
                value={store.wSlicePosition}
                onChange={(e) => store.setWSlicePosition(parseFloat(e.target.value))}
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
          </>
        )}
      </Section>

      <div className="controls-footer">
        <button className="btn-small" onClick={store.toggleInfo}>
          {store.showInfo ? 'Hide' : 'Show'} Info Panel
        </button>
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
}: {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(true);

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

// Need to import useState
import { useState } from 'react';
