// Main entry point for Vite build
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './scripts/pages/app.jsx';
import './styles/styles.css';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          background: 'linear-gradient(135deg, #ff9b7a, #ff7a52)',
          color: 'white',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '40px',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)'
          }}>
            <h1>🔬 Dermalyze</h1>
            <h2>Oops! Something went wrong</h2>
            <p>Please refresh the page or try again later.</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                background: 'white',
                color: '#ff9b7a',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary>Error Details</summary>
              <pre style={{ 
                background: 'rgba(0,0,0,0.2)', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto'
              }}>
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize app
function initializeApp() {
  try {
    const container = document.getElementById('root');
    
    if (!container) {
      throw new Error('Root element not found');
    }

    const root = createRoot(container);
    
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );

    console.log('✅ Dermalyze app initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    
    // Fallback rendering
    const container = document.getElementById('root');
    if (container) {
      container.innerHTML = `
        <div style="
          padding: 40px;
          text-align: center;
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #ff9b7a, #ff7a52);
          color: white;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
          ">
            <h1>🔬 Dermalyze</h1>
            <h2>Loading Error</h2>
            <p>Failed to load the application. Please check your connection and try again.</p>
            <button onclick="window.location.reload()" style="
              padding: 12px 24px;
              background: white;
              color: #ff9b7a;
              border: none;
              border-radius: 8px;
              font-weight: bold;
              cursor: pointer;
            ">
              Retry
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
