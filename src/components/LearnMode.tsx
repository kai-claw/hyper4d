// Interactive Learning Modules for 4D Concepts

import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import './LearnMode.css';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  steps: LearningStep[];
}

interface LearningStep {
  title: string;
  content: string;
  interactiveHint: string;
  setup?: () => void;
  nextCondition?: () => boolean;
}

const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'dimensions',
    title: 'What is a Dimension?',
    description: 'Journey from 0D to 4D and understand how dimensions build upon each other',
    steps: [
      {
        title: 'Point (0D)',
        content: 'A point has no dimensions — just a location. It has no length, width, or height.',
        interactiveHint: 'Imagine a dot on paper — that\'s as close as we can get to a true 0D point.',
        setup: () => {
          useStore.getState().setActiveShape('5cell');
          useStore.getState().setWSlicePosition(0);
          useStore.getState().setWSliceThickness(0.05);
          useStore.setState({ showSlice: true, showVertices: true, showEdges: false });
        }
      },
      {
        title: 'Line (1D)',
        content: 'Connect two points and you get a line — one dimension: length. You can only move forward or backward.',
        interactiveHint: 'Draw a line on paper. You can measure its length, but it has no width.',
        setup: () => {
          useStore.setState({ showEdges: true, showVertices: false });
        }
      },
      {
        title: 'Square (2D)',
        content: 'Move a line perpendicular to itself and you sweep out a square. Now you have length AND width.',
        interactiveHint: 'A piece of paper is (almost) 2D — it has length and width, but virtually no thickness.',
        setup: () => {
          useStore.getState().setActiveShape('tesseract');
          useStore.setState({ showFaces: true, showEdges: true });
        }
      },
      {
        title: 'Cube (3D)',
        content: 'Move a square perpendicular to its plane and you get a cube. Now: length, width, AND height.',
        interactiveHint: 'This is our familiar 3D world! Rotate the view to see all faces of the cube.',
        setup: () => {
          useStore.setState({ showSlice: false, showFaces: true });
        }
      },
      {
        title: 'Tesseract (4D)',
        content: 'Move a cube perpendicular to 3D space and you get a tesseract! Length, width, height, AND ana/kata.',
        interactiveHint: 'Try rotating in the XW plane — watch how the "inner" and "outer" cubes exchange places!',
        setup: () => {
          useStore.setState({ colorByW: true, showSlice: false });
          useStore.getState().setRotation('xw', 0.5);
        }
      }
    ]
  },
  {
    id: 'projection',
    title: 'Projection: Seeing Higher Dimensions',
    description: 'Understand how we can visualize 4D objects on a 2D screen',
    steps: [
      {
        title: 'Shadow Play',
        content: 'Hold your hand up to a light. The shadow on the wall is a 2D projection of your 3D hand.',
        interactiveHint: 'Notice how the shadow changes as you rotate your hand — different projections reveal different aspects.',
      },
      {
        title: '3D Cube → 2D Shadow',
        content: 'A cube casts different shadow shapes: squares, rectangles, hexagons, depending on the angle.',
        interactiveHint: 'Imagine looking at a wireframe cube from different angles. Sometimes you see a square, sometimes a more complex shape.',
      },
      {
        title: '4D Tesseract → 3D Shadow',
        content: 'Similarly, a tesseract casts a 3D shadow. What you see here IS that shadow — a 3D projection of a 4D object.',
        interactiveHint: 'The tesseract you\'re looking at is actually the "shadow" of a true 4D hypercube!',
        setup: () => {
          useStore.getState().setActiveShape('tesseract');
          useStore.getState().setProjectionMode('perspective');
        }
      },
      {
        title: 'Perspective vs Orthographic',
        content: 'Perspective projection: objects farther in the 4th dimension appear smaller (like perspective in 3D).',
        interactiveHint: 'Switch between projection modes and see how the shape changes!',
        setup: () => {
          useStore.getState().setProjectionMode('perspective');
        }
      },
      {
        title: 'Looking Through 4D',
        content: 'Just as a 2D being would see slices of 3D objects, we see "slices" of 4D objects. The full 4D shape exists beyond what we can see.',
        interactiveHint: 'Enable cross-sections to see slices through the 4D shape — like a medical scan!',
        setup: () => {
          useStore.setState({ showSlice: true });
          useStore.getState().setWSliceThickness(0.2);
        }
      }
    ]
  },
  {
    id: 'rotation',
    title: '4D Rotation: More Than You Can Imagine',
    description: 'Discover why 4D objects have 6 rotation planes instead of just 3 axes',
    steps: [
      {
        title: '3D Rotation Axes',
        content: 'In 3D, objects rotate around axes: X-axis, Y-axis, Z-axis. That\'s 3 possible rotations.',
        interactiveHint: 'Think of spinning a top (Z-axis), rolling a ball (X-axis), or turning your head (Y-axis).',
      },
      {
        title: '4D Rotation Planes',
        content: 'In 4D, objects rotate in PLANES, not around axes. With 4 dimensions, you get 6 different planes of rotation.',
        interactiveHint: 'The 6 planes are: XY, XZ, XW, YZ, YW, ZW. Three are familiar 3D rotations, three are purely 4D!',
      },
      {
        title: 'Familiar Rotations (XY, XZ, YZ)',
        content: 'XY, XZ, and YZ rotations are the ones we know from 3D — they don\'t involve the 4th dimension.',
        interactiveHint: 'Try rotating in XY plane — this is just like spinning the object in 3D space.',
        setup: () => {
          useStore.getState().resetRotation();
          useStore.getState().setRotation('xy', 0.8);
        }
      },
      {
        title: '4D Rotations (XW, YW, ZW)',
        content: 'XW, YW, and ZW rotations mix our 3D coordinates with the 4th dimension — this is true 4D rotation!',
        interactiveHint: 'Try XW rotation — watch how parts of the object seem to turn "inside-out". That\'s 4D!',
        setup: () => {
          useStore.getState().resetRotation();
          useStore.getState().setRotation('xw', 1.2);
        }
      },
      {
        title: 'The Magic of 4D Rotation',
        content: 'In 4D, you can rotate a cube so it turns inside-out without breaking it! The "inside" becomes "outside" through the 4th dimension.',
        interactiveHint: 'Slowly adjust the XW rotation and watch the inner/outer structure flip. This is impossible in 3D!',
        setup: () => {
          useStore.getState().setActiveShape('tesseract');
          useStore.setState({ colorByW: true });
        }
      }
    ]
  }
];

