// 4D Shape Definitions — vertices and edges for common 4D objects

import type { Vec4 } from './math4d';
import { vec4 } from './math4d';

export interface Shape4D {
  name: string;
  description: string;
  vertices: Vec4[];
  edges: [number, number][]; // pairs of vertex indices
  faces?: number[][]; // groups of vertex indices forming faces
  cells?: number[][]; // groups of face indices forming cells (for 4D polytopes)
  color: string;
}

// === Tesseract (Hypercube) — 4D analog of a cube ===
// 16 vertices, 32 edges, 24 faces, 8 cells
export function createTesseract(size: number = 1): Shape4D {
  const s = size / 2;
  const vertices: Vec4[] = [];

  // Generate all 16 vertices: every combination of ±s in 4 dimensions
  for (let i = 0; i < 16; i++) {
    vertices.push(vec4(
      (i & 1) ? s : -s,
      (i & 2) ? s : -s,
      (i & 4) ? s : -s,
      (i & 8) ? s : -s,
    ));
  }

  // Edges connect vertices that differ in exactly one coordinate
  const edges: [number, number][] = [];
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      // XOR gives bits that differ; if it's a power of 2, exactly one bit differs
      const diff = i ^ j;
      if (diff && (diff & (diff - 1)) === 0) {
        edges.push([i, j]);
      }
    }
  }

  return {
    name: 'Tesseract',
    description: '4D hypercube — 16 vertices, 32 edges, 24 square faces, 8 cubic cells',
    vertices,
    edges,
    color: '#4fc3f7',
  };
}

// === 16-Cell (Hyperoctahedron) — dual of the tesseract ===
// 8 vertices, 24 edges, 32 triangular faces, 16 tetrahedral cells
export function create16Cell(size: number = 1): Shape4D {
  const s = size;
  const vertices: Vec4[] = [
    vec4(s, 0, 0, 0),
    vec4(-s, 0, 0, 0),
    vec4(0, s, 0, 0),
    vec4(0, -s, 0, 0),
    vec4(0, 0, s, 0),
    vec4(0, 0, -s, 0),
    vec4(0, 0, 0, s),
    vec4(0, 0, 0, -s),
  ];

  // Every pair of non-antipodal vertices is connected
  const edges: [number, number][] = [];
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      // Antipodal pairs: (0,1), (2,3), (4,5), (6,7)
      if (Math.floor(i / 2) !== Math.floor(j / 2)) {
        edges.push([i, j]);
      }
    }
  }

  return {
    name: '16-Cell',
    description: '4D hyperoctahedron — 8 vertices, 24 edges, 32 triangular faces',
    vertices,
    edges,
    color: '#ff7043',
  };
}

// === 24-Cell — unique to 4D, self-dual ===
// 24 vertices, 96 edges, 96 triangular faces, 24 octahedral cells
export function create24Cell(size: number = 1): Shape4D {
  const s = size;
  const vertices: Vec4[] = [];

  // 16 vertices from permutations of (±1, 0, 0, 0)
  for (let i = 0; i < 4; i++) {
    const pos: Vec4 = [0, 0, 0, 0];
    const neg: Vec4 = [0, 0, 0, 0];
    pos[i] = s;
    neg[i] = -s;
    vertices.push(pos);
    vertices.push(neg);
  }

  // 8 vertices from (±½, ±½, ±½, ±½)
  const h = s / 2;
  for (let i = 0; i < 16; i++) {
    // Only include those with even number of negative signs
    const v: Vec4 = [
      (i & 1) ? h : -h,
      (i & 2) ? h : -h,
      (i & 4) ? h : -h,
      (i & 8) ? h : -h,
    ];
    vertices.push(v);
  }

  // Edges: connect vertices at distance 1 from each other
  const edges: [number, number][] = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const dx = vertices[i][0] - vertices[j][0];
      const dy = vertices[i][1] - vertices[j][1];
      const dz = vertices[i][2] - vertices[j][2];
      const dw = vertices[i][3] - vertices[j][3];
      const dist2 = dx * dx + dy * dy + dz * dz + dw * dw;
      if (Math.abs(dist2 - s * s) < 0.01) {
        edges.push([i, j]);
      }
    }
  }

  return {
    name: '24-Cell',
    description: '4D self-dual polytope — 24 vertices, 96 edges. Unique to 4D!',
    vertices,
    edges,
    color: '#ab47bc',
  };
}

