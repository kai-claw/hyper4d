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
    title: "🎉 Welcome to the 4th Dimension!",
    content: "You're looking at something impossible in our 3D world — a 4D cube! Just like a 3D cube casts a 2D shadow on paper, this 4D cube casts a 3D 'shadow' that we can see. Cool, right?",
    position: 'center'
  },
  {
    title: "🕹️ First, Try Normal 3D",
    content: "Let's start with something familiar. Drag with your mouse to spin the object around. This is just regular 3D rotation — like turning an object in your hands.",
    position: 'center'
  },
  {
    title: "🤯 Now the Mind-Bending Part!",
    content: "Hold SHIFT and drag, or right-click and drag. You're now rotating the object through the mysterious 4th dimension! Watch it morph and turn inside-out. This is what 4D rotation looks like!",
    action: () => {
      const store = useStore.getState();
      store.setRotation('xw', 0.5);
    },
    position: 'center'
  },
  {
    title: "🌈 The Secret Color Code",
    content: "See the blue and red colors? Blue means 'close to you in 4D' and red means 'far from you in 4D'. As you rotate through 4D, watch parts shift from blue to red!",
    action: () => {
      const store = useStore.getState();
      if (!store.colorByW) store.toggleColorByW();
    },
    position: 'center'
  },
  {
    title: "🎲 Try Other Mind-Bending Shapes",
    content: "Each button shows a different 4D object! The '24-Cell' is super special — it only exists in 4D. No 2D or 3D version is possible. Click around and see what happens!",
    highlight: '.shape-grid',
    position: 'right'
  },
  {
    title: "🔪 Slice Through the 4th Dimension",
    content: "Turn on 'W-slice' for something amazing: you can slice through the 4D object and see what's inside! It's like doing an MRI scan on a 4D shape.",
    action: () => {
      const store = useStore.getState();
      if (!store.showSlice) store.toggleShowSlice();
    },
    highlight: '.section:last-child',
    position: 'right'
  },
  {
    title: "🚀 You're Now a 4D Explorer!",
    content: "Press H for more controls, or just have fun experimenting! Don't worry if it feels weird — even mathematicians find 4D mind-bending. The goal is to play and build intuition. Enjoy the journey!",
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