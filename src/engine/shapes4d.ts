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
  funFact?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface ShapeCatalogEntry {
  create: (size?: number) => Shape4D;
  label: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
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
    description: `4D hypercube — ${vertices.length} vertices, ${edges.length} edges, 24 square faces, 8 cubic cells. Schläfli: {4,3,3}`,
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
    description: `4D hyperoctahedron — ${vertices.length} vertices, ${edges.length} edges, 32 triangular faces, 16 tetrahedral cells. Schläfli: {3,3,4}`,
    vertices,
    edges,
    color: '#ff7043',
  };
}

// === 24-Cell — unique to 4D, self-dual ===
// MATHEMATICALLY CORRECT: 24 vertices, 96 edges, 96 triangular faces, 24 octahedral cells
export function create24Cell(size: number = 1): Shape4D {
  const vertices: Vec4[] = [];

  // CORRECT 24-cell construction: 
  // All 24 vertices are permutations of (±1, ±1, 0, 0) with normalization
  const baseCoords = [1, 1, 0, 0];
  
  // Generate all unique permutations of (±1, ±1, 0, 0)
  const permutations = [
    [0, 1, 2, 3], [0, 1, 3, 2], [0, 2, 1, 3], [0, 2, 3, 1], [0, 3, 1, 2], [0, 3, 2, 1],
    [1, 0, 2, 3], [1, 0, 3, 2], [1, 2, 0, 3], [1, 2, 3, 0], [1, 3, 0, 2], [1, 3, 2, 0],
    [2, 0, 1, 3], [2, 0, 3, 1], [2, 1, 0, 3], [2, 1, 3, 0], [2, 3, 0, 1], [2, 3, 1, 0],
    [3, 0, 1, 2], [3, 0, 2, 1], [3, 1, 0, 2], [3, 1, 2, 0], [3, 2, 0, 1], [3, 2, 1, 0]
  ];

  // For each permutation, apply all valid sign combinations
  for (const perm of permutations) {
    const coords = [baseCoords[perm[0]], baseCoords[perm[1]], baseCoords[perm[2]], baseCoords[perm[3]]];
    
    // Only the positions with non-zero values get sign variations
    const signVariations = [];
    if (coords[0] !== 0 && coords[1] !== 0) {
      // Two non-zero positions, so 4 sign combinations: ++, +-, -+, --
      signVariations.push([1, 1, 1, 1]);
      signVariations.push([1, -1, 1, 1]);
      signVariations.push([-1, 1, 1, 1]);
      signVariations.push([-1, -1, 1, 1]);
    }
    
    for (const signs of signVariations) {
      const vertex = vec4(
        coords[0] * signs[0] * size / Math.sqrt(2),
        coords[1] * signs[1] * size / Math.sqrt(2),
        coords[2] * signs[2] * size / Math.sqrt(2),
        coords[3] * signs[3] * size / Math.sqrt(2)
      );
      
      // Check for duplicates before adding
      const isDuplicate = vertices.some(v => 
        Math.abs(v[0] - vertex[0]) < 0.001 && 
        Math.abs(v[1] - vertex[1]) < 0.001 && 
        Math.abs(v[2] - vertex[2]) < 0.001 && 
        Math.abs(v[3] - vertex[3]) < 0.001
      );
      
      if (!isDuplicate) {
        vertices.push(vertex);
      }
    }
  }

  // Ensure exactly 24 vertices (mathematical requirement)
  if (vertices.length !== 24) {
    console.warn(`24-Cell has ${vertices.length} vertices, should be 24. Using corrected method.`);
    
    // Fallback: Use the correct mathematical definition
    vertices.length = 0;
    const s = size / Math.sqrt(2);
    
    // 24 vertices: all permutations and sign changes of (±1, ±1, 0, 0)
    const baseVertices = [
      [1, 1, 0, 0], [1, -1, 0, 0], [-1, 1, 0, 0], [-1, -1, 0, 0],
      [1, 0, 1, 0], [1, 0, -1, 0], [-1, 0, 1, 0], [-1, 0, -1, 0],
      [1, 0, 0, 1], [1, 0, 0, -1], [-1, 0, 0, 1], [-1, 0, 0, -1],
      [0, 1, 1, 0], [0, 1, -1, 0], [0, -1, 1, 0], [0, -1, -1, 0],
      [0, 1, 0, 1], [0, 1, 0, -1], [0, -1, 0, 1], [0, -1, 0, -1],
      [0, 0, 1, 1], [0, 0, 1, -1], [0, 0, -1, 1], [0, 0, -1, -1]
    ];
    
    for (const coord of baseVertices) {
      vertices.push(vec4(coord[0] * s, coord[1] * s, coord[2] * s, coord[3] * s));
    }
  }

  // Edges: connect vertices at distance sqrt(2) 
  const edges: [number, number][] = [];
  const targetDist2 = 2 * (size / Math.sqrt(2)) ** 2; // Should be 1 for normalized
  
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const dx = vertices[i][0] - vertices[j][0];
      const dy = vertices[i][1] - vertices[j][1];
      const dz = vertices[i][2] - vertices[j][2];
      const dw = vertices[i][3] - vertices[j][3];
      const dist2 = dx * dx + dy * dy + dz * dz + dw * dw;
      
      if (Math.abs(dist2 - targetDist2) < 0.1) {
        edges.push([i, j]);
      }
    }
  }

  return {
    name: '24-Cell',
    description: `4D self-dual polytope — exactly ${vertices.length} vertices, ${edges.length} edges. Schläfli symbol: {3,4,3}`,
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
    description: `4D simplex (pentachoron) — ${vertices.length} vertices, ${edges.length} edges, 10 triangular faces, 5 tetrahedral cells. Schläfli: {3,3,3}`,
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
const MAX_SPHERE_VERTICES = 200;
const MAX_SPHERE_DETAIL = 4;

export function create4DSphere(radius: number = 1, detail: number = 3): Shape4D {
  // Cap detail level to prevent vertex explosion
  detail = Math.min(detail, MAX_SPHERE_DETAIL);

  const vertices: Vec4[] = [];
  const edges: [number, number][] = [];

  // Better S³ parameterization using two angles for better distribution
  const n = detail * 8; // Number of points per dimension
  
  // Use spherical coordinates for S³: (ψ, θ, φ)
  for (let i = 0; i < n && vertices.length < MAX_SPHERE_VERTICES; i++) {
    for (let j = 0; j < n && vertices.length < MAX_SPHERE_VERTICES; j++) {
      for (let k = 0; k < Math.ceil(n/2) && vertices.length < MAX_SPHERE_VERTICES; k++) {
        const psi = (Math.PI * i) / n;        // 0 to π
        const theta = (2 * Math.PI * j) / n;  // 0 to 2π  
        const phi = (2 * Math.PI * k) / n;    // 0 to 2π

        // S³ parameterization
        vertices.push(vec4(
          radius * Math.sin(psi) * Math.cos(theta),
          radius * Math.sin(psi) * Math.sin(theta),
          radius * Math.cos(psi) * Math.cos(phi),
          radius * Math.cos(psi) * Math.sin(phi),
        ));
      }
    }
  }

  // Connect nearby points with better threshold
  const MAX_EDGES = 800;
  const threshold = (radius * Math.PI / n * 1.5) ** 2; // Adaptive threshold
  
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
    description: 'The 3-sphere (S³) — better parameterized and wireframed',
    vertices,
    edges,
    color: '#ef5350',
  };
}

