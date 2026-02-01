/**
 * Keyboard shortcuts help overlay
 */
// Keyboard shortcuts help overlay

interface KeyboardShortcutsHelpProps {
  visible: boolean;
  onClose: () => void;
}

const SHORTCUTS_DATA = [
  { key: 'H', action: 'Toggle Help', category: 'General' },
  { key: 'I', action: 'Toggle Info Panel', category: 'General' },
  { key: 'Space', action: 'Toggle Auto-rotation', category: 'General' },
  { key: 'R', action: 'Reset All Rotations', category: 'Rotation' },
  { key: '↑↓←→', action: 'Nudge 4D rotation', category: 'Rotation' },
  { key: '1-6', action: 'Select Shape', category: 'Shapes' },
  { key: 'N', action: 'Next Shape', category: 'Shapes' },
  { key: 'P', action: 'Previous Shape', category: 'Shapes' },
  { key: 'V', action: 'Toggle Vertices', category: 'Display' },
  { key: 'E', action: 'Toggle Edges', category: 'Display' },
  { key: 'A', action: 'Toggle Axes', category: 'Display' },
  { key: 'G', action: 'Toggle Grid', category: 'Display' },
  { key: 'C', action: 'Toggle Color by W', category: 'Display' },
  { key: 'S', action: 'Toggle Cross-section', category: 'Display' },
];

const CATEGORIES = ['General', 'Rotation', 'Shapes', 'Display'];

export function KeyboardShortcutsHelp({ visible, onClose }: KeyboardShortcutsHelpProps) {
  if (!visible) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(4px)',
      }}
      role="dialog"
      aria-label="Keyboard shortcuts"
      aria-modal="true"
    >
      <div 
        className="shortcuts-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1a1a24',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          border: '1px solid #333',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #333',
          paddingBottom: '16px'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
            ⌨️ Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
            }}
            aria-label="Close shortcuts help"
          >
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          {CATEGORIES.map(category => {
            const categoryShortcuts = SHORTCUTS_DATA.filter(s => s.category === category);
            
            return (
              <div key={category}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '16px', 
                  color: '#4fc3f7',
                  fontWeight: 500
                }}>
                  {category}
                </h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {categoryShortcuts.map(({ key, action }) => (
                    <div 
                      key={`${category}-${key}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                      }}
                    >
                      <span style={{ opacity: 0.9 }}>{action}</span>
                      <kbd style={{
                        background: '#2a2a34',
                        color: '#ffffff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        border: '1px solid #444',
                        minWidth: '24px',
                        textAlign: 'center',
                      }}>
                        {key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(79, 195, 247, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(79, 195, 247, 0.2)',
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, lineHeight: 1.4 }}>
            <strong>💡 Pro Tips:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>Hold <strong>Shift</strong> + drag to rotate in 4D space</li>
              <li>Use arrow keys with <strong>Shift</strong> for different 4D planes</li>
              <li>Mouse wheel zooms the 3D camera</li>
              <li>Right-click drag is disabled to avoid conflicts with 4D rotation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}