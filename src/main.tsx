console.log('[MAIN] Iniciando o bundle principal');

// Handler para erros de carregamento de módulos
window.addEventListener('error', (event) => {
  const target = event.target as (HTMLLinkElement | HTMLScriptElement | HTMLImageElement);
  if (target.tagName) {
    console.error(`[MODULE ERROR] Falha ao carregar ${target.tagName}:`, {
      src: 'src' in target ? target.src : target.href || 'unknown',
      error: event.error || 'Erro desconhecido'
    });
  }
}, true);

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeFirebase } from './lib/firebase';
import ErrorBoundary from './components/ErrorBoundary';
import { initIOSFixes, isIOS, isStackOverflowError } from './lib/ios-fixes';

console.log('[MAIN] Módulos principais importados');

// Função de log para debug
const debugLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data || '');
};

// Adiciona um handler para erros síncronos não capturados
window.onerror = function(message, source, lineno, colno, error) {
  debugLog('ERRO GLOBAL SÍNCRONO', { message, source, lineno, colno, error });
  
  // Check if it's a stack overflow error on iOS
  if (isIOS() && error && isStackOverflowError(error)) {
    debugLog('ERRO DE STACK OVERFLOW DETECTADO NO iOS', { message, source, lineno, colno });
    // Try to recover by reloading the page after a short delay
    setTimeout(() => {
      debugLog('Tentando recuperar do stack overflow...');
      window.location.reload();
    }, 1000);
    return true;
  }
  
  return true; // Previne o comportamento padrão do navegador
};

// Loading component
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando Green Sky....</p>
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

// Initialize the app with iOS-specific handling
const initApp = async () => {
  debugLog('1. Iniciando initApp');
  
  // Apply iOS fixes immediately if on iOS
  if (isIOS()) {
    debugLog('iOS detectado, aplicando correções específicas...');
    try {
      const cleanupIOSFixes = initIOSFixes();
      // Store cleanup function globally for potential use
      (window as any).__IOS_CLEANUP__ = cleanupIOSFixes;
      debugLog('Correções iOS aplicadas com sucesso');
    } catch (error) {
      debugLog('Erro ao aplicar correções iOS:', error);
    }
  }
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    debugLog('ERRO: Elemento root não encontrado');
    return;
  }

  // Create root only once and store it
  debugLog('2. Criando root do React');
  let root;
  try {
    root = createRoot(rootElement);
    debugLog('3. Root do React criado com sucesso');
  } catch (error) {
    debugLog('ERRO ao criar root do React:', error);
    return;
  }

  // Initial render with loading screen
  debugLog('4. Renderizando tela de carregamento');
  root.render(<LoadingScreen />);

  try {
    debugLog('5. Inicializando Firebase...');
    // Initialize Firebase with timeout
    await Promise.race([
      (async () => {
        try {
          await initializeFirebase();
          debugLog('6. Firebase inicializado com sucesso');
        } catch (firebaseError) {
          debugLog('ERRO na inicialização do Firebase:', firebaseError);
          throw firebaseError;
        }
      })(),
      new Promise((_, reject) => 
        setTimeout(() => {
          const error = new Error('Firebase init timeout');
          debugLog('ERRO: Timeout na inicialização do Firebase');
          reject(error);
        }, 10000)
      )
    ]);
  } catch (error) {
    debugLog('AVISO: Firebase não inicializado corretamente, continuando...', error);
    // Continue with app loading even if Firebase fails
  }

  // Small delay to ensure everything is ready
  debugLog('7. Aguardando delay final...');
  await new Promise(resolve => setTimeout(resolve, 300));

  // Final render with the app
  debugLog('8. Renderizando aplicação principal');
  try {
    root.render(<AppWithErrorBoundary />);
    debugLog('9. Aplicação renderizada com sucesso');
  } catch (renderError) {
    debugLog('ERRO CRÍTICO ao renderizar aplicação:', renderError);
    throw renderError;
  }
  
  return root; // Return the root for potential cleanup
};

// Fallback error display function
function showFallbackError() {
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
}

// Initialize the app when DOM is ready
const startApp = async () => {
  debugLog('Iniciando aplicação...');
  try {
    await initApp();
    debugLog('Aplicação inicializada com sucesso');
  } catch (error) {
    debugLog('ERRO CRÍTICO na aplicação:', error);
    console.error('Critical app error:', error);
    showFallbackError();
  }
};

// Handle DOM ready state
debugLog('Verificando estado do DOM...');
if (document.readyState === 'loading') {
  debugLog('DOM ainda não carregado, aguardando DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', () => {
    debugLog('DOMContentLoaded disparado, iniciando aplicação...');
    startApp().catch(err => {
      debugLog('Erro ao iniciar aplicação após DOMContentLoaded:', err);
    });
  });
} else {
  // DOM already loaded
  debugLog('DOM já carregado, iniciando aplicação imediatamente');
  startApp().catch(err => {
    debugLog('Erro ao iniciar aplicação:', err);
  });
}