export function LearnMode() {
  const { showLearnMode, learnModuleId, learnStep, setLearnMode } = useStore();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const currentModule = LEARNING_MODULES.find(m => m.id === (selectedModule || learnModuleId));
  const step = currentModule?.steps[currentStep];

  useEffect(() => {
    if (step?.setup) {
      step.setup();
    }
  }, [step]);

  if (!showLearnMode) return null;

  if (!selectedModule) {
    return (
      <div className="learn-mode-overlay">
        <div className="learn-mode-panel">
          <div className="learn-header">
            <h2>🎓 Learn 4D</h2>
            <button 
              className="btn-close" 
              onClick={() => setLearnMode(false, null, 0)}
            >×</button>
          </div>
          <p className="learn-description">
            Choose a learning module to dive deep into 4D concepts with interactive demonstrations:
          </p>
          <div className="module-grid">
            {LEARNING_MODULES.map(module => (
              <button
                key={module.id}
                className="module-card"
                onClick={() => {
                  setSelectedModule(module.id);
                  setCurrentStep(0);
                }}
              >
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <span className="module-steps">{module.steps.length} steps</span>
              </button>
            ))}
          </div>
          <div className="learn-footer">
            <p>💡 Each module is interactive — follow along by rotating, slicing, and exploring!</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentModule || !step) return null;

  return (
    <div className="learn-mode-overlay">
      <div className="learn-mode-panel">
        <div className="learn-header">
          <div>
            <h2>{currentModule.title}</h2>
            <span className="step-counter">Step {currentStep + 1} of {currentModule.steps.length}</span>
          </div>
          <div className="learn-nav-buttons">
            <button 
              className="btn-back"
              onClick={() => setSelectedModule(null)}
            >← Modules</button>
            <button 
              className="btn-close" 
              onClick={() => setLearnMode(false, null, 0)}
            >×</button>
          </div>
        </div>

        <div className="step-content">
          <h3>{step.title}</h3>
          <p className="step-text">{step.content}</p>
          <div className="interactive-hint">
            <span className="hint-icon">🎮</span>
            <p>{step.interactiveHint}</p>
          </div>
        </div>

        <div className="step-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentStep + 1) / currentModule.steps.length) * 100}%` }}
            />
          </div>
          <div className="step-buttons">
            <button 
              className="btn-prev"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            >
              Previous
            </button>
            <button 
              className="btn-next"
              disabled={currentStep === currentModule.steps.length - 1}
              onClick={() => setCurrentStep(Math.min(currentModule.steps.length - 1, currentStep + 1))}
            >
              {currentStep === currentModule.steps.length - 1 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}