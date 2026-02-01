/**
 * Stress testing and edge case handling utilities
 */
import { SHAPE_CATALOG } from '../engine/shapes4d';
import type { ShapeKey } from '../engine/shapes4d';
import { announceToScreenReader } from './accessibility';
import { PERFORMANCE_LIMITS } from './webglRecovery';

// Test all shapes for potential issues
export function runShapeValidation(): { passed: boolean; issues: string[] } {
  const issues: string[] = [];
  
  for (const [key, factory] of Object.entries(SHAPE_CATALOG) as [ShapeKey, any][]) {
    try {
      const shape = factory.create(1);
      
      // Check vertex count
      if (shape.vertices.length > PERFORMANCE_LIMITS.MAX_VERTICES) {
        issues.push(`${key}: Too many vertices (${shape.vertices.length} > ${PERFORMANCE_LIMITS.MAX_VERTICES})`);
      }
      
      // Check edge count
      if (shape.edges.length > PERFORMANCE_LIMITS.MAX_EDGES) {
        issues.push(`${key}: Too many edges (${shape.edges.length} > ${PERFORMANCE_LIMITS.MAX_EDGES})`);
      }
      
      // Check for NaN values
      for (let i = 0; i < shape.vertices.length; i++) {
        const vertex = shape.vertices[i];
        if (vertex.some((v: number) => !isFinite(v))) {
          issues.push(`${key}: Invalid vertex at index ${i}: [${vertex.join(', ')}]`);
        }
      }
      
      // Check for duplicate vertices
      const seen = new Set();
      for (let i = 0; i < shape.vertices.length; i++) {
        const vertexKey = shape.vertices[i].join(',');
        if (seen.has(vertexKey)) {
          issues.push(`${key}: Duplicate vertex at index ${i}`);
        }
        seen.add(vertexKey);
      }
      
      // Check edge validity
      for (let i = 0; i < shape.edges.length; i++) {
        const [a, b] = shape.edges[i];
        if (a < 0 || a >= shape.vertices.length || b < 0 || b >= shape.vertices.length) {
          issues.push(`${key}: Invalid edge [${a}, ${b}] - vertex indices out of range`);
        }
        if (a === b) {
          issues.push(`${key}: Self-loop edge at vertex ${a}`);
        }
      }
      
    } catch (error) {
      issues.push(`${key}: Failed to create shape - ${error}`);
    }
  }
  
  return { passed: issues.length === 0, issues };
}

// Test rapid state changes to look for race conditions
export async function testRapidStateChanges(store: any): Promise<{ passed: boolean; issues: string[] }> {
  const issues: string[] = [];
  const shapes = Object.keys(SHAPE_CATALOG) as ShapeKey[];
  
  try {
    // Rapidly switch shapes
    for (let i = 0; i < 10; i++) {
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
      store.setActiveShape(randomShape);
      await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay
    }
    
    // Rapidly toggle all rotation planes
    for (let i = 0; i < 5; i++) {
      store.setRotation('xy', Math.random() * Math.PI * 2);
      store.setRotation('xz', Math.random() * Math.PI * 2);
      store.setRotation('xw', Math.random() * Math.PI * 2);
      store.setRotation('yz', Math.random() * Math.PI * 2);
      store.setRotation('yw', Math.random() * Math.PI * 2);
      store.setRotation('zw', Math.random() * Math.PI * 2);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Test extreme parameter values
    const extremeValues = [-10, -1, 0, 1, 10, 100, -100];
    for (const value of extremeValues) {
      store.setViewDistance(Math.abs(value) + 1); // Ensure positive
      store.setEdgeOpacity(Math.max(0, Math.min(1, value / 10))); // Clamp to 0-1
      store.setVertexSize(Math.max(0.01, Math.min(1, Math.abs(value) / 10))); // Clamp to reasonable range
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
  } catch (error) {
    issues.push(`State change test failed: ${error}`);
  }
  
  return { passed: issues.length === 0, issues };
}

// Memory usage monitoring
export class MemoryMonitor {
  private samples: number[] = [];
  private maxSamples = 100;
  
  recordMemoryUsage(): void {
    if ('memory' in performance && (performance as any).memory) {
      const memoryInfo = (performance as any).memory;
      this.samples.push(memoryInfo.usedJSHeapSize);
      if (this.samples.length > this.maxSamples) {
        this.samples.shift();
      }
    }
  }
  
  getMemoryTrend(): 'increasing' | 'stable' | 'unknown' {
    if (this.samples.length < 10) return 'unknown';
    
    const recent = this.samples.slice(-10);
    const older = this.samples.slice(-20, -10);
    
    if (older.length === 0) return 'unknown';
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const threshold = 1024 * 1024; // 1MB threshold
    
    if (recentAvg - olderAvg > threshold) {
      return 'increasing';
    }
    
    return 'stable';
  }
  
  formatMemoryUsage(): string {
    if (this.samples.length === 0) return 'Unknown';
    const latest = this.samples[this.samples.length - 1];
    return `${(latest / 1024 / 1024).toFixed(1)} MB`;
  }
}

// Run comprehensive stress test
export async function runStressTest(): Promise<void> {
  announceToScreenReader('Starting stress test', 'assertive');
  
  console.log('🔍 Running Hyper4D stress test...');
  
  // Shape validation
  const shapeTest = runShapeValidation();
  console.log('📊 Shape validation:', shapeTest.passed ? '✅ PASSED' : '❌ FAILED');
  if (!shapeTest.passed) {
    shapeTest.issues.forEach(issue => console.warn('⚠️', issue));
  }
  
  // Memory monitoring
  const memoryMonitor = new MemoryMonitor();
  memoryMonitor.recordMemoryUsage();
  console.log('💾 Memory usage:', memoryMonitor.formatMemoryUsage());
  
  console.log('✅ Stress test completed');
  announceToScreenReader('Stress test completed', 'polite');
}

// Edge case constants
export const EDGE_CASE_LIMITS = {
  MIN_VIEW_DISTANCE: 0.1,
  MAX_VIEW_DISTANCE: 50,
  MIN_EDGE_OPACITY: 0,
  MAX_EDGE_OPACITY: 1,
  MIN_VERTEX_SIZE: 0.001,
  MAX_VERTEX_SIZE: 2,
  MAX_ROTATION_SPEED: 5, // radians per second
} as const;

// Clamp values to safe ranges
export function clampToSafeRange(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}