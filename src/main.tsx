import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { firebaseInit } from './lib/firebase';
import ErrorBoundary from './components/ErrorBoundary';

// Add a loading component that will be shown while Firebase initializes
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando Green Sky...</p>
    </div>
  </div>
);

// Initialize the app
const initApp = async () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Failed to find the root element');

  const root = createRoot(rootElement);

  // Create a safe render function that won't cause infinite loops
  const safeRender = (content: React.ReactNode) => {
    try {
      root.render(
        <React.StrictMode>
          <ErrorBoundary fallback={
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-2">Ocorreu um erro crítico</h1>
                <p className="mb-4">Por favor, recarregue a página ou tente novamente mais tarde.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Recarregar Página
                </button>
              </div>
            </div>
          }>
            {content}
          </ErrorBoundary>
        </React.StrictMode>
      );
    } catch (error) {
      console.error('Error during rendering:', error);
      // Fallback to a simple error message if rendering fails
      root.render(
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar o aplicativo</h1>
            <p className="mb-4">Por favor, recarregue a página ou tente novamente mais tarde.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }
  };

  try {
    // Show loading screen immediately
    safeRender(<LoadingScreen />);

    // Wait for Firebase to initialize (but don't block the app if it takes too long)
    const firebaseInitPromise = firebaseInit;
    
    // Set a timeout to continue rendering the app even if Firebase takes too long
    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000));
    
    await Promise.race([firebaseInitPromise, timeoutPromise]);

    // Render the app with ErrorBoundary
    safeRender(<App />);
  } catch (error) {
    console.error('Failed to initialize app:', error);
    // If there's an error, still render the app but with error boundary
    safeRender(<App />);
  }
};

// Start the app
initApp().catch(console.error);
