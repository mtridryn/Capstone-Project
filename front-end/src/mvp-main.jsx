/**
 * MVP Main Entry Point - Bootstrap MVP App
 * Alternative entry point yang menggunakan MVP pattern
 */

// CSS imports
import "./styles/styles.css";

import { createRoot } from "react-dom/client";
import MVPApp from "./MVPApp.jsx";

// MVP Infrastructure initialization
import { DIContainer } from './core/index.js';
import { UserModel, ProductModel, AnalysisModel, ArticleModel } from './models/index.js';
import { AuthPresenter, ProductPresenter, AnalysisPresenter, ArticlePresenter } from './presenters/index.js';

/**
 * Initialize MVP Dependency Injection Container
 */
const initializeMVPContainer = () => {
  const container = DIContainer;

  // Register Models
  container.register('userModel', () => new UserModel(), { singleton: true });
  container.register('productModel', () => new ProductModel(), { singleton: true });
  container.register('analysisModel', () => new AnalysisModel(), { singleton: true });
  container.register('articleModel', () => new ArticleModel(), { singleton: true });

  // Register Presenters (non-singleton since they need view instances)
  container.register('authPresenter', (container) => {
    return (viewInterface) => new AuthPresenter({
      view: viewInterface,
      userModel: container.resolve('userModel')
    });
  });

  container.register('productPresenter', (container) => {
    return (viewInterface) => new ProductPresenter({
      view: viewInterface,
      productModel: container.resolve('productModel'),
      userModel: container.resolve('userModel')
    });
  });

  container.register('analysisPresenter', (container) => {
    return (viewInterface) => new AnalysisPresenter({
      view: viewInterface,
      analysisModel: container.resolve('analysisModel'),
      userModel: container.resolve('userModel'),
      productModel: container.resolve('productModel')
    });
  });

  container.register('articlePresenter', (container) => {
    return (viewInterface) => new ArticlePresenter({
      view: viewInterface,
      articleModel: container.resolve('articleModel')
    });
  });

  console.log('🏗️ MVP DI Container initialized');
  console.log('📦 Registered dependencies:', container.getRegisteredNames());

  return container;
};

/**
 * Initialize MVP App
 */
const initializeMVPApp = () => {
  console.log('🚀 Initializing MVP App...');

  // Initialize DI Container
  const container = initializeMVPContainer();

  // Make container globally available for debugging
  if (process.env.NODE_ENV === 'development') {
    window.mvpContainer = container;
    window.mvpDebug = {
      models: {
        user: container.resolve('userModel'),
        product: container.resolve('productModel'),
        analysis: container.resolve('analysisModel'),
        article: container.resolve('articleModel')
      }
    };
    console.log('🔧 MVP Debug tools available at window.mvpContainer and window.mvpDebug');
  }

  // Performance monitoring
  const startTime = performance.now();

  // Initialize React App
  document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("root");
    
    if (!container) {
      console.error('❌ Root container not found');
      return;
    }

    const root = createRoot(container);
    
    try {
      root.render(<MVPApp />);
      
      const endTime = performance.now();
      console.log(`✅ MVP App initialized in ${Math.round(endTime - startTime)}ms`);
      
      // Log app info
      console.log('📱 App Info:', {
        mode: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent.split(' ').slice(-2).join(' ')
      });

    } catch (error) {
      console.error('❌ Failed to initialize MVP App:', error);
      
      // Fallback error UI
      container.innerHTML = `
        <div style="
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          height: 100vh; 
          font-family: system-ui, -apple-system, sans-serif;
          text-align: center;
          padding: 20px;
        ">
          <h1 style="color: #dc2626; margin-bottom: 16px;">⚠️ App Initialization Failed</h1>
          <p style="color: #6b7280; margin-bottom: 24px;">
            There was an error starting the application. Please refresh the page or contact support.
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: #3b82f6; 
              color: white; 
              border: none; 
              padding: 12px 24px; 
              border-radius: 8px; 
              cursor: pointer;
              font-size: 16px;
            "
          >
            🔄 Refresh Page
          </button>
          <details style="margin-top: 24px; text-align: left; max-width: 600px;">
            <summary style="cursor: pointer; color: #6b7280;">Technical Details</summary>
            <pre style="
              background: #f3f4f6; 
              padding: 16px; 
              border-radius: 8px; 
              overflow: auto; 
              font-size: 12px;
              margin-top: 8px;
            ">${error.stack || error.message}</pre>
          </details>
        </div>
      `;
    }
  });
};

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('🚨 Global Error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
});

// Initialize app
initializeMVPApp();