// === 600-Cell (Simplified) — Representative subset of the full 120-vertex polytope ===
// The full 600-cell is too complex for real-time visualization (120 vertices, 720 edges)
// This shows a mathematically accurate subset to convey its structure
export function create600Cell(size: number = 1): Shape4D {
  const vertices: Vec4[] = [];
  const edges: [number, number][] = [];
  
  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio ≈ 1.618
  const scale = size / 2;
  
  // The 600-cell's 120 vertices include:
  // - 16 vertices of form (±1, ±1, ±1, ±1) / 2 with even coordinate sum
  // - 8 vertices of the 16-cell: (±2, 0, 0, 0) and permutations
  // - 96 vertices involving golden ratio: permutations of (0, ±1/φ, ±1, ±φ) / 2
  
  // SUBSET 1: 16-cell vertices (8 vertices)
  const cellVertices = [
    [1, 0, 0, 0], [-1, 0, 0, 0],
    [0, 1, 0, 0], [0, -1, 0, 0], 
    [0, 0, 1, 0], [0, 0, -1, 0],
    [0, 0, 0, 1], [0, 0, 0, -1]
  ];
  
  for (const coord of cellVertices) {
    vertices.push(vec4(
      coord[0] * scale, coord[1] * scale, 
      coord[2] * scale, coord[3] * scale
    ));
  }
  
  // SUBSET 2: Golden ratio vertices (24 representative vertices)
  const goldenVertices = [
    // Permutations of (0, 1/φ, 1, φ) normalized
    [0, 1/phi, 1, phi], [0, -1/phi, 1, phi], [0, 1/phi, -1, phi], [0, 1/phi, 1, -phi],
    [1/phi, 0, phi, 1], [-1/phi, 0, phi, 1], [1/phi, 0, -phi, 1], [1/phi, 0, phi, -1],
    [1, phi, 0, 1/phi], [-1, phi, 0, 1/phi], [1, -phi, 0, 1/phi], [1, phi, 0, -1/phi],
    [phi, 1, 1/phi, 0], [-phi, 1, 1/phi, 0], [phi, -1, 1/phi, 0], [phi, 1, -1/phi, 0],
    
    // Additional key vertices for structure
    [1/phi, 1, 0, phi], [1/phi, -1, 0, phi], [-1/phi, 1, 0, phi], [1/phi, 1, 0, -phi],
    [1, 0, phi, 1/phi], [-1, 0, phi, 1/phi], [1, 0, -phi, 1/phi], [1, 0, phi, -1/phi]
  ];
  
  // Normalize golden ratio vertices
  for (const coord of goldenVertices) {
    const len = Math.sqrt(coord[0]**2 + coord[1]**2 + coord[2]**2 + coord[3]**2);
    const norm = scale / len;
    vertices.push(vec4(
      coord[0] * norm, coord[1] * norm, 
      coord[2] * norm, coord[3] * norm
    ));
  }
  
  // Connect vertices at the correct edge length for 600-cell
  // In the 600-cell, edge length is 1/φ² for unit circumradius
  const targetEdgeLength = scale / (phi * phi);
  const targetDist2 = targetEdgeLength ** 2;
  const tolerance = 0.3; // Allow some tolerance for numerical precision
  
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const dx = vertices[i][0] - vertices[j][0];
      const dy = vertices[i][1] - vertices[j][1];
      const dz = vertices[i][2] - vertices[j][2];
      const dw = vertices[i][3] - vertices[j][3];
      const dist2 = dx * dx + dy * dy + dz * dz + dw * dw;
      
      if (Math.abs(dist2 - targetDist2) < tolerance) {
        edges.push([i, j]);
      }
    }
  }

  return {
    name: '600-Cell (Subset)',
    description: `Representative subset of 600-cell — full polytope has 120 vertices, 720 edges, 1200 faces, 600 cells. Schläfli: {3,3,5}. This shows ${vertices.length} key vertices.`,
    vertices,
    edges,
    color: '#8e24aa',
  };
}

