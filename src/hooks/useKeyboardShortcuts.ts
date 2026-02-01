// Keyboard shortcut handler for Hyper4D

import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { ShapeKey } from '../engine/shapes4d';

const SHAPE_KEYS: Record<string, ShapeKey> = {
  '1': 'tesseract',
  '2': '16cell',
  '3': '24cell',
  '4': '5cell',
  '5': 'torus',
  '6': 'sphere',
};

export function useKeyboardShortcuts() {
  const store = useStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      const key = e.key.toLowerCase();

      // Shape selection: 1-6
      if (SHAPE_KEYS[key]) {
        e.preventDefault();
        store.setActiveShape(SHAPE_KEYS[key]);
        return;
      }

      switch (key) {
        // Toggle auto-rotation
        case ' ':
          e.preventDefault();
          store.toggleAutoRotation();
          break;

        // Reset rotation
        case 'r':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            store.resetRotation();
          }
          break;

        // Toggle help
        case 'h':
        case '?':
          e.preventDefault();
          store.toggleHelp();
          break;

        // Toggle vertices
        case 'v':
          e.preventDefault();
          store.toggleShowVertices();
          break;

        // Toggle edges
        case 'e':
          e.preventDefault();
          store.toggleShowEdges();
          break;

        // Toggle axes
        case 'a':
          e.preventDefault();
          store.toggleShowAxes();
          break;

        // Toggle color by W
        case 'c':
          e.preventDefault();
          store.toggleColorByW();
          break;

        // Toggle grid
        case 'g':
          e.preventDefault();
          store.toggleShowGrid();
          break;

        // Toggle W-slice
        case 'x':
          e.preventDefault();
          store.toggleShowSlice();
          break;

        // Projection modes
        case 'p':
          e.preventDefault();
          store.setProjectionMode('perspective');
          break;
        case 'o':
          e.preventDefault();
          store.setProjectionMode('orthographic');
          break;
        case 's':
          e.preventDefault();
          store.setProjectionMode('stereographic');
          break;

        // Toggle info panel
        case 'i':
          e.preventDefault();
          store.toggleInfo();
          break;

        // Arrow keys: nudge 4D rotation
        case 'arrowleft':
          e.preventDefault();
          if (e.shiftKey) {
            store.setRotation('zw', store.rotation.zw - 0.1);
          } else {
            store.setRotation('xw', store.rotation.xw - 0.1);
          }
          break;
        case 'arrowright':
          e.preventDefault();
          if (e.shiftKey) {
            store.setRotation('zw', store.rotation.zw + 0.1);
          } else {
            store.setRotation('xw', store.rotation.xw + 0.1);
          }
          break;
        case 'arrowup':
          e.preventDefault();
          if (e.shiftKey) {
            store.setRotation('yw', store.rotation.yw - 0.1);
          } else {
            store.setRotation('yw', store.rotation.yw - 0.1);
          }
          break;
        case 'arrowdown':
          e.preventDefault();
          if (e.shiftKey) {
            store.setRotation('yw', store.rotation.yw + 0.1);
          } else {
            store.setRotation('yw', store.rotation.yw + 0.1);
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store]);
}
