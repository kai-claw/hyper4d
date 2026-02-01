// Interactive tutorial overlay for first-time users
import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import './TutorialOverlay.css';

interface TutorialStep {
  title: string;
  content: string;
  action?: () => void;
  highlight?: string; // CSS selector to highlight
  position?: 'center' | 'left' | 'right' | 'bottom';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Welcome to 4D Space!",
    content: "You're looking at a 4D hypercube (tesseract) projected into 3D. Think of it as the shadow of a 4D object, just like how a 3D cube casts a 2D shadow on a wall.",
    position: 'center'
  },
  {
    title: "Try 3D Rotation",
    content: "First, get comfortable with regular 3D rotation. Drag with your left mouse button to orbit around the object. This is just like looking at a normal 3D shape.",
    position: 'center'
  },
  {
    title: "Now for the Magic: 4D Rotation",
    content: "Here's where it gets amazing. Hold SHIFT and drag, or right-click and drag. You're now rotating the object through the 4th dimension! Watch how it seems to turn inside-out.",
    action: () => {
      const store = useStore.getState();
      store.setRotation('xw', 0.5);
    },
    position: 'center'
  },
  {
    title: "Understanding the Colors",
    content: "The blue-to-red coloring shows depth in the 4th dimension. Blue parts are 'near' in 4D space, red parts are 'far'. This helps you see the 4D structure!",
    action: () => {
      const store = useStore.getState();
      if (!store.colorByW) store.toggleColorByW();
    },
    position: 'center'
  },
  {
    title: "Explore Different Shapes",
    content: "Try the other 4D shapes! The 24-Cell is unique to 4D - it has no equivalent in any other dimension. Each shape teaches you something different about 4D geometry.",
    highlight: '.shape-grid',
    position: 'right'
  },
  {
    title: "4D Cross-Sections",
    content: "Enable 'W-slice' to see cross-sections through the 4th dimension. It's like slicing a 3D object with a 2D plane, but we're slicing a 4D object with a 3D space!",
    action: () => {
      const store = useStore.getState();
      if (!store.showSlice) store.toggleShowSlice();
    },
    highlight: '.section:last-child',
    position: 'right'
  },
  {
    title: "You're Ready to Explore!",
    content: "Press H anytime for keyboard shortcuts, or use the controls on the left. Remember: you're seeing shadows of 4D objects. The real magic is in your mind building intuition for higher dimensions!",
    position: 'center'
  }
];

export function TutorialOverlay() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  // Check if user has seen tutorial before
  useEffect(() => {
    const seen = localStorage.getItem('hyper4d-tutorial-seen');
    setHasSeenTutorial(!!seen);
    if (!seen) {
      // Show tutorial after a brief delay for first-time users
      const timer = setTimeout(() => setIsActive(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const nextStep = () => {
    const step = TUTORIAL_STEPS[currentStep];
    if (step.action) {
      step.action();
    }
    
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const skipTutorial = () => {
    completeTutorial();
  };

  const completeTutorial = () => {
    setIsActive(false);
    localStorage.setItem('hyper4d-tutorial-seen', 'true');
    setHasSeenTutorial(true);
  };

  const restartTutorial = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  // Expose restart tutorial to global scope for the help system
  useEffect(() => {
    (window as any).restartTutorial = restartTutorial;
    return () => {
      delete (window as any).restartTutorial;
    };
  }, []);

  if (!isActive) {
    return hasSeenTutorial ? (
      <button className="tutorial-restart-btn" onClick={restartTutorial} title="Restart Tutorial">
        🎓
      </button>
    ) : null;
  }

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <div className="tutorial-overlay">
      <div className={`tutorial-card tutorial-${step.position || 'center'}`}>
        <div className="tutorial-header">
          <div className="tutorial-progress">
            {currentStep + 1} / {TUTORIAL_STEPS.length}
          </div>
          <button className="tutorial-skip" onClick={skipTutorial}>
            Skip Tutorial
          </button>
        </div>
        
        <h3 className="tutorial-title">{step.title}</h3>
        <p className="tutorial-content">{step.content}</p>
        
        <div className="tutorial-footer">
          <div className="tutorial-dots">
            {TUTORIAL_STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`tutorial-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>
          <button className="tutorial-next" onClick={nextStep}>
            {currentStep === TUTORIAL_STEPS.length - 1 ? 'Start Exploring!' : 'Next →'}
          </button>
        </div>
      </div>
      
      {step.highlight && (
        <style dangerouslySetInnerHTML={{
          __html: `
            ${step.highlight} {
              position: relative;
              z-index: 1001;
              box-shadow: 0 0 0 4px rgba(79, 195, 247, 0.3), 0 0 20px rgba(79, 195, 247, 0.2);
              border-radius: 8px;
            }
          `
        }} />
      )}
    </div>
  );
}