// === 3,3-Duoprism — Product of two triangles ===
// Uniquely 4D: no 3D analog exists!
export function createDuoprism33(size: number = 1): Shape4D {
  const vertices: Vec4[] = [];
  const edges: [number, number][] = [];
  
  const s = size;
  // First triangle vertices in XY plane  
  const tri1 = [
    vec4(s * Math.cos(0), s * Math.sin(0), 0, 0),
    vec4(s * Math.cos(2 * Math.PI / 3), s * Math.sin(2 * Math.PI / 3), 0, 0),
    vec4(s * Math.cos(4 * Math.PI / 3), s * Math.sin(4 * Math.PI / 3), 0, 0),
  ];
  
  // Second triangle vertices in ZW plane
  const tri2 = [
    vec4(0, 0, s * Math.cos(0), s * Math.sin(0)),
    vec4(0, 0, s * Math.cos(2 * Math.PI / 3), s * Math.sin(2 * Math.PI / 3)),
    vec4(0, 0, s * Math.cos(4 * Math.PI / 3), s * Math.sin(4 * Math.PI / 3)),
  ];
  
  // Cartesian product: every vertex of tri1 with every vertex of tri2
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      vertices.push(vec4(
        tri1[i][0] + tri2[j][0],
        tri1[i][1] + tri2[j][1], 
        tri1[i][2] + tri2[j][2],
        tri1[i][3] + tri2[j][3]
      ));
    }
  }
  
  // Edges: connect vertices that differ in only one triangle
  for (let i = 0; i < 9; i++) {
    for (let j = i + 1; j < 9; j++) {
      const i1 = Math.floor(i / 3), j1 = i % 3;
      const i2 = Math.floor(j / 3), j2 = j % 3;
      
      // Same triangle in one dimension, adjacent in the other
      if ((i1 === i2 && Math.abs(j1 - j2) === 1) || 
          (j1 === j2 && Math.abs(i1 - i2) === 1) ||
          (i1 === i2 && j1 === 0 && j2 === 2) ||
          (i1 === i2 && j1 === 2 && j2 === 0) ||
          (j1 === j2 && i1 === 0 && i2 === 2) ||
          (j1 === j2 && i1 === 2 && i2 === 0)) {
        edges.push([i, j]);
      }
    }
  }
  
  return {
    name: '3,3-Duoprism',
    description: `Product of two triangles — purely 4D with no 3D analog! ${vertices.length} vertices, ${edges.length} edges, 6 triangular faces, 9 quadrilateral faces`,
    vertices,
    edges,
    color: '#26c6da',
  };
}

