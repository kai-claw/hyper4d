// Guided tour mode for exploring 4D shapes

import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { ShapeKey } from '../engine/shapes4d';
import './TourMode.css';

const TOUR_STEPS = [
  {
    title: "Welcome to the 4th Dimension",
    shape: 'tesseract' as ShapeKey,
    description: "This is a tesseract — a 4D hypercube. Just like a cube is made of 6 squares, a tesseract is made of 8 cubes. Watch how the colors change based on the 4th dimension (W-depth).",
    autoRotate: { xy: 0, xz: 0, xw: 0.3, yz: 0, yw: 0.2, zw: 0 },
    settings: { showSlice: false, colorByW: true }
  },
  {
    title: "4D Rotations are Mind-Bending",
    shape: 'tesseract' as ShapeKey,
    description: "Unlike 3D, 4D has 6 rotation planes instead of 3. XW, YW, ZW rotations move parts into the 4th dimension. Watch this tesseract rotate through hyperspace.",
    autoRotate: { xy: 0.1, xz: 0, xw: 0.4, yz: 0, yw: 0.3, zw: 0.2 },
    settings: { showSlice: false, colorByW: true }
  },
  {
    title: "The Mysterious 24-Cell",
    shape: '24cell' as ShapeKey,
    description: "This is the 24-cell — the most beautiful 4D shape. It exists only in 4D (no 3D analog). It's completely regular and self-dual. Notice its perfect symmetry.",
    autoRotate: { xy: 0, xz: 0, xw: 0.25, yz: 0, yw: 0.15, zw: 0.1 },
    settings: { showSlice: false, colorByW: true }
  },
  {
    title: "Cross-Sections: The Key to Understanding",
    shape: 'tesseract' as ShapeKey,
    description: "Here's the 'aha moment': slicing a 4D object with a 3D hyperplane. Move the W-slice to see different cross-sections. It's like a 2D being seeing slices of a 3D apple.",
    autoRotate: { xy: 0, xz: 0, xw: 0.1, yz: 0, yw: 0.1, zw: 0 },
    settings: { showSlice: true, colorByW: true }
  },
  {
    title: "The 4D Sphere",
    shape: 'sphere' as ShapeKey,
    description: "A 4D sphere (3-sphere) exists in 4D space. Its cross-sections are 3D balls that grow and shrink as we move through the 4th dimension. Mind = blown.",
    autoRotate: { xy: 0.05, xz: 0.05, xw: 0.2, yz: 0.05, yw: 0.15, zw: 0.1 },
    settings: { showSlice: true, colorByW: true }
  },
  {
    title: "Explore on Your Own!",
    shape: '5cell' as ShapeKey,
    description: "You've learned the basics of 4D visualization. Try the different shapes, play with rotations, and explore cross-sections. The 4th dimension awaits!",
    autoRotate: { xy: 0, xz: 0, xw: 0.3, yz: 0, yw: 0.2, zw: 0 },
    settings: { showSlice: false, colorByW: true }
  }
];

export function TourMode() {
  const { 
    isTourMode, 
    tourStep, 
    stopTour, 
    nextTourStep, 
    prevTourStep,
    setActiveShape,
    setAutoRotation,
    setWSlicePosition,
    toggleShowSlice,
    toggleColorByW,
    toggleAutoRotation
  } = useStore();

  const currentStep = TOUR_STEPS[tourStep] || TOUR_STEPS[TOUR_STEPS.length - 1];

  useEffect(() => {
    if (!isTourMode) return;
    
    const step = TOUR_STEPS[tourStep];
    if (!step) return;

    // Apply step settings
    setActiveShape(step.shape);
    
    // Enable auto-rotation and set speeds
    toggleAutoRotation();
    Object.entries(step.autoRotate).forEach(([plane, value]) => {
      setAutoRotation(plane as any, value);
    });

    // Apply visual settings
    if (step.settings.showSlice !== undefined) {
      if (step.settings.showSlice) {
        // Only toggle if not already enabled
        if (!useStore.getState().showSlice) {
          toggleShowSlice();
        }
        setWSlicePosition(0);
      }
    }
    
    if (step.settings.colorByW !== undefined && !step.settings.colorByW) {
      if (useStore.getState().colorByW) {
        toggleColorByW();
      }
    }
  }, [tourStep, isTourMode]);

  if (!isTourMode) return null;

  const isLastStep = tourStep >= TOUR_STEPS.length - 1;

  return (
    <div className="tour-mode">
      <div className="tour-card">
        <div className="tour-header">
          <h3>{currentStep.title}</h3>
          <button className="tour-close" onClick={stopTour}>
            ✕
          </button>
        </div>
        
        <div className="tour-content">
          <p>{currentStep.description}</p>
        </div>
        
        <div className="tour-controls">
          <div className="tour-progress">
            Step {tourStep + 1} of {TOUR_STEPS.length}
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${((tourStep + 1) / TOUR_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="tour-buttons">
            {tourStep > 0 && (
              <button className="tour-btn tour-prev" onClick={prevTourStep}>
                ← Previous
              </button>
            )}
            
            {!isLastStep ? (
              <button className="tour-btn tour-next" onClick={nextTourStep}>
                Next →
              </button>
            ) : (
              <button className="tour-btn tour-finish" onClick={stopTour}>
                Finish Tour
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}