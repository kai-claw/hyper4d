// Educational info panel about the current shape and 4D concepts

import { useStore } from '../store/useStore';
import { SHAPE_CATALOG } from '../engine/shapes4d';
import './InfoPanel.css';

const SHAPE_STATS = {
  tesseract: {
    vertices: 16,
    edges: 32,
    faces: 24,
    cells: 8,
    schlaefli: '{4,3,3}',
  },
  '16cell': {
    vertices: 8,
    edges: 24,
    faces: 32,
    cells: 16,
    schlaefli: '{3,3,4}',
  },
  '24cell': {
    vertices: 24,
    edges: 96,
    faces: 96,
    cells: 24,
    schlaefli: '{3,4,3}',
  },
  '5cell': {
    vertices: 5,
    edges: 10,
    faces: 10,
    cells: 5,
    schlaefli: '{3,3,3}',
  },
  torus: {
    vertices: 'Variable',
    edges: 'Variable',
    faces: 'N/A',
    cells: 'N/A',
    schlaefli: 'N/A',
  },
  sphere: {
    vertices: 'Variable',
    edges: 'Variable', 
    faces: 'N/A',
    cells: 'N/A',
    schlaefli: 'N/A',
  },
  '600cell': {
    vertices: 120,
    edges: 720,
    faces: 1200,
    cells: 600,
    schlaefli: '{3,3,5}',
  },
  'duoprism33': {
    vertices: 9,
    edges: 18,
    faces: 9,
    cells: 1,
    schlaefli: '{3}×{3}',
  },
  'duoprism44': {
    vertices: 16,
    edges: 32,
    faces: 16,
    cells: 1,
    schlaefli: '{4}×{4}',
  },
} as const;

const CONCEPTS = {
  tesseract: {
    funFact: 'A tesseract has 8 cubic cells. Imagine 8 cubes folded together through 4D space — each face of each cube is shared with an adjacent cube.',
    analogy: 'A cube is to a square as a tesseract is to a cube. Just as you can unfold a cube into 6 squares (a cross), you can unfold a tesseract into 8 cubes.',
    interactive: 'Try rotating in the XW or YW planes — watch how the "inner" cube and "outer" cube swap places. This is like flipping a cube inside-out through the 4th dimension!',
    uniqueness: 'The 4D hypercube — foundation of 4D geometry',
  },
  '16cell': {
    funFact: 'The 16-cell is the dual of the tesseract. Where the tesseract has vertices, the 16-cell has cells, and vice versa.',
    analogy: 'In 3D, the octahedron is dual to the cube. In 4D, the 16-cell is dual to the tesseract.',
    interactive: 'Each vertex is connected to 6 others. Rotate in the ZW plane and watch the symmetry — every axis looks the same!',
    uniqueness: 'Regular cross-polytope — maximally symmetric',
  },
  '24cell': {
    funFact: 'The 24-cell exists ONLY in 4D — there\'s no analog in any other dimension. It\'s self-dual and has the symmetry of the F4 exceptional Lie group.',
    analogy: 'Nothing like this exists in 3D! It\'s bounded by 24 octahedral cells. Finding it is like discovering a new Platonic solid.',
    interactive: 'This is the jewel of 4D geometry. Watch how rotating in different planes reveals different symmetries.',
    uniqueness: 'Unique to 4D — self-dual with F4 symmetry!',
  },
  '5cell': {
    funFact: 'The simplest possible shape in 4D, made of 5 tetrahedra. Every vertex connects to every other vertex — it\'s a complete graph K₅!',
    analogy: 'A triangle (2D) → tetrahedron (3D) → 5-cell (4D). Each is the simplest shape in its dimension.',
    interactive: 'With only 5 vertices and 10 edges, this is the easiest 4D shape to follow. Track individual vertices as they rotate!',
    uniqueness: 'The 4D simplex — simplest 4D polytope',
  },
  torus: {
    funFact: 'The Clifford torus is a flat surface — zero curvature — living in 4D. In 3D, a torus must have positive AND negative curvature, but in 4D, a torus can be perfectly flat!',
    analogy: 'Imagine rolling a sheet of paper into a cylinder, then curving that cylinder into a donut — but WITHOUT stretching. That\'s only possible in 4D.',
    interactive: 'Watch the two "circles" of the torus. In 4D, they\'re both the same size — neither is "inner" or "outer". The asymmetry you see is from projection!',
    uniqueness: 'Flat torus — impossible in 3D space',
  },
  sphere: {
    funFact: 'The 3-sphere (S³) is the set of all points equidistant from a center in 4D. You can only see its wireframe shadow here.',
    analogy: 'A circle is the "sphere" of 2D. A sphere is the "sphere" of 3D. The hypersphere is the "sphere" of 4D.',
    interactive: 'Points near the equator cluster together in the projection. Try stereographic projection for a more uniform view!',
    uniqueness: '3-sphere — boundary of 4D ball',
  },
  '600cell': {
    funFact: 'The most complex regular 4D polytope with 600 tetrahedral cells! It has more faces (1200) than vertices (120) — very different from 3D shapes.',
    analogy: 'Like an icosahedron but cranked up to 11. It\'s the 4D equivalent of having maximum complexity.',
    interactive: 'This simplified version shows the incredible complexity. The full 600-cell would crash your browser!',
    uniqueness: 'Most complex regular 4D polytope',
  },
  'duoprism33': {
    funFact: 'A duoprism is the Cartesian product of two polygons — something that can only exist in 4D or higher! Two triangles "multiplied" together.',
    analogy: 'No 3D analogy exists. It\'s like having two separate 2D triangles that somehow form a 4D object.',
    interactive: 'Each vertex represents one vertex from each triangle. Pure 4D thinking!',
    uniqueness: 'Purely 4D — no lower-dimensional analogue',
  },
  'duoprism44': {
    funFact: 'The product of two squares creates this 4D shape. If you slice it, you get squares changing in size — it\'s like a "square tunnel" through 4D.',
    analogy: 'Imagine two squares that somehow combine to form a 4D object. It defies 3D intuition!',
    interactive: 'Try cross-sections to see how it\'s really two squares "multiplied" together through the 4th dimension.',
    uniqueness: 'Product of polygons — unique to 4D+',
  },
} as const;

