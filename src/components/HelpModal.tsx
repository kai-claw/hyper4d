import { useStore } from '../store/useStore';
import './HelpModal.css';

export function HelpModal() {
  const { showHelp, toggleHelp } = useStore();

  if (!showHelp) return null;

  return (
    <div className="help-overlay" onClick={toggleHelp}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <button className="help-close" onClick={toggleHelp}>×</button>
        <h2>Welcome to Hyper4D</h2>
        <p className="help-subtitle">
          A tool for building intuition about 4-dimensional space.
        </p>

        <div className="help-section">
          <h3>🧊 What am I looking at?</h3>
          <p>
            You're seeing the <strong>3D shadow</strong> of a 4D object. Just as
            shining a light on a 3D cube casts a 2D shadow on a wall, we're
            projecting 4D objects down to 3D so you can explore them.
          </p>
        </div>

        <div className="help-section">
          <h3>🎮 Mouse Controls</h3>
          <ul>
            <li><strong>Left-drag:</strong> Orbit the 3D view</li>
            <li><strong>Scroll:</strong> Zoom in/out</li>
            <li><strong>Shift+drag:</strong> Rotate in 4D (XW/YW planes)</li>
            <li><strong>Right-drag:</strong> Rotate in 4D (XW/YW planes)</li>
            <li><strong>Ctrl+Shift+drag:</strong> Rotate in ZW plane</li>
          </ul>
        </div>

        <div className="help-section">
          <h3>⌨️ Keyboard Shortcuts</h3>
          <div className="shortcut-grid">
            <div className="shortcut-group">
              <div className="shortcut-group-title">Shapes</div>
              <div className="shortcut"><kbd>1</kbd> Tesseract</div>
              <div className="shortcut"><kbd>2</kbd> 16-Cell</div>
              <div className="shortcut"><kbd>3</kbd> 24-Cell</div>
              <div className="shortcut"><kbd>4</kbd> 5-Cell</div>
              <div className="shortcut"><kbd>5</kbd> Torus</div>
              <div className="shortcut"><kbd>6</kbd> Sphere</div>
            </div>
            <div className="shortcut-group">
              <div className="shortcut-group-title">Display</div>
              <div className="shortcut"><kbd>V</kbd> Vertices</div>
              <div className="shortcut"><kbd>E</kbd> Edges</div>
              <div className="shortcut"><kbd>C</kbd> Color by W</div>
              <div className="shortcut"><kbd>A</kbd> 3D Axes</div>
              <div className="shortcut"><kbd>G</kbd> Grid Floor</div>
              <div className="shortcut"><kbd>X</kbd> W-Slice</div>
              <div className="shortcut"><kbd>I</kbd> Info Panel</div>
            </div>
            <div className="shortcut-group">
              <div className="shortcut-group-title">Projection</div>
              <div className="shortcut"><kbd>P</kbd> Perspective</div>
              <div className="shortcut"><kbd>O</kbd> Orthographic</div>
              <div className="shortcut"><kbd>S</kbd> Stereographic</div>
            </div>
            <div className="shortcut-group">
              <div className="shortcut-group-title">Rotation</div>
              <div className="shortcut"><kbd>Space</kbd> Auto-rotate</div>
              <div className="shortcut"><kbd>R</kbd> Reset rotation</div>
              <div className="shortcut"><kbd>←→</kbd> XW rotation</div>
              <div className="shortcut"><kbd>↑↓</kbd> YW rotation</div>
              <div className="shortcut"><kbd>Shift+←→</kbd> ZW rotation</div>
              <div className="shortcut"><kbd>H</kbd> This help</div>
            </div>
          </div>
        </div>

        <div className="help-section">
          <h3>🔮 The 4th Dimension</h3>
          <p>
            In 3D, there are 3 rotation planes (XY, XZ, YZ). In 4D, there are <strong>6</strong>.
            The three new planes (XW, YW, ZW) rotate objects into the 4th dimension.
          </p>
          <p>
            Think of it this way: a 2D creature on a table can only rotate things in one
            plane (XY). We can rotate in 3 planes. A 4D being would rotate in 6 planes.
          </p>
        </div>

        <div className="help-section">
          <h3>🌈 Color by W</h3>
          <p>
            When enabled, vertices and edges are colored by their W-coordinate:
            <span className="w-blue"> blue = near</span> in the 4th dimension,
            <span className="w-red"> red = far</span>. This helps you "see"
            where the object extends into the 4th dimension.
          </p>
        </div>

        <div className="help-section">
          <h3>✂️ Cross-Sections</h3>
          <p>
            Enable "W-slice" to see a cross-section of the 4D object.
            Just as slicing a 3D sphere produces a 2D circle, slicing a 4D
            object produces a 3D shape. Move the slice position to see
            different cross-sections!
          </p>
        </div>

        <button className="help-start" onClick={toggleHelp}>
          Start Exploring →
        </button>
      </div>
    </div>
  );
}
