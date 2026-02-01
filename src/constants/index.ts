/**
 * Application constants and magic numbers
 */

// Performance and rendering constants
export const PERFORMANCE_CONSTANTS = {
  UPDATE_THRESHOLD: 0.001,
  MORPH_SPEED: 2.5,
  ROTATION_MATRIX_CACHE_SIZE: 100,
  FPS_SAMPLE_SIZE: 60,
  MEMORY_CHECK_INTERVAL: 5000, // ms
  LOADING_DELAY: 1000, // ms
  ANIMATION_SMOOTHING: 0.001,
} as const;

// Shape limits for performance
export const SHAPE_LIMITS = {
  MAX_VERTICES: 1000,
  MAX_EDGES: 2000,
  MAX_TORUS_SEGMENTS: 24,
  MAX_SPHERE_VERTICES: 200,
  MAX_SPHERE_DETAIL: 4,
  MAX_600_CELL_EDGES: 200,
} as const;

// Visual and UI constants
export const VISUAL_CONSTANTS = {
  DEFAULT_VERTEX_SIZE: 0.06,
  MIN_VERTEX_SIZE: 0.001,
  MAX_VERTEX_SIZE: 2.0,
  DEFAULT_EDGE_OPACITY: 0.8,
  MIN_EDGE_OPACITY: 0,
  MAX_EDGE_OPACITY: 1,
  DEFAULT_VIEW_DISTANCE: 3,
  MIN_VIEW_DISTANCE: 0.1,
  MAX_VIEW_DISTANCE: 50,
  DEFAULT_CAMERA_DISTANCE: 5,
  SLICE_ANIMATION_SPEED: 2, // units per second
} as const;

// Rotation and interaction constants
export const ROTATION_CONSTANTS = {
  MAX_ROTATION_SPEED: 5, // radians per second
  ROTATION_STEP: 0.1, // for keyboard controls
  DEFAULT_AUTO_ROTATION: {
    xy: 0,
    xz: 0, 
    xw: 0.3,
    yz: 0,
    yw: 0.2,
    zw: 0,
  },
} as const;

// Colors (hex values)
export const COLORS = {
  BACKGROUND: '#0a0a14',
  PRIMARY: '#4fc3f7',
  ERROR: '#ff4444',
  WARNING: '#ffaa00',
  SUCCESS: '#44ff44',
  DEEP_BLUE: 0x0a1a3d,
  CYAN: 0x00bcd4,
  MAGENTA: 0xe91e63,
  GOLD: 0xffc107,
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  HELP: 'h',
  RESET_ROTATION: 'r', 
  TOGGLE_VERTICES: 'v',
  TOGGLE_EDGES: 'e',
  TOGGLE_AXES: 'a',
  TOGGLE_GRID: 'g',
  TOGGLE_COLOR_BY_W: 'c',
  TOGGLE_SLICE: 'x',
  TOGGLE_AUTO_ROTATION: ' ',
  TOGGLE_INFO: 'i',
  PERSPECTIVE_PROJECTION: 'p',
  ORTHOGRAPHIC_PROJECTION: 'o',
  STEREOGRAPHIC_PROJECTION: 's',
  ARROW_LEFT: 'arrowleft',
  ARROW_RIGHT: 'arrowright', 
  ARROW_UP: 'arrowup',
  ARROW_DOWN: 'arrowdown',
} as const;

// Shape selection keys
export const SHAPE_KEYS = {
  '1': 'tesseract',
  '2': '16cell',
  '3': '24cell',
  '4': '5cell',
  '5': 'torus',
  '6': 'sphere',
} as const;

// Z-index layers
export const Z_INDEX = {
  LOADING: 10000,
  MODAL: 2000,
  FPS_COUNTER: 1001,
  CONTROLS: 1000,
  CANVAS: 1,
} as const;