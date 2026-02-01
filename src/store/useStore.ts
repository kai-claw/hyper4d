// Global state management with Zustand

import { create } from 'zustand';
import type { ShapeKey } from '../engine/shapes4d';

export type ProjectionMode = 'perspective' | 'orthographic' | 'stereographic';
export type ColorTheme = 'deepSpace' | 'synthwave' | 'monochrome' | 'aurora';
export type CameraMode = 'manual' | 'orbit' | 'breathing';

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
  
  // Animation targets for smooth parameter transitions
  wSlicePositionTarget: number;
  wSliceThicknessTarget: number;
  edgeOpacityTarget: number;
  vertexSizeTarget: number;
  updateAnimations: (delta: number) => void;

  // Camera
  cameraDistance: number;
  setCameraDistance: (d: number) => void;

  // UI
  showHelp: boolean;
  toggleHelp: () => void;
  showInfo: boolean;
  toggleInfo: () => void;

  // Tour mode
  isTourMode: boolean;
  tourStep: number;
  startTour: () => void;
  stopTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;

  // Learn mode
  showLearnMode: boolean;
  learnModuleId: string | null;
  learnStep: number;
  setLearnMode: (show: boolean, moduleId?: string | null, step?: number) => void;

  // Comparison mode
  showComparison: boolean;
  comparisonShape: string;
  toggleComparison: () => void;
  setComparisonShape: (shape: string) => void;

  // Cross-section animation
  isSliceAnimating: boolean;
  sliceAnimationSpeed: number;
  startSliceAnimation: () => void;
  stopSliceAnimation: () => void;
  setSliceAnimationSpeed: (speed: number) => void;

  // Color themes
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;

  // Immersive mode
  isImmersiveMode: boolean;
  toggleImmersiveMode: () => void;

  // Audio
  isAudioMuted: boolean;
  audioVolume: number;
  toggleAudio: () => void;
  setAudioVolume: (volume: number) => void;

  // Camera modes
  cameraMode: CameraMode;
  setCameraMode: (mode: CameraMode) => void;
  cameraOrbitSpeed: number;
  setCameraOrbitSpeed: (speed: number) => void;

  // Shader effects
  enableShaderEffects: boolean;
  toggleShaderEffects: () => void;
  pulseSpeed: number;
  setPulseSpeed: (speed: number) => void;
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
  setEdgeOpacity: (v) => set({ edgeOpacity: v, edgeOpacityTarget: v }),
  setVertexSize: (v) => set({ vertexSize: v, vertexSizeTarget: v }),
  setWSlicePosition: (v) => set({ wSlicePosition: v, wSlicePositionTarget: v }),
  setWSliceThickness: (v) => set({ wSliceThickness: v, wSliceThicknessTarget: v }),
  
  // Animation targets
  wSlicePositionTarget: 0,
  wSliceThicknessTarget: 0.3,
  edgeOpacityTarget: 0.8,
  vertexSizeTarget: 0.06,
  
  updateAnimations: (delta) => set((s) => {
    const lerpFactor = 1 - Math.pow(0.001, delta); // Smooth interpolation
    return {
      wSlicePosition: s.wSlicePosition + (s.wSlicePositionTarget - s.wSlicePosition) * lerpFactor,
      wSliceThickness: s.wSliceThickness + (s.wSliceThicknessTarget - s.wSliceThickness) * lerpFactor,
      edgeOpacity: s.edgeOpacity + (s.edgeOpacityTarget - s.edgeOpacity) * lerpFactor,
      vertexSize: s.vertexSize + (s.vertexSizeTarget - s.vertexSize) * lerpFactor,
    };
  }),

  // Camera
  cameraDistance: 5,
  setCameraDistance: (d) => set({ cameraDistance: d }),

  // UI
  showHelp: false,
  toggleHelp: () => set((s) => ({ showHelp: !s.showHelp })),
  showInfo: true,
  toggleInfo: () => set((s) => ({ showInfo: !s.showInfo })),

  // Tour mode
  isTourMode: false,
  tourStep: 0,
  startTour: () => set({ 
    isTourMode: true, 
    tourStep: 0, 
    activeShape: 'tesseract',
    showSlice: false,
    colorByW: true
  }),
  stopTour: () => set({ isTourMode: false, tourStep: 0 }),
  nextTourStep: () => set((s) => ({ tourStep: s.tourStep + 1 })),
  prevTourStep: () => set((s) => ({ tourStep: Math.max(0, s.tourStep - 1) })),

  // Learn mode
  showLearnMode: false,
  learnModuleId: null,
  learnStep: 0,
  setLearnMode: (show, moduleId = null, step = 0) => set({ 
    showLearnMode: show, 
    learnModuleId: moduleId, 
    learnStep: step 
  }),

  // Comparison mode
  showComparison: false,
  comparisonShape: 'tesseract',
  toggleComparison: () => set((s) => ({ showComparison: !s.showComparison })),
  setComparisonShape: (shape) => set({ comparisonShape: shape }),

  // Cross-section animation
  isSliceAnimating: false,
  sliceAnimationSpeed: 1,
  startSliceAnimation: () => set({ isSliceAnimating: true }),
  stopSliceAnimation: () => set({ isSliceAnimating: false }),
  setSliceAnimationSpeed: (speed) => set({ sliceAnimationSpeed: speed }),

  // Color themes
  colorTheme: 'deepSpace',
  setColorTheme: (theme) => set({ colorTheme: theme }),

  // Immersive mode
  isImmersiveMode: false,
  toggleImmersiveMode: () => set((s) => ({ isImmersiveMode: !s.isImmersiveMode })),

  // Audio
  isAudioMuted: true, // Start muted
  audioVolume: 0.3,
  toggleAudio: () => set((s) => ({ isAudioMuted: !s.isAudioMuted })),
  setAudioVolume: (volume) => set({ audioVolume: volume }),

  // Camera modes
  cameraMode: 'manual',
  setCameraMode: (mode) => set({ cameraMode: mode }),
  cameraOrbitSpeed: 0.5,
  setCameraOrbitSpeed: (speed) => set({ cameraOrbitSpeed: speed }),

  // Shader effects
  enableShaderEffects: true,
  toggleShaderEffects: () => set((s) => ({ enableShaderEffects: !s.enableShaderEffects })),
  pulseSpeed: 1.0,
  setPulseSpeed: (speed) => set({ pulseSpeed: speed }),
}));
