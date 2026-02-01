// Screenshot functionality for the 3D canvas
export function captureCanvasScreenshot(canvas: HTMLCanvasElement, filename?: string): void {
  try {
    // Create a higher quality version
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    const activeShape = (window as any).__hyper4d_activeShape || 'tesseract';
    const defaultFilename = `hyper4d-${activeShape}-${timestamp}.png`;
    
    link.download = filename || defaultFilename;
    
    // Convert canvas to blob for higher quality
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png', 1.0);
  } catch (error) {
    console.error('Failed to capture screenshot:', error);
    // Fallback to data URL
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    const activeShape = (window as any).__hyper4d_activeShape || 'tesseract';
    const defaultFilename = `hyper4d-${activeShape}-${timestamp}.png`;
    
    link.download = filename || defaultFilename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

// Generate shareable URL with current state
export function generateShareURL(state: any): string {
  const baseURL = window.location.origin + window.location.pathname;
  const stateParams = new URLSearchParams({
    shape: state.activeShape,
    projection: state.projectionMode,
    rx: state.rotation.xy.toFixed(2),
    ry: state.rotation.xz.toFixed(2),
    rz: state.rotation.yz.toFixed(2),
    rw1: state.rotation.xw.toFixed(2),
    rw2: state.rotation.yw.toFixed(2),
    rw3: state.rotation.zw.toFixed(2),
    colorByW: state.colorByW ? '1' : '0',
    slice: state.showSlice ? '1' : '0',
  });
  
  return `${baseURL}#${stateParams.toString()}`;
}

// Parse URL state parameters
export function parseURLState(): Partial<any> | null {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  
  try {
    const params = new URLSearchParams(hash);
    const state: any = {};
    
    if (params.has('shape')) state.activeShape = params.get('shape');
    if (params.has('projection')) state.projectionMode = params.get('projection');
    if (params.has('colorByW')) state.colorByW = params.get('colorByW') === '1';
    if (params.has('slice')) state.showSlice = params.get('slice') === '1';
    
    // Parse rotations
    const rotations = ['rx', 'ry', 'rz', 'rw1', 'rw2', 'rw3'];
    const rotationKeys = ['xy', 'xz', 'yz', 'xw', 'yw', 'zw'];
    
    const rotation: any = {};
    for (let i = 0; i < rotations.length; i++) {
      if (params.has(rotations[i])) {
        rotation[rotationKeys[i]] = parseFloat(params.get(rotations[i])!);
      }
    }
    
    if (Object.keys(rotation).length > 0) {
      state.rotation = rotation;
    }
    
    return state;
  } catch (error) {
    console.error('Failed to parse URL state:', error);
    return null;
  }
}