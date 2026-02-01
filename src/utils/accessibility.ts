/**
 * Accessibility utilities for Hyper4D
 */

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Create a CSS media query listener for reduced motion
export function onReducedMotionChange(callback: (reducedMotion: boolean) => void): () => void {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (e: MediaQueryListEvent) => callback(e.matches);
  
  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  } 
  // Legacy browsers
  else if (mediaQuery.addListener) {
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }
  
  return () => {};
}

// Focus management for modal dialogs
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return () => {};
  
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  };
  
  element.addEventListener('keydown', handleTabKey);
  firstFocusable.focus();
  
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

// Generate accessible labels for 4D shapes
export function getShapeDescription(shapeName: string, vertexCount: number, edgeCount: number): string {
  const descriptions: Record<string, string> = {
    tesseract: `4D hypercube with ${vertexCount} vertices and ${edgeCount} edges. The 4D analog of a cube.`,
    '16cell': `4D cross-polytope with ${vertexCount} vertices and ${edgeCount} edges. Dual of the tesseract.`,
    '24cell': `Self-dual 4D polytope with ${vertexCount} vertices and ${edgeCount} edges. Unique to 4D space.`,
    '5cell': `4D simplex with ${vertexCount} vertices and ${edgeCount} edges. The simplest 4D polytope.`,
    torus: `4D Clifford torus with ${vertexCount} vertices and ${edgeCount} edges. A flat torus in 4D.`,
    sphere: `4D hypersphere with ${vertexCount} vertices and ${edgeCount} edges approximated as a wireframe.`,
    '600cell': `Complex 4D polytope with ${vertexCount} vertices and ${edgeCount} edges. The most intricate regular 4D shape.`,
    'duoprism33': `3,3-duoprism with ${vertexCount} vertices and ${edgeCount} edges. Product of two triangles - unique to 4D.`,
    'duoprism44': `4,4-duoprism with ${vertexCount} vertices and ${edgeCount} edges. Product of two squares - unique to 4D.`,
  };
  
  return descriptions[shapeName] || `4D shape with ${vertexCount} vertices and ${edgeCount} edges.`;
}

// Announce live region updates for screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  
  document.body.appendChild(announcement);
  
  // Add the message after a brief delay to ensure screen readers pick it up
  setTimeout(() => {
    announcement.textContent = message;
  }, 100);
  
  // Clean up after announcement
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 1000);
}

// Keyboard navigation constants
export const KEYBOARD_SHORTCUTS = {
  HELP: 'KeyH',
  RESET_ROTATION: 'KeyR',
  TOGGLE_VERTICES: 'KeyV',
  TOGGLE_EDGES: 'KeyE',
  TOGGLE_AXES: 'KeyA',
  TOGGLE_GRID: 'KeyG',
  TOGGLE_COLOR_BY_W: 'KeyC',
  TOGGLE_SLICE: 'KeyS',
  NEXT_SHAPE: 'KeyN',
  PREVIOUS_SHAPE: 'KeyP',
  TOGGLE_AUTO_ROTATION: 'Space',
  TOGGLE_INFO: 'KeyI',
} as const;