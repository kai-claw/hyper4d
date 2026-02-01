// Immersive mode - fullscreen meditation/screensaver experience

import { useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import './ImmersiveMode.css';

export function ImmersiveMode() {
  const { isImmersiveMode, toggleImmersiveMode, setCameraMode } = useStore();
  
  const exitImmersive = useCallback(() => {
    toggleImmersiveMode();
    setCameraMode('manual');
  }, [toggleImmersiveMode, setCameraMode]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImmersiveMode) {
        e.preventDefault();
        exitImmersive();
      }
      
      // F key for fullscreen toggle
      if (e.key === 'f' || e.key === 'F') {
        if (!isImmersiveMode) {
          toggleImmersiveMode();
          setCameraMode('orbit'); // Start with orbital camera
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isImmersiveMode, exitImmersive, toggleImmersiveMode, setCameraMode]);
  
  // Click to exit
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isImmersiveMode) {
      e.preventDefault();
      exitImmersive();
    }
  }, [isImmersiveMode, exitImmersive]);
  
  // Auto-switch to orbit mode when entering immersive
  useEffect(() => {
    if (isImmersiveMode) {
      setCameraMode('orbit');
      
      // Try to enter browser fullscreen if available
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
          // Fullscreen not available, just hide UI
        });
      }
      
      // Hide cursor after a delay
      const timeout = setTimeout(() => {
        document.body.style.cursor = 'none';
      }, 3000);
      
      return () => {
        clearTimeout(timeout);
        document.body.style.cursor = 'auto';
        
        // Exit browser fullscreen
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      };
    }
  }, [isImmersiveMode, setCameraMode]);
  
  if (!isImmersiveMode) return null;
  
  return (
    <div className="immersive-overlay" onClick={handleClick}>
      {/* Subtle exit hint */}
      <div className="immersive-hint">
        <div className="hint-text">
          Press ESC or click to exit immersive mode
        </div>
      </div>
      
      {/* Audio controls in corner */}
      <AudioControls />
    </div>
  );
}

function AudioControls() {
  const { isAudioMuted, toggleAudio, audioVolume, setAudioVolume } = useStore();
  
  return (
    <div className="immersive-audio-controls">
      <button 
        onClick={toggleAudio}
        className="audio-toggle"
        aria-label={isAudioMuted ? 'Unmute audio' : 'Mute audio'}
      >
        {isAudioMuted ? '🔇' : '🔊'}
      </button>
      
      {!isAudioMuted && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={audioVolume}
          onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
          className="volume-slider"
          aria-label="Audio volume"
        />
      )}
    </div>
  );
}