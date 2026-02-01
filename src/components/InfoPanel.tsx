// Educational info panel about the current shape and 4D concepts

import { useStore } from '../store/useStore';
import { SHAPE_CATALOG } from '../engine/shapes4d';
import './InfoPanel.css';

const CONCEPTS = {
  tesseract: {
    funFact: 'A tesseract has 8 cubic cells. Imagine 8 cubes folded together through 4D space — each face of each cube is shared with an adjacent cube.',
    analogy: 'A cube is to a square as a tesseract is to a cube. Just as you can unfold a cube into 6 squares (a cross), you can unfold a tesseract into 8 cubes.',
    interactive: 'Try rotating in the XW or YW planes — watch how the "inner" cube and "outer" cube swap places. This is like flipping a cube inside-out through the 4th dimension!',
  },
  '16cell': {
    funFact: 'The 16-cell is the dual of the tesseract. Where the tesseract has vertices, the 16-cell has cells, and vice versa.',
    analogy: 'In 3D, the octahedron is dual to the cube. In 4D, the 16-cell is dual to the tesseract.',
    interactive: 'Each vertex is connected to 6 others. Rotate in the ZW plane and watch the symmetry — every axis looks the same!',
  },
  '24cell': {
    funFact: 'The 24-cell exists ONLY in 4D — there\'s no analog in any other dimension. It\'s self-dual and has the symmetry of the F4 exceptional Lie group.',
    analogy: 'Nothing like this exists in 3D! It\'s bounded by 24 octahedral cells. Finding it is like discovering a new Platonic solid.',
    interactive: 'This is the jewel of 4D geometry. Watch how rotating in different planes reveals different symmetries.',
  },
  '5cell': {
    funFact: 'The simplest possible shape in 4D, made of 5 tetrahedra. Every vertex connects to every other vertex — it\'s a complete graph K₅!',
    analogy: 'A triangle (2D) → tetrahedron (3D) → 5-cell (4D). Each is the simplest shape in its dimension.',
    interactive: 'With only 5 vertices and 10 edges, this is the easiest 4D shape to follow. Track individual vertices as they rotate!',
  },
  torus: {
    funFact: 'The Clifford torus is a flat surface — zero curvature — living in 4D. In 3D, a torus must have positive AND negative curvature, but in 4D, a torus can be perfectly flat!',
    analogy: 'Imagine rolling a sheet of paper into a cylinder, then curving that cylinder into a donut — but WITHOUT stretching. That\'s only possible in 4D.',
    interactive: 'Watch the two "circles" of the torus. In 4D, they\'re both the same size — neither is "inner" or "outer". The asymmetry you see is from projection!',
  },
  sphere: {
    funFact: 'The 3-sphere (S³) is the set of all points equidistant from a center in 4D. You can only see its wireframe shadow here.',
    analogy: 'A circle is the "sphere" of 2D. A sphere is the "sphere" of 3D. The hypersphere is the "sphere" of 4D.',
    interactive: 'Points near the equator cluster together in the projection. Try stereographic projection for a more uniform view!',
  },
};

export function InfoPanel() {
  const { activeShape, showInfo } = useStore();

  if (!showInfo) return null;

  const shape = SHAPE_CATALOG[activeShape];
  const concept = CONCEPTS[activeShape];
  const shapeObj = shape.create(1);

  return (
    <div className="info-panel">
      <div className="info-header">
        <h3>{shapeObj.name}</h3>
        <div className="info-stats">
          <span>{shapeObj.vertices.length} vertices</span>
          <span>{shapeObj.edges.length} edges</span>
        </div>
      </div>
      <p className="info-desc">{shapeObj.description}</p>

      {concept && (
        <>
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
