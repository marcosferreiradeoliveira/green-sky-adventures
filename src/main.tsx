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

// Imports básicos necessários
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { initIOSFixes, isIOS, isStackOverflowError } from './lib/ios-fixes';

// Imports estáticos para iOS
import App from './App.tsx';
import { initializeFirebase } from './lib/firebase';
import ErrorBoundary from './components/ErrorBoundary';

// Detecção iOS local (backup)
const isIOSLocal = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Componente mínimo de fallback
const MinimalApp = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '400px',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          color: '#22c55e',
          fontSize: '32px',
          marginBottom: '16px',
          fontWeight: 'bold'
        }}>
          🛩️ Green Sky
        </h1>
        
        <p style={{
          color: '#64748b',
          fontSize: '18px',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          Voe com Aventura, Voe com Propósito
        </p>
        
        <div style={{
          backgroundColor: '#f1f5f9',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <p style={{
            color: '#475569',
            fontSize: '14px',
            margin: '0 0 12px 0'
          }}>
            🚀 Carregando aplicação...
          </p>
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#e2e8f0',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#22c55e',
              animation: 'loading 2s ease-in-out infinite'
            }}></div>
          </div>
        </div>
        
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#22c55e',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
        >
          Recarregar
        </button>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes loading {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(0%); }
            100% { transform: translateX(100%); }
          }
        `
      }} />
    </div>
  );
};

// Função para carregar módulos de forma segura
const loadModuleSafely = async (modulePath: string, moduleName: string) => {
  try {
    console.log(`[MAIN] Carregando módulo: ${moduleName}`);
    
    // Para iOS, usar setTimeout para dar tempo ao stack se recuperar
    if (isIOSLocal()) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    const module = await import(modulePath);
    console.log(`[MAIN] Módulo ${moduleName} carregado com sucesso`);
    return module;
  } catch (error) {
    console.error(`[MAIN] Erro ao carregar módulo ${moduleName}:`, error);
    throw error;
  }
};

// Carregamento condicional para iOS
const loadApp = async () => {
  try {
    if (isIOSLocal()) {
      console.log('[MAIN] iOS detectado - usando imports estáticos');
      
      // Para iOS, usar imports estáticos já carregados
      return {
        React,
        createRoot,
        App,
        initializeFirebase,
        ErrorBoundary
      };
    } else {
      console.log('[MAIN] Dispositivo não-iOS - carregamento normal');
      
      // Para outros dispositivos, carregamento normal
      const [AppModule, FirebaseModule, ErrorBoundaryModule] = await Promise.all([
        import('./App.tsx'),
        import('./lib/firebase'),
        import('./components/ErrorBoundary')
      ]);
      
      return {
        App: AppModule.default,
        initializeFirebase: FirebaseModule.initializeFirebase,
        ErrorBoundary: ErrorBoundaryModule.default
      };
    }
  } catch (error) {
    console.error('[MAIN] Erro ao carregar módulos:', error);
    throw error;
  }
};

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
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '2px solid #e5e7eb',
        borderTop: '2px solid #22c55e',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
      }}></div>
      <p style={{ color: '#6b7280', fontSize: '16px' }}>Carregando Green Sky....</p>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  </div>
);

// Error fallback component
const ErrorFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '16px'
  }}>
    <div style={{ textAlign: 'center' }}>
      <h1 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#dc2626',
        marginBottom: '8px'
      }}>Ocorreu um erro</h1>
      <p style={{
        marginBottom: '16px',
        color: '#6b7280'
      }}>Por favor, recarregue a página.</p>
      <button 
        onClick={() => window.location.reload()}
        style={{
          padding: '8px 16px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
      >
        Recarregar Página
      </button>
    </div>
  </div>
);

// App wrapper with error boundary será criado dinamicamente após carregar módulos

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
    debugLog('5. Carregando módulos da aplicação...');
    const modules = await loadApp();
    debugLog('6. Módulos carregados com sucesso');
    
    // Para iOS, usar React e createRoot dos módulos carregados
    const ReactComponent = modules.React || React;
    const createRootFn = modules.createRoot || createRoot;
    
    debugLog('7. Inicializando Firebase...');
    // Initialize Firebase with timeout
    await Promise.race([
      (async () => {
        try {
          await modules.initializeFirebase();
          debugLog('8. Firebase inicializado com sucesso');
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
    
    // Small delay to ensure everything is ready
    debugLog('9. Aguardando delay final...');
    await new Promise(resolve => setTimeout(resolve, 300));

    // Final render with the app
    debugLog('10. Renderizando aplicação principal');
    try {
      const AppWithErrorBoundary = () => (
        <ReactComponent.StrictMode>
          <modules.ErrorBoundary fallback={<ErrorFallback />}>
            <modules.App />
          </modules.ErrorBoundary>
        </ReactComponent.StrictMode>
      );
      
      root.render(<AppWithErrorBoundary />);
      debugLog('11. Aplicação renderizada com sucesso');
    } catch (renderError) {
      debugLog('ERRO CRÍTICO ao renderizar aplicação:', renderError);
      throw renderError;
    }
    
  } catch (error) {
    debugLog('AVISO: Erro durante carregamento, continuando...', error);
    // Continue with app loading even if some modules fail
    root.render(<MinimalApp />);
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

// Safe module loading for iOS
const safeStartApp = () => {
  try {
    debugLog('Iniciando aplicação com proteção iOS...');
    
    // Para iOS, usar requestAnimationFrame para garantir que o DOM está estável
    if (isIOS()) {
      debugLog('iOS detectado, usando requestAnimationFrame para estabilidade');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          startApp().catch(err => {
            debugLog('Erro ao iniciar aplicação no iOS:', err);
            if (isStackOverflowError(err)) {
              debugLog('Stack overflow detectado, recarregando...');
              setTimeout(() => window.location.reload(), 500);
            }
          });
        });
      });
    } else {
      // Para outros dispositivos, comportamento normal
      startApp().catch(err => {
        debugLog('Erro ao iniciar aplicação:', err);
      });
    }
  } catch (error) {
    debugLog('Erro crítico ao tentar iniciar aplicação:', error);
    showFallbackError();
  }
};

// Handle DOM ready state
debugLog('Verificando estado do DOM...');
if (document.readyState === 'loading') {
  debugLog('DOM ainda não carregado, aguardando DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', () => {
    debugLog('DOMContentLoaded disparado, iniciando aplicação...');
    safeStartApp();
  });
} else {
  // DOM already loaded
  debugLog('DOM já carregado, iniciando aplicação imediatamente');
  safeStartApp();
}