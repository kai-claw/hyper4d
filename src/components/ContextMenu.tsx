// Right-click context menu for quick actions
import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { captureCanvasScreenshot, generateShareURL } from '../utils/screenshot';
import './ContextMenu.css';

interface ContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  onClose: () => void;
}

export function ContextMenu({ x, y, visible, onClose }: ContextMenuProps) {
  const store = useStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      captureCanvasScreenshot(canvas);
    }
    onClose();
  };

  const handleShare = async () => {
    const url = generateShareURL(store);
    try {
      await navigator.clipboard.writeText(url);
      // Could add a toast notification here
      console.log('Share URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback: show URL in prompt
      prompt('Copy this URL to share:', url);
    }
    onClose();
  };

  const handleResetRotation = () => {
    store.resetRotation();
    onClose();
  };

  const handleToggleAutoRotate = () => {
    store.toggleAutoRotation();
    onClose();
  };

  if (!visible) return null;

  return (
    <div 
      ref={menuRef}
      className="context-menu" 
      style={{ 
        left: x, 
        top: y,
        transform: x > window.innerWidth - 200 ? 'translateX(-100%)' : 'none'
      }}
    >
      <div className="context-menu-item" onClick={handleScreenshot}>
        <span className="context-menu-icon">📸</span>
        <span>Screenshot</span>
        <span className="context-menu-shortcut">Ctrl+S</span>
      </div>
      
      <div className="context-menu-item" onClick={handleShare}>
        <span className="context-menu-icon">🔗</span>
        <span>Share Link</span>
        <span className="context-menu-shortcut">Ctrl+L</span>
      </div>
      
      <div className="context-menu-divider" />
      
      <div className="context-menu-item" onClick={handleResetRotation}>
        <span className="context-menu-icon">🔄</span>
        <span>Reset Rotation</span>
        <span className="context-menu-shortcut">R</span>
      </div>
      
      <div className="context-menu-item" onClick={handleToggleAutoRotate}>
        <span className="context-menu-icon">{store.isAutoRotating ? '⏸️' : '▶️'}</span>
        <span>{store.isAutoRotating ? 'Stop' : 'Start'} Auto-rotate</span>
        <span className="context-menu-shortcut">Space</span>
      </div>
    </div>
  );
}

// Hook for managing context menu state
export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState({
    x: 0,
    y: 0,
    visible: false,
  });

  const showContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      visible: true,
    });
  };

  const hideContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu,
  };
}