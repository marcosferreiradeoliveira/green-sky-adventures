import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeFirebase } from './lib/firebase';
import ErrorBoundary from './components/ErrorBoundary';

// Loading component
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando Green Sky...</p>
    </div>
  </div>
);

// Error fallback component
const ErrorFallback = () => (
  <div className="flex items-center justify-center min-h-screen p-4">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-2">Ocorreu um erro</h1>
      <p className="mb-4">Por favor, recarregue a página.</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Recarregar Página
      </button>
    </div>
  </div>
);

// App wrapper with error boundary
const AppWithErrorBoundary = () => (
  <React.StrictMode>
    <ErrorBoundary fallback={<ErrorFallback />}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Initialize the app
const initApp = async () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  const root = createRoot(rootElement);

  try {
    // Show loading screen
    root.render(<LoadingScreen />);

    // Initialize Firebase with timeout
    const initWithTimeout = Promise.race([
      initializeFirebase,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firebase init timeout')), 5000)
      )
    ]);

    try {
      await initWithTimeout;
    } catch (error) {
      console.warn('Firebase initialization warning:', error);
      // Continue with app loading even if Firebase fails
    }

    // Small delay to prevent render conflicts on iOS
    await new Promise(resolve => setTimeout(resolve, 100));

    // Render the main app
    root.render(<AppWithErrorBoundary />);

  } catch (error) {
    console.error('App initialization error:', error);
    root.render(<ErrorFallback />);
  }
};

// Start the app with error handling
initApp().catch(error => {
  console.error('Critical app error:', error);
  
  // Last resort fallback
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1rem;">
        <div style="text-align: center;">
          <h1 style="color: #dc2626; font-size: 1.5rem; margin-bottom: 1rem;">Erro crítico</h1>
          <p style="margin-bottom: 1rem;">Por favor, recarregue a página.</p>
          <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
            Recarregar
          </button>
        </div>
      </div>
    `;
  }
});