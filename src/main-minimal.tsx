// Ponto de entrada mínimo para iOS - sem imports dinâmicos
console.log('[MINIMAL] Iniciando versão mínima para iOS');

// Detecção iOS
const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Função de log
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data || '');
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
    log(`Carregando módulo: ${moduleName}`);
    
    // Para iOS, usar setTimeout para dar tempo ao stack se recuperar
    if (isIOS()) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    const module = await import(modulePath);
    log(`Módulo ${moduleName} carregado com sucesso`);
    return module;
  } catch (error) {
    log(`Erro ao carregar módulo ${moduleName}:`, error);
    throw error;
  }
};

// Função principal de inicialização
const initMinimalApp = async () => {
  log('Iniciando aplicação mínima...');
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    log('ERRO: Elemento root não encontrado');
    return;
  }
  
  // Renderizar tela de carregamento imediatamente
  try {
    const React = (await loadModuleSafely('react', 'React')).default;
    const { createRoot } = await loadModuleSafely('react-dom/client', 'ReactDOM');
    
    log('React carregado, criando root...');
    const root = createRoot(rootElement);
    root.render(<MinimalApp />);
    
    log('Tela de carregamento renderizada');
    
    // Aguardar um pouco para estabilizar
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Carregar módulos principais de forma sequencial
    log('Carregando módulos principais...');
    
    const App = (await loadModuleSafely('./App.tsx', 'App')).default;
    const { initializeFirebase } = await loadModuleSafely('./lib/firebase', 'Firebase');
    const ErrorBoundary = (await loadModuleSafely('./components/ErrorBoundary', 'ErrorBoundary')).default;
    
    log('Todos os módulos carregados, inicializando Firebase...');
    
    // Inicializar Firebase com timeout
    try {
      await Promise.race([
        initializeFirebase(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firebase timeout')), 8000)
        )
      ]);
      log('Firebase inicializado com sucesso');
    } catch (firebaseError) {
      log('Firebase não inicializado, continuando sem ele:', firebaseError);
    }
    
    // Aguardar mais um pouco
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Renderizar aplicação completa
    log('Renderizando aplicação completa...');
    
    const AppWithErrorBoundary = () => (
      <React.StrictMode>
        <ErrorBoundary fallback={<MinimalApp />}>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    
    root.render(<AppWithErrorBoundary />);
    log('Aplicação renderizada com sucesso!');
    
  } catch (error) {
    log('Erro crítico:', error);
    
    // Fallback final
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; font-family: system-ui;">
        <div style="text-align: center; max-width: 400px;">
          <h1 style="color: #dc2626; margin-bottom: 16px;">⚠️ Erro de Carregamento</h1>
          <p style="color: #64748b; margin-bottom: 24px;">Ocorreu um problema ao carregar a aplicação.</p>
          <button onclick="window.location.reload()" style="background: #22c55e; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
            Recarregar Página
          </button>
        </div>
      </div>
    `;
  }
};

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMinimalApp);
} else {
  initMinimalApp();
}

export {};
