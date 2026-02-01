// 4D Drag Rotation — Shift+drag or right-drag to rotate in 4D planes
// Horizontal movement → XW rotation, Vertical movement → YW rotation
// Shift+Ctrl drag → ZW rotation (horizontal)

import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';

interface DragState {
  active: boolean;
  startX: number;
  startY: number;
  startXW: number;
  startYW: number;
  startZW: number;
  mode: 'xw-yw' | 'zw';
}

export function useDrag4D(canvasContainer: React.RefObject<HTMLDivElement | null>) {
  const store = useStore();
  const dragRef = useRef<DragState>({
    active: false,
    startX: 0,
    startY: 0,
    startXW: 0,
    startYW: 0,
    startZW: 0,
    mode: 'xw-yw',
  });

  const sensitivity = 0.006;

  const handlePointerDown = useCallback((e: PointerEvent) => {
    // Shift+click or right-click → 4D drag
    const is4DDrag = e.shiftKey || e.button === 2;
    if (!is4DDrag) return;

    e.preventDefault();
    const state = useStore.getState();
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startXW: state.rotation.xw,
      startYW: state.rotation.yw,
      startZW: state.rotation.zw,
      mode: e.ctrlKey || e.metaKey ? 'zw' : 'xw-yw',
    };

    // Capture pointer for smooth drag
    (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!dragRef.current.active) return;

    const dx = (e.clientX - dragRef.current.startX) * sensitivity;
    const dy = (e.clientY - dragRef.current.startY) * sensitivity;

    if (dragRef.current.mode === 'zw') {
      store.setRotation('zw', dragRef.current.startZW + dx);
    } else {
      store.setRotation('xw', dragRef.current.startXW + dx);
      store.setRotation('yw', dragRef.current.startYW + dy);
    }
  }, [store]);

  const handlePointerUp = useCallback(() => {
    dragRef.current.active = false;
  }, []);

  const handleContextMenu = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    const el = canvasContainer.current;
    if (!el) return;

    el.addEventListener('pointerdown', handlePointerDown);
    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerup', handlePointerUp);
    el.addEventListener('pointercancel', handlePointerUp);
    el.addEventListener('contextmenu', handleContextMenu);

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerup', handlePointerUp);
      el.removeEventListener('pointercancel', handlePointerUp);
      el.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [canvasContainer, handlePointerDown, handlePointerMove, handlePointerUp, handleContextMenu]);
}
