/**
 * WebGL context loss recovery utilities
 */
import { announceToScreenReader } from './accessibility';

export interface WebGLRecoveryHandlers {
  onContextLost: () => void;
  onContextRestored: () => void;
}

export function setupWebGLRecovery(canvas: HTMLCanvasElement, handlers: WebGLRecoveryHandlers): () => void {
  const handleContextLost = (event: Event) => {
    console.warn('WebGL context lost, attempting recovery...');
    announceToScreenReader('Graphics context lost, attempting to recover', 'assertive');
    event.preventDefault(); // Prevent default context loss behavior
    handlers.onContextLost();
  };

  const handleContextRestored = () => {
    announceToScreenReader('Graphics context restored successfully', 'assertive');
    handlers.onContextRestored();
  };

  canvas.addEventListener('webglcontextlost', handleContextLost, false);
  canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

  return () => {
    canvas.removeEventListener('webglcontextlost', handleContextLost);
    canvas.removeEventListener('webglcontextrestored', handleContextRestored);
  };
}

// Constants for performance and edge case handling
export const PERFORMANCE_LIMITS = {
  MAX_VERTICES: 1000,
  MAX_EDGES: 2000,
  MAX_FPS_SAMPLE_SIZE: 60,
  MIN_ACCEPTABLE_FPS: 15,
  MEMORY_CHECK_INTERVAL: 5000, // 5 seconds
} as const;

// Detect if we're in a performance-constrained environment
export function isLowEndDevice(): boolean {
  // Check device memory if available
  if ('memory' in navigator && (navigator as any).memory) {
    const memoryInfo = (navigator as any).memory as any;
    if (memoryInfo.deviceMemory && memoryInfo.deviceMemory <= 2) {
      return true;
    }
  }

  // Check hardware concurrency
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    return true;
  }

  // Check user agent for known low-end indicators
  const userAgent = navigator.userAgent.toLowerCase();
  const lowEndIndicators = ['android 4', 'android 5', 'android 6'];
  
  return lowEndIndicators.some(indicator => userAgent.includes(indicator));
}

// Performance monitoring utility
export class PerformanceMonitor {
  private fpsHistory: number[] = [];
  private lastFrameTime = performance.now();
  private lowPerformanceCallback?: () => void;

  constructor(onLowPerformance?: () => void) {
    this.lowPerformanceCallback = onLowPerformance;
  }

  recordFrame(): number {
    const now = performance.now();
    const fps = 1000 / (now - this.lastFrameTime);
    this.lastFrameTime = now;

    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > PERFORMANCE_LIMITS.MAX_FPS_SAMPLE_SIZE) {
      this.fpsHistory.shift();
    }

    // Check for sustained low performance
    if (this.fpsHistory.length >= 30) {
      const averageFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
      if (averageFPS < PERFORMANCE_LIMITS.MIN_ACCEPTABLE_FPS && this.lowPerformanceCallback) {
        this.lowPerformanceCallback();
        this.fpsHistory = []; // Reset to avoid repeated callbacks
      }
    }

    return fps;
  }

  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }

  reset(): void {
    this.fpsHistory = [];
    this.lastFrameTime = performance.now();
  }
}