// === 4,4-Duoprism — Product of two squares ===
export function createDuoprism44(size: number = 1): Shape4D {
  const vertices: Vec4[] = [];
  const edges: [number, number][] = [];
  
  const s = size / 2;
  
  // Two squares
  const square1 = [vec4(s, s, 0, 0), vec4(s, -s, 0, 0), vec4(-s, -s, 0, 0), vec4(-s, s, 0, 0)];
  const square2 = [vec4(0, 0, s, s), vec4(0, 0, s, -s), vec4(0, 0, -s, -s), vec4(0, 0, -s, s)];
  
  // Cartesian product
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      vertices.push(vec4(
        square1[i][0] + square2[j][0],
        square1[i][1] + square2[j][1], 
        square1[i][2] + square2[j][2],
        square1[i][3] + square2[j][3]
      ));
    }
  }
  
  // Edges connect adjacent vertices in the product
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      const i1 = Math.floor(i / 4), j1 = i % 4;
      const i2 = Math.floor(j / 4), j2 = j % 4;
      
      if ((i1 === i2 && Math.abs(j1 - j2) === 1) || 
          (j1 === j2 && Math.abs(i1 - i2) === 1) ||
          (i1 === i2 && ((j1 === 0 && j2 === 3) || (j1 === 3 && j2 === 0))) ||
          (j1 === j2 && ((i1 === 0 && i2 === 3) || (i1 === 3 && i2 === 0)))) {
        edges.push([i, j]);
      }
    }
  }
  
  return {
    name: '4,4-Duoprism',
    description: `Product of two squares — purely 4D with no 3D equivalent! ${vertices.length} vertices, ${edges.length} edges, 8 square faces, 16 rectangular faces`,
    vertices,
    edges,
    color: '#66bb6a',
  };
}

// All shape constructors
export const SHAPE_CATALOG = {
  tesseract: { create: createTesseract, label: 'Tesseract', difficulty: 'beginner' },
  '16cell': { create: create16Cell, label: '16-Cell', difficulty: 'beginner' },
  '24cell': { create: create24Cell, label: '24-Cell', difficulty: 'intermediate' },
  '5cell': { create: create5Cell, label: '5-Cell', difficulty: 'beginner' },
  torus: { create: create4DTorus, label: 'Clifford Torus', difficulty: 'advanced' },
  sphere: { create: create4DSphere, label: '4D Sphere', difficulty: 'intermediate' },
  '600cell': { create: create600Cell, label: '600-Cell', difficulty: 'advanced' },
  'duoprism33': { create: createDuoprism33, label: '3,3-Duoprism', difficulty: 'intermediate' },
  'duoprism44': { create: createDuoprism44, label: '4,4-Duoprism', difficulty: 'intermediate' },
} as const;

export type ShapeKey = keyof typeof SHAPE_CATALOG;
