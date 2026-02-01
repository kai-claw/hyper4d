// Ambient audio system for 4D visualization - Brian Eno meets mathematics

import type { ShapeKey } from '../engine/shapes4d';

interface AudioNodes {
  context: AudioContext;
  baseOscillator: OscillatorNode;
  droneFilter: BiquadFilterNode;
  crystallineOscillator: OscillatorNode;
  crystallineGain: GainNode;
  masterGain: GainNode;
  analyser: AnalyserNode;
}

export class AmbientAudio {
  private audioNodes: AudioNodes | null = null;
  private isInitialized = false;
  private isMuted = true;
  private volume = 0.3;
  private currentShape: ShapeKey = 'tesseract';
  private rotationSpeed = 0;
  private animationFrame: number | null = null;
  
  // Base frequencies for different shapes (Hz)
  private readonly shapeFrequencies: Record<ShapeKey, number> = {
    tesseract: 55.0,      // A1 - fundamental, grounding
    cell5: 82.4,          // E2 - bright, simple
    cell16: 73.4,         // D2 - crystalline  
    cell24: 98.0,         // G2 - complex harmony
    cell120: 110.0,       // A2 - rich overtones
    cell600: 146.8,       // D3 - highest complexity
    sphere4d: 65.4,       // C2 - pure, infinite
    torus: 87.3,          // F2 - flowing, periodic
  };
  
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      const context = new AudioContext();
      
      // Base drone oscillator
      const baseOscillator = context.createOscillator();
      baseOscillator.type = 'sine';
      baseOscillator.frequency.setValueAtTime(this.shapeFrequencies[this.currentShape], context.currentTime);
      
      // Filter for the drone
      const droneFilter = context.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(400, context.currentTime);
      droneFilter.Q.setValueAtTime(2, context.currentTime);
      
      // Crystalline oscillator for cross-section events
      const crystallineOscillator = context.createOscillator();
      crystallineOscillator.type = 'triangle';
      crystallineOscillator.frequency.setValueAtTime(880, context.currentTime);
      
      // Gain node for crystalline sounds
      const crystallineGain = context.createGain();
      crystallineGain.gain.setValueAtTime(0, context.currentTime);
      
      // Master gain
      const masterGain = context.createGain();
      masterGain.gain.setValueAtTime(0, context.currentTime); // Start silent
      
      // Analyser for visualizations
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      
      // Connect the audio graph
      baseOscillator.connect(droneFilter);
      droneFilter.connect(masterGain);
      
      crystallineOscillator.connect(crystallineGain);
      crystallineGain.connect(masterGain);
      
      masterGain.connect(analyser);
      analyser.connect(context.destination);
      
      // Start oscillators
      baseOscillator.start(context.currentTime);
      crystallineOscillator.start(context.currentTime);
      
      this.audioNodes = {
        context,
        baseOscillator,
        droneFilter,
        crystallineOscillator,
        crystallineGain,
        masterGain,
        analyser
      };
      
      this.isInitialized = true;
      this.startAudioLoop();
      
      console.log('🎵 Ambient audio system initialized');
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }
  
  private startAudioLoop(): void {
    const updateAudio = () => {
      if (!this.audioNodes || this.isMuted) {
        this.animationFrame = requestAnimationFrame(updateAudio);
        return;
      }
      
      const { context, baseOscillator, droneFilter, crystallineGain } = this.audioNodes;
      const time = context.currentTime;
      
      // Modulate base frequency with rotation speed
      const baseFreq = this.shapeFrequencies[this.currentShape];
      const rotationModulation = 1 + this.rotationSpeed * 0.1;
      const targetFreq = baseFreq * rotationModulation;
      
      baseOscillator.frequency.exponentialRampToValueAtTime(
        Math.max(20, targetFreq), 
        time + 0.1
      );
      
      // Modulate filter based on rotation
      const filterFreq = 200 + this.rotationSpeed * 300;
      droneFilter.frequency.exponentialRampToValueAtTime(
        Math.max(100, filterFreq),
        time + 0.1
      );
      
      // Add subtle crystalline sparkles
      if (Math.random() < 0.02 * this.rotationSpeed) {
        this.triggerCrystallineEvent();
      }
      
      this.animationFrame = requestAnimationFrame(updateAudio);
    };
    
    this.animationFrame = requestAnimationFrame(updateAudio);
  }
  
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.updateVolume();
  }
  
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.updateVolume();
  }
  
  private updateVolume(): void {
    if (!this.audioNodes) return;
    
    const { context, masterGain } = this.audioNodes;
    const targetVolume = this.isMuted ? 0 : this.volume * 0.15; // Keep it subtle
    
    masterGain.gain.cancelScheduledValues(context.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(
      Math.max(0.001, targetVolume),
      context.currentTime + 0.5
    );
  }
  
  setShape(shape: ShapeKey): void {
    if (this.currentShape === shape) return;
    
    this.currentShape = shape;
    
    if (this.audioNodes) {
      const { context, baseOscillator } = this.audioNodes;
      const newFreq = this.shapeFrequencies[shape];
      
      // Smooth transition to new frequency
      baseOscillator.frequency.exponentialRampToValueAtTime(
        newFreq,
        context.currentTime + 1.0
      );
    }
  }
  
  setRotationSpeed(speed: number): void {
    this.rotationSpeed = Math.max(0, speed);
  }
  
  triggerCrystallineEvent(): void {
    if (!this.audioNodes || this.isMuted) return;
    
    const { context, crystallineOscillator, crystallineGain } = this.audioNodes;
    const time = context.currentTime;
    
    // Random crystalline frequency
    const frequency = 800 + Math.random() * 800;
    crystallineOscillator.frequency.setValueAtTime(frequency, time);
    
    // Quick attack and decay
    crystallineGain.gain.cancelScheduledValues(time);
    crystallineGain.gain.setValueAtTime(0, time);
    crystallineGain.gain.linearRampToValueAtTime(0.03 * this.volume, time + 0.01);
    crystallineGain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
  }
  
  // Trigger when vertices cross W=0 plane
  onCrossSectionEvent(): void {
    this.triggerCrystallineEvent();
  }
  
  dispose(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    if (this.audioNodes) {
      try {
        this.audioNodes.baseOscillator.stop();
        this.audioNodes.crystallineOscillator.stop();
        this.audioNodes.context.close();
      } catch (error) {
        console.warn('Error disposing audio:', error);
      }
      this.audioNodes = null;
    }
    
    this.isInitialized = false;
  }
  
  // User gesture required to start Web Audio
  async startWithUserGesture(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (this.audioNodes?.context.state === 'suspended') {
      await this.audioNodes.context.resume();
    }
  }
}