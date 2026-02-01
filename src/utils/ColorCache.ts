/**
 * Performance-optimized color utilities to avoid creating new Color objects every frame
 */
import * as THREE from 'three';

// Color constants to avoid recreating
const DEEP_BLUE = new THREE.Color(0x0a1a3d);
const CYAN = new THREE.Color(0x00bcd4);
const MAGENTA = new THREE.Color(0xe91e63);
const GOLD = new THREE.Color(0xffc107);

// Reusable color instances for interpolation (available for future use)

/**
 * Cached W-depth to color mapping with premium gradients
 * Uses singleton Color instances to avoid garbage collection pressure
 */
export function wToColorCached(w: number, minW: number, maxW: number, targetColor: THREE.Color): void {
  const range = maxW - minW || 1;
  const t = Math.max(0, Math.min(1, (w - minW) / range));
  
  // Premium color palette: deep blue → cyan → magenta → gold
  if (t < 0.33) {
    const s = t / 0.33;
    targetColor.lerpColors(DEEP_BLUE, CYAN, s);
  } else if (t < 0.67) {
    const s = (t - 0.33) / 0.34;
    targetColor.lerpColors(CYAN, MAGENTA, s);
  } else {
    const s = (t - 0.67) / 0.33;
    targetColor.lerpColors(MAGENTA, GOLD, s);
  }
}

// Color cache for vertex materials
const colorCache = new Map<string, THREE.Color>();

export function getCachedColor(key: string, fallback: string): THREE.Color {
  if (!colorCache.has(key)) {
    colorCache.set(key, new THREE.Color(fallback));
  }
  return colorCache.get(key)!;
}

export function setCachedColor(key: string, color: THREE.Color): void {
  if (!colorCache.has(key)) {
    colorCache.set(key, new THREE.Color());
  }
  colorCache.get(key)!.copy(color);
}