export function InfoPanel() {
  const { activeShape, showInfo } = useStore();

  if (!showInfo) return null;

  const shape = SHAPE_CATALOG[activeShape];
  const concept = CONCEPTS[activeShape as keyof typeof CONCEPTS];
  const stats = SHAPE_STATS[activeShape as keyof typeof SHAPE_STATS];
  const shapeObj = shape.create(1);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#66bb6a';
      case 'intermediate': return '#ffa726';
      case 'advanced': return '#ef5350';
      default: return '#9e9e9e';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🟢';
      case 'intermediate': return '🟡';
      case 'advanced': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="info-panel">
      <div className="info-header">
        <h3>{shapeObj.name}</h3>
        <div className="difficulty-badge">
          <span className="difficulty-icon">{getDifficultyIcon(shape.difficulty)}</span>
          <span className="difficulty-text" style={{ color: getDifficultyColor(shape.difficulty) }}>
            {shape.difficulty}
          </span>
        </div>
      </div>
      
      <p className="info-desc">{shapeObj.description}</p>

      {/* Enhanced Stats */}
      <div className="info-section">
        <div className="info-label">📊 4D Structure</div>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Vertices:</span>
            <span className="stat-value">{stats?.vertices ?? shapeObj.vertices.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Edges:</span>
            <span className="stat-value">{stats?.edges ?? shapeObj.edges.length}</span>
          </div>
          {stats?.faces !== 'N/A' && (
            <div className="stat-item">
              <span className="stat-label">Faces:</span>
              <span className="stat-value">{stats?.faces}</span>
            </div>
          )}
          {stats?.cells !== 'N/A' && (
            <div className="stat-item">
              <span className="stat-label">Cells:</span>
              <span className="stat-value">{stats?.cells}</span>
            </div>
          )}
          {stats?.schlaefli !== 'N/A' && (
            <div className="stat-item">
              <span className="stat-label">Schläfli:</span>
              <span className="stat-value schlaefli">{stats?.schlaefli}</span>
            </div>
          )}
        </div>
      </div>

      {concept && (
        <>
          <div className="info-section">
            <div className="info-label">✨ What Makes It Special</div>
            <div className="uniqueness-badge">
              {concept.uniqueness}
            </div>
          </div>

          <div className="info-section">
            <div className="info-label">💡 Fun Fact</div>
            <p>{concept.funFact}</p>
          </div>
          <div className="info-section">
            <div className="info-label">🔗 Analogy</div>
            <p>{concept.analogy}</p>
          </div>
          <div className="info-section">
            <div className="info-label">🎮 Try This</div>
            <p>{concept.interactive}</p>
          </div>
        </>
      )}

      <div className="info-section">
        <div className="info-label">📐 Understanding W</div>
        <p>
          The 4th dimension (W) is shown as <span className="w-blue">blue</span> (near) to <span className="w-red">red</span> (far).
          When "Color by W" is enabled, you can see which parts of the object extend deeper into 4D space.
        </p>
      </div>
    </div>
  );
}
