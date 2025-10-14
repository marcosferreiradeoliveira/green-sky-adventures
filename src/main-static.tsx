// Versão estática para iOS - sem imports dinâmicos
console.log('[STATIC] Iniciando versão estática para iOS');

// Imports estáticos
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeFirebase } from './lib/firebase';
import ErrorBoundary from './components/ErrorBoundary';

// Detecção iOS
const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Componente de carregamento simples
const LoadingScreen = () => {
  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }
  }, 
    React.createElement('div', {
      style: { textAlign: 'center' }
    },
      React.createElement('div', {
        style: {
          width: '48px',
          height: '48px',
          border: '2px solid #e5e7eb',
          borderTop: '2px solid #22c55e',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }
      }),
      React.createElement('p', {
        style: { color: '#6b7280', fontSize: '16px' }
      }, 'Carregando Green Sky...'),
      React.createElement('style', {
        dangerouslySetInnerHTML: {
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }
      })
    )
  );
};

// Componente de erro simples
const ErrorScreen = () => {
  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }
  },
    React.createElement('div', {
      style: { textAlign: 'center', maxWidth: '400px' }
    },
      React.createElement('h1', {
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#dc2626',
          marginBottom: '16px'
        }
      }, '⚠️ Erro de Carregamento'),
      React.createElement('p', {
        style: {
          color: '#6b7280',
          marginBottom: '24px',
          lineHeight: '1.6'
        }
      }, 'Ocorreu um problema ao carregar a aplicação.'),
      React.createElement('button', {
        onClick: () => window.location.reload(),
        style: {
          backgroundColor: '#22c55e',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer'
        }
      }, 'Recarregar Página')
    )
  );
};

// Função principal de inicialização
const initStaticApp = async () => {
  console.log('[STATIC] Iniciando aplicação estática...');
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('[STATIC] Elemento root não encontrado');
    return;
  }
  
  try {
    console.log('[STATIC] Criando root do React...');
    const root = createRoot(rootElement);
    
    // Renderizar tela de carregamento
    console.log('[STATIC] Renderizando tela de carregamento...');
    root.render(React.createElement(LoadingScreen));
    
    // Aguardar um pouco para estabilizar
    console.log('[STATIC] Aguardando estabilização...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Inicializar Firebase
    console.log('[STATIC] Inicializando Firebase...');
    try {
      await Promise.race([
        initializeFirebase(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firebase timeout')), 8000)
        )
      ]);
      console.log('[STATIC] Firebase inicializado com sucesso');
    } catch (firebaseError) {
      console.warn('[STATIC] Firebase não inicializado:', firebaseError);
    }
    
    // Aguardar mais um pouco
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Renderizar aplicação completa
    console.log('[STATIC] Renderizando aplicação completa...');
    
    const AppWithErrorBoundary = () => {
      return React.createElement(React.StrictMode, null,
        React.createElement(ErrorBoundary, {
          fallback: React.createElement(ErrorScreen)
        },
          React.createElement(App)
        )
      );
    };
    
    root.render(React.createElement(AppWithErrorBoundary));
    console.log('[STATIC] Aplicação renderizada com sucesso!');
    
  } catch (error) {
    console.error('[STATIC] Erro crítico:', error);
    
    // Fallback final com HTML puro
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; font-family: system-ui;">
        <div style="text-align: center; max-width: 400px;">
          <h1 style="color: #dc2626; margin-bottom: 16px;">⚠️ Erro Crítico</h1>
          <p style="color: #64748b; margin-bottom: 24px;">Ocorreu um erro crítico ao carregar a aplicação.</p>
          <button onclick="window.location.reload()" style="background: #22c55e; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;">
            Recarregar Página
          </button>
        </div>
      </div>
    `;
  }
};

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStaticApp);
} else {
  initStaticApp();
}

export {};
