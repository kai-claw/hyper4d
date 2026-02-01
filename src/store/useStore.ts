// Global state management with Zustand

import { create } from 'zustand';
import type { ShapeKey } from '../engine/shapes4d';

export type ProjectionMode = 'perspective' | 'orthographic' | 'stereographic';

interface RotationState {
  xy: number;
  xz: number;
  xw: number;
  yz: number;
  yw: number;
  zw: number;
}

interface AutoRotation {
  xy: number;
  xz: number;
  xw: number;
  yz: number;
  yw: number;
  zw: number;
}

interface AppState {
  // Shape
  activeShape: ShapeKey;
  setActiveShape: (shape: ShapeKey) => void;

  // 4D Rotation
  rotation: RotationState;
  setRotation: (plane: keyof RotationState, value: number) => void;
  resetRotation: () => void;

  // Auto-rotation speeds (radians per second)
  autoRotation: AutoRotation;
  setAutoRotation: (plane: keyof AutoRotation, value: number) => void;
  isAutoRotating: boolean;
  toggleAutoRotation: () => void;

  // Projection
  projectionMode: ProjectionMode;
  setProjectionMode: (mode: ProjectionMode) => void;
  viewDistance: number;
  setViewDistance: (d: number) => void;

  // Visual
  showVertices: boolean;
  showEdges: boolean;
  showFaces: boolean;
  showLabels: boolean;
  showAxes: boolean;
  showGrid: boolean;
  showSlice: boolean;
  edgeOpacity: number;
  vertexSize: number;
  wSlicePosition: number;
  wSliceThickness: number;
  colorByW: boolean;
  toggleShowVertices: () => void;
  toggleShowEdges: () => void;
  toggleShowFaces: () => void;
  toggleShowLabels: () => void;
  toggleShowAxes: () => void;
  toggleShowGrid: () => void;
  toggleShowSlice: () => void;
  toggleColorByW: () => void;
  setEdgeOpacity: (v: number) => void;
  setVertexSize: (v: number) => void;
  setWSlicePosition: (v: number) => void;
  setWSliceThickness: (v: number) => void;

  // Camera
  cameraDistance: number;
  setCameraDistance: (d: number) => void;

  // UI
  showHelp: boolean;
  toggleHelp: () => void;
  showInfo: boolean;
  toggleInfo: () => void;
}

const DEFAULT_ROTATION: RotationState = {
  xy: 0, xz: 0, xw: 0, yz: 0, yw: 0, zw: 0,
};

const DEFAULT_AUTO_ROTATION: AutoRotation = {
  xy: 0, xz: 0, xw: 0.3, yz: 0, yw: 0.2, zw: 0,
};

export const useStore = create<AppState>((set) => ({
  // Shape
  activeShape: 'tesseract',
  setActiveShape: (shape) => set({ activeShape: shape }),

  // Rotation
  rotation: { ...DEFAULT_ROTATION },
  setRotation: (plane, value) =>
    set((s) => ({ rotation: { ...s.rotation, [plane]: value } })),
  resetRotation: () => set({ rotation: { ...DEFAULT_ROTATION } }),

  // Auto rotation
  autoRotation: { ...DEFAULT_AUTO_ROTATION },
  setAutoRotation: (plane, value) =>
    set((s) => ({ autoRotation: { ...s.autoRotation, [plane]: value } })),
  isAutoRotating: true,
  toggleAutoRotation: () => set((s) => ({ isAutoRotating: !s.isAutoRotating })),

  // Projection
  projectionMode: 'perspective',
  setProjectionMode: (mode) => set({ projectionMode: mode }),
  viewDistance: 3,
  setViewDistance: (d) => set({ viewDistance: d }),

  // Visual
  showVertices: true,
  showEdges: true,
  showFaces: false,
  showLabels: false,
  showAxes: true,
  showGrid: true,
  showSlice: false,
  edgeOpacity: 0.8,
  vertexSize: 0.06,
  wSlicePosition: 0,
  wSliceThickness: 0.3,
  colorByW: true,
  toggleShowVertices: () => set((s) => ({ showVertices: !s.showVertices })),
  toggleShowEdges: () => set((s) => ({ showEdges: !s.showEdges })),
  toggleShowFaces: () => set((s) => ({ showFaces: !s.showFaces })),
  toggleShowLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  toggleShowAxes: () => set((s) => ({ showAxes: !s.showAxes })),
  toggleShowGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleShowSlice: () => set((s) => ({ showSlice: !s.showSlice })),
  toggleColorByW: () => set((s) => ({ colorByW: !s.colorByW })),
  setEdgeOpacity: (v) => set({ edgeOpacity: v }),
  setVertexSize: (v) => set({ vertexSize: v }),
  setWSlicePosition: (v) => set({ wSlicePosition: v }),
  setWSliceThickness: (v) => set({ wSliceThickness: v }),

  // Camera
  cameraDistance: 5,
  setCameraDistance: (d) => set({ cameraDistance: d }),

  // UI
  showHelp: false,
  toggleHelp: () => set((s) => ({ showHelp: !s.showHelp })),
  showInfo: true,
  toggleInfo: () => set((s) => ({ showInfo: !s.showInfo })),
}));