// === 5-Cell (Pentachoron / 4-simplex) — 4D analog of tetrahedron ===
// 5 vertices, 10 edges, 10 triangular faces, 5 tetrahedral cells
export function create5Cell(size: number = 1): Shape4D {
  const s = size;
  // Regular 5-cell vertices (normalized)
  const a = s / Math.sqrt(10);
  const b = s / Math.sqrt(6);
  const c = s / Math.sqrt(3);
  const d = s;

  const vertices: Vec4[] = [
    vec4(a * 4, 0, 0, 0),
    vec4(-a, b * 3, 0, 0),
    vec4(-a, -b, c * 2, 0),
    vec4(-a, -b, -c, d),
    vec4(-a, -b, -c, -d),
  ];

  // Normalize all to same radius
  const targetR = size;
  for (let i = 0; i < vertices.length; i++) {
    const len = Math.sqrt(
      vertices[i][0] ** 2 + vertices[i][1] ** 2 +
      vertices[i][2] ** 2 + vertices[i][3] ** 2
    );
    if (len > 0) {
      vertices[i] = vertices[i].map(v => (v / len) * targetR) as Vec4;
    }
  }

  // All pairs of vertices are connected (complete graph K5)
  const edges: [number, number][] = [];
  for (let i = 0; i < 5; i++) {
    for (let j = i + 1; j < 5; j++) {
      edges.push([i, j]);
    }
  }

  return {
    name: '5-Cell',
    description: '4D simplex (pentachoron) — 5 vertices, 10 edges, the simplest 4D shape',
    vertices,
    edges,
    color: '#66bb6a',
  };
}

// === 4D Torus — Clifford torus embedded in 4D ===
const MAX_TORUS_SEGMENTS = 24;

export function create4DTorus(
  majorRadius: number = 1,
  minorRadius: number = 0.4,
  segments1: number = 16,
  segments2: number = 16
): Shape4D {
  // Cap segments to prevent runaway geometry
  segments1 = Math.min(segments1, MAX_TORUS_SEGMENTS);
  segments2 = Math.min(segments2, MAX_TORUS_SEGMENTS);

  const vertices: Vec4[] = [];
  const edges: [number, number][] = [];

  for (let i = 0; i < segments1; i++) {
    const theta = (2 * Math.PI * i) / segments1;
    for (let j = 0; j < segments2; j++) {
      const phi = (2 * Math.PI * j) / segments2;

      // Clifford torus parametrization in 4D
      vertices.push(vec4(
        majorRadius * Math.cos(theta),
        majorRadius * Math.sin(theta),
        minorRadius * Math.cos(phi),
        minorRadius * Math.sin(phi),
      ));

      const idx = i * segments2 + j;
      const nextJ = i * segments2 + ((j + 1) % segments2);
      const nextI = ((i + 1) % segments1) * segments2 + j;

      edges.push([idx, nextJ]);
      edges.push([idx, nextI]);
    }
  }

  return {
    name: 'Clifford Torus',
    description: 'A flat torus living in 4D — both circles are "major" circles',
    vertices,
    edges,
    color: '#ffa726',
  };
}

// === 4D Sphere (approximation via geodesic points) ===
const MAX_SPHERE_VERTICES = 256;
const MAX_SPHERE_DETAIL = 5;

export function create4DSphere(radius: number = 1, detail: number = 4): Shape4D {
  // Cap detail level to prevent O(n^3) vertex explosion
  detail = Math.min(detail, MAX_SPHERE_DETAIL);

  const vertices: Vec4[] = [];
  const edges: [number, number][] = [];

  // Generate points on the 3-sphere using Hopf fibration-like sampling
  for (let i = 0; i < detail && vertices.length < MAX_SPHERE_VERTICES; i++) {
    const theta1 = (Math.PI * i) / detail;
    for (let j = 0; j < detail * 2 && vertices.length < MAX_SPHERE_VERTICES; j++) {
      const theta2 = (Math.PI * j) / detail;
      for (let k = 0; k < 4 && vertices.length < MAX_SPHERE_VERTICES; k++) {
        const theta3 = (Math.PI * k) / 2;

        vertices.push(vec4(
          radius * Math.sin(theta1) * Math.sin(theta2) * Math.cos(theta3),
          radius * Math.sin(theta1) * Math.sin(theta2) * Math.sin(theta3),
          radius * Math.sin(theta1) * Math.cos(theta2),
          radius * Math.cos(theta1),
        ));
      }
    }
  }

  // Connect nearby points (with edge count cap for performance)
  const MAX_EDGES = 1024;
  const threshold = (radius * 0.6) ** 2;
  for (let i = 0; i < vertices.length && edges.length < MAX_EDGES; i++) {
    for (let j = i + 1; j < vertices.length && edges.length < MAX_EDGES; j++) {
      const dx = vertices[i][0] - vertices[j][0];
      const dy = vertices[i][1] - vertices[j][1];
      const dz = vertices[i][2] - vertices[j][2];
      const dw = vertices[i][3] - vertices[j][3];
      const dist2 = dx * dx + dy * dy + dz * dz + dw * dw;
      if (dist2 < threshold) {
        edges.push([i, j]);
      }
    }
  }

  return {
    name: '4D Sphere',
    description: 'The 3-sphere (S³) — sampled and wireframed',
    vertices,
    edges,
    color: '#ef5350',
  };
}

// All shape constructors
export const SHAPE_CATALOG = {
  tesseract: { create: createTesseract, label: 'Tesseract (Hypercube)' },
  '16cell': { create: create16Cell, label: '16-Cell' },
  '24cell': { create: create24Cell, label: '24-Cell' },
  '5cell': { create: create5Cell, label: '5-Cell (Simplex)' },
  torus: { create: create4DTorus, label: 'Clifford Torus' },
  sphere: { create: create4DSphere, label: '4D Sphere' },
} as const;

export type ShapeKey = keyof typeof SHAPE_CATALOG;
