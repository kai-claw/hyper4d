// Custom shaders for 4D visualization with animated effects

import * as THREE from 'three';
import type { ColorTheme } from '../store/useStore';

// Color theme definitions
export const COLOR_THEMES = {
  deepSpace: {
    low: new THREE.Color(0x0a0a14),    // Deep space blue
    mid: new THREE.Color(0x4fc3f7),    // Electric cyan  
    high: new THREE.Color(0xe91e63),   // Hot pink
    peak: new THREE.Color(0xffc107),   // Golden
  },
  synthwave: {
    low: new THREE.Color(0x1a0033),    // Dark purple
    mid: new THREE.Color(0xff00ff),    // Neon magenta
    high: new THREE.Color(0x00ffff),   // Neon cyan
    peak: new THREE.Color(0xffff00),   // Neon yellow
  },
  monochrome: {
    low: new THREE.Color(0x000000),    // Black
    mid: new THREE.Color(0x555555),    // Dark gray
    high: new THREE.Color(0xaaaaaa),   // Light gray  
    peak: new THREE.Color(0xffffff),   // White
  },
  aurora: {
    low: new THREE.Color(0x001122),    // Dark teal
    mid: new THREE.Color(0x00ff88),    // Aurora green
    high: new THREE.Color(0x8844ff),   // Aurora purple
    peak: new THREE.Color(0x44ffff),   // Aurora cyan
  },
};

// Vertex shader for edge lines with traveling pulse effect
const vertexShader = /* glsl */ `
  uniform float time;
  uniform float pulseSpeed;
  uniform float wMin;
  uniform float wMax;
  
  attribute float wValue;
  attribute float edgeProgress; // 0.0 to 1.0 along the edge
  
  varying float vWValue;
  varying float vEdgeProgress;
  varying float vPulse;
  
  void main() {
    vWValue = wValue;
    vEdgeProgress = edgeProgress;
    
    // Create traveling pulse along edges
    float pulsePhase = time * pulseSpeed;
    float pulsePos = mod(pulsePhase + edgeProgress, 1.0);
    vPulse = smoothstep(0.8, 1.0, pulsePos) * smoothstep(0.2, 0.0, pulsePos);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader for edge lines with W-depth coloring and pulse
const fragmentShader = /* glsl */ `
  uniform float time;
  uniform float wMin;
  uniform float wMax;
  uniform float opacity;
  
  uniform vec3 colorLow;
  uniform vec3 colorMid;
  uniform vec3 colorHigh;
  uniform vec3 colorPeak;
  
  varying float vWValue;
  varying float vEdgeProgress;
  varying float vPulse;
  
  vec3 getWColor(float w) {
    float normalizedW = (w - wMin) / (wMax - wMin);
    normalizedW = clamp(normalizedW, 0.0, 1.0);
    
    if (normalizedW < 0.33) {
      float t = normalizedW * 3.0;
      return mix(colorLow, colorMid, t);
    } else if (normalizedW < 0.66) {
      float t = (normalizedW - 0.33) * 3.0;
      return mix(colorMid, colorHigh, t);
    } else {
      float t = (normalizedW - 0.66) * 3.0;
      return mix(colorHigh, colorPeak, t);
    }
  }
  
  void main() {
    vec3 baseColor = getWColor(vWValue);
    
    // Add subtle pulse glow effect
    vec3 finalColor = baseColor * (1.0 + vPulse * 0.6);
    float finalOpacity = opacity * (1.0 + vPulse * 0.2);
    
    gl_FragColor = vec4(finalColor, finalOpacity);
  }
`;

// Vertex shader for vertices with glow effect
const vertexVertexShader = /* glsl */ `
  uniform float time;
  uniform float pulseSpeed;
  uniform float rotationSpeed;
  
  attribute float wValue;
  
  varying float vWValue;
  varying float vGlow;
  
  void main() {
    vWValue = wValue;
    
    // Pulse based on rotation speed
    vGlow = 0.5 + 0.5 * sin(time * pulseSpeed * (1.0 + rotationSpeed));
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader for vertices
const vertexFragmentShader = /* glsl */ `
  uniform float wMin;
  uniform float wMax;
  
  uniform vec3 colorLow;
  uniform vec3 colorMid;
  uniform vec3 colorHigh;
  uniform vec3 colorPeak;
  
  varying float vWValue;
  varying float vGlow;
  
  vec3 getWColor(float w) {
    float normalizedW = (w - wMin) / (wMax - wMin);
    normalizedW = clamp(normalizedW, 0.0, 1.0);
    
    if (normalizedW < 0.33) {
      float t = normalizedW * 3.0;
      return mix(colorLow, colorMid, t);
    } else if (normalizedW < 0.66) {
      float t = (normalizedW - 0.33) * 3.0;
      return mix(colorMid, colorHigh, t);
    } else {
      float t = (normalizedW - 0.66) * 3.0;
      return mix(colorHigh, colorPeak, t);
    }
  }
  
  void main() {
    vec3 baseColor = getWColor(vWValue);
    vec3 finalColor = baseColor * (0.8 + 0.2 * vGlow);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export class HyperEdgeMaterial extends THREE.ShaderMaterial {
  constructor(theme: ColorTheme = 'deepSpace') {
    const colors = COLOR_THEMES[theme];
    
    super({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        pulseSpeed: { value: 1.0 },
        wMin: { value: -1 },
        wMax: { value: 1 },
        opacity: { value: 0.8 },
        colorLow: { value: colors.low },
        colorMid: { value: colors.mid },
        colorHigh: { value: colors.high },
        colorPeak: { value: colors.peak },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
  }
  
  updateTime(time: number) {
    this.uniforms.time.value = time;
  }
  
  updateWRange(wMin: number, wMax: number) {
    this.uniforms.wMin.value = wMin;
    this.uniforms.wMax.value = wMax;
  }
  
  updateTheme(theme: ColorTheme) {
    const colors = COLOR_THEMES[theme];
    this.uniforms.colorLow.value = colors.low;
    this.uniforms.colorMid.value = colors.mid;
    this.uniforms.colorHigh.value = colors.high;
    this.uniforms.colorPeak.value = colors.peak;
  }
  
  setPulseSpeed(speed: number) {
    this.uniforms.pulseSpeed.value = speed;
  }
  
  setOpacity(opacity: number) {
    this.uniforms.opacity.value = opacity;
  }
}

export class HyperVertexMaterial extends THREE.ShaderMaterial {
  constructor(theme: ColorTheme = 'deepSpace') {
    const colors = COLOR_THEMES[theme];
    
    super({
      vertexShader: vertexVertexShader,
      fragmentShader: vertexFragmentShader,
      uniforms: {
        time: { value: 0 },
        pulseSpeed: { value: 1.0 },
        rotationSpeed: { value: 0.0 },
        wMin: { value: -1 },
        wMax: { value: 1 },
        colorLow: { value: colors.low },
        colorMid: { value: colors.mid },
        colorHigh: { value: colors.high },
        colorPeak: { value: colors.peak },
      },
    });
  }
  
  updateTime(time: number) {
    this.uniforms.time.value = time;
  }
  
  updateWRange(wMin: number, wMax: number) {
    this.uniforms.wMin.value = wMin;
    this.uniforms.wMax.value = wMax;
  }
  
  updateTheme(theme: ColorTheme) {
    const colors = COLOR_THEMES[theme];
    this.uniforms.colorLow.value = colors.low;
    this.uniforms.colorMid.value = colors.mid;
    this.uniforms.colorHigh.value = colors.high;
    this.uniforms.colorPeak.value = colors.peak;
  }
  
  setPulseSpeed(speed: number) {
    this.uniforms.pulseSpeed.value = speed;
  }
  
  setRotationSpeed(speed: number) {
    this.uniforms.rotationSpeed.value = speed;
  }
}