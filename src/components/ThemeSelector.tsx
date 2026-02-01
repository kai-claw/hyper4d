// Color theme selector for 4D visualization

import { useStore } from '../store/useStore';
import type { ColorTheme } from '../store/useStore';
import './ThemeSelector.css';

interface ThemeOption {
  key: ColorTheme;
  name: string;
  description: string;
  preview: string[];
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    key: 'deepSpace',
    name: 'Deep Space',
    description: 'Dark blue to golden gradient - the default cosmic theme',
    preview: ['#0a0a14', '#4fc3f7', '#e91e63', '#ffc107']
  },
  {
    key: 'synthwave',
    name: 'Synthwave',
    description: 'Neon pink and cyan - retro cyberpunk vibes',
    preview: ['#1a0033', '#ff00ff', '#00ffff', '#ffff00']
  },
  {
    key: 'monochrome',
    name: 'Monochrome',
    description: 'Clean black to white gradient - minimal elegance',
    preview: ['#000000', '#555555', '#aaaaaa', '#ffffff']
  },
  {
    key: 'aurora',
    name: 'Aurora',
    description: 'Green and purple lights - northern lights magic',
    preview: ['#001122', '#00ff88', '#8844ff', '#44ffff']
  }
];

export function ThemeSelector() {
  const { colorTheme, setColorTheme } = useStore();
  
  return (
    <div className="theme-selector">
      <h3>Color Theme</h3>
      
      <div className="theme-grid">
        {THEME_OPTIONS.map((theme) => (
          <button
            key={theme.key}
            className={`theme-option ${colorTheme === theme.key ? 'active' : ''}`}
            onClick={() => setColorTheme(theme.key)}
            aria-label={`Switch to ${theme.name} theme`}
          >
            <div className="theme-preview">
              {theme.preview.map((color, index) => (
                <div 
                  key={index}
                  className="color-swatch"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            <div className="theme-info">
              <div className="theme-name">{theme.name}</div>
              <div className="theme-description">{theme.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Compact version for mobile/small spaces
export function ThemeQuickSelector() {
  const { colorTheme, setColorTheme } = useStore();
  
  return (
    <div className="theme-quick-selector">
      <label htmlFor="theme-select">Theme:</label>
      <select
        id="theme-select"
        value={colorTheme}
        onChange={(e) => setColorTheme(e.target.value as ColorTheme)}
        className="theme-select"
      >
        {THEME_OPTIONS.map((theme) => (
          <option key={theme.key} value={theme.key}>
            {theme.name}
          </option>
        ))}
      </select>
      
      <div className="current-theme-preview">
        {THEME_OPTIONS.find(t => t.key === colorTheme)?.preview.map((color, index) => (
          <div 
            key={index}
            className="mini-swatch"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}