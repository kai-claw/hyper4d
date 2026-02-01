// Error boundary to catch Three.js and rendering errors
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console for debugging
    console.error('Hyper4D Error Boundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error,
      errorInfo
    });

    // You could also log the error to an error reporting service here
  }

  handleReload = () => {
    // Reset the error boundary and reload the component
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    
    // Also reset WebGL context if it was lost
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl && gl.isContextLost()) {
        // WebGL context lost — force reload
        window.location.reload();
      }
    }
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI
      return this.props.fallback || (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #0a0a14, #1a1a2e)',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            textAlign: 'center',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          <div style={{ maxWidth: '500px' }}>
            <h1 style={{ 
              fontSize: '2em', 
              marginBottom: '16px',
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🚫 Oops! Something went wrong
            </h1>
            
            <p style={{ fontSize: '1.1em', marginBottom: '24px', color: '#ccc' }}>
              The 4D visualization encountered an error. This can happen with WebGL rendering or complex 4D calculations.
            </p>

            <button
              onClick={this.handleReload}
              style={{
                background: 'linear-gradient(135deg, #4fc3f7, #ab47bc)',
                border: 'none',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1em',
                cursor: 'pointer',
                marginRight: '12px'
              }}
            >
              🔄 Try Again
            </button>

            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1em',
                cursor: 'pointer'
              }}
            >
              🔃 Reload Page
            </button>

            {process.env.NODE_ENV === 'development' && (
              <details style={{ marginTop: '24px', textAlign: 'left', fontSize: '0.9em' }}>
                <summary style={{ cursor: 'pointer', color: '#ff6b6b' }}>
                  🛠️ Development Error Details
                </summary>
                <pre style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  padding: '12px', 
                  borderRadius: '4px', 
                  overflow: 'auto',
                  marginTop: '8px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error) => {
    // Check if it's a WebGL context loss
    if (error.message?.includes('WebGL') || error.message?.includes('context')) {
      // WebGL context loss — reload is the safest recovery
      window.location.reload();
    }
  };
}