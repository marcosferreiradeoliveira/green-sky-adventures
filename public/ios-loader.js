// Carregador vanilla JavaScript para iOS - sem módulos ES6
(function() {
  'use strict';
  
  console.log('[IOS-LOADER] Iniciando carregador vanilla para iOS');
  
  // Detecção iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  if (!isIOS) {
    console.log('[IOS-LOADER] Não é iOS, não carregando');
    return;
  }
  
  console.log('[IOS-LOADER] iOS detectado, iniciando carregamento vanilla');
  
  // Função para criar elementos DOM
  function createElement(tag, attributes, content) {
    const element = document.createElement(tag);
    
    if (attributes) {
      Object.keys(attributes).forEach(key => {
        if (key === 'style' && typeof attributes[key] === 'object') {
          Object.assign(element.style, attributes[key]);
        } else if (key === 'className') {
          element.className = attributes[key];
        } else {
          element.setAttribute(key, attributes[key]);
        }
      });
    }
    
    if (content) {
      if (typeof content === 'string') {
        element.innerHTML = content;
      } else if (Array.isArray(content)) {
        content.forEach(child => {
          if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
          } else {
            element.appendChild(child);
          }
        });
      } else {
        element.appendChild(content);
      }
    }
    
    return element;
  }
  
  // Componente de carregamento vanilla
  function createLoadingScreen() {
    const container = createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }
    });
    
    const content = createElement('div', {
      style: {
        textAlign: 'center',
        maxWidth: '400px',
        padding: '40px'
      }
    });
    
    const title = createElement('h1', {
      style: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#22c55e',
        marginBottom: '16px'
      }
    }, '🛩️ Green Sky');
    
    const subtitle = createElement('p', {
      style: {
        color: '#64748b',
        fontSize: '18px',
        marginBottom: '24px',
        lineHeight: '1.6'
      }
    }, 'Voe com Aventura, Voe com Propósito');
    
    const loadingBox = createElement('div', {
      style: {
        backgroundColor: '#f1f5f9',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '24px'
      }
    });
    
    const loadingText = createElement('p', {
      style: {
        color: '#475569',
        fontSize: '14px',
        margin: '0 0 12px 0'
      }
    }, '🚀 Carregando aplicação...');
    
    const progressBar = createElement('div', {
      style: {
        width: '100%',
        height: '4px',
        backgroundColor: '#e2e8f0',
        borderRadius: '2px',
        overflow: 'hidden'
      }
    });
    
    const progressFill = createElement('div', {
      style: {
        width: '100%',
        height: '100%',
        backgroundColor: '#22c55e',
        animation: 'loading 2s ease-in-out infinite'
      }
    });
    
    progressBar.appendChild(progressFill);
    loadingBox.appendChild(loadingText);
    loadingBox.appendChild(progressBar);
    
    const reloadButton = createElement('button', {
      style: {
        backgroundColor: '#22c55e',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer'
      },
      onclick: function() {
        window.location.reload();
      }
    }, 'Recarregar');
    
    content.appendChild(title);
    content.appendChild(subtitle);
    content.appendChild(loadingBox);
    content.appendChild(reloadButton);
    container.appendChild(content);
    
    // Adicionar CSS da animação
    const style = createElement('style', {}, `
      @keyframes loading {
        0% { transform: translateX(-100%); }
        50% { transform: translateX(0%); }
        100% { transform: translateX(100%); }
      }
    `);
    
    document.head.appendChild(style);
    
    return container;
  }
  
  // Função para carregar scripts de forma sequencial
  function loadScript(src, callback) {
    console.log('[IOS-LOADER] Carregando script:', src);
    
    const script = createElement('script', {
      src: src,
      type: 'text/javascript'
    });
    
    script.onload = function() {
      console.log('[IOS-LOADER] Script carregado:', src);
      if (callback) callback();
    };
    
    script.onerror = function() {
      console.error('[IOS-LOADER] Erro ao carregar script:', src);
      if (callback) callback(new Error('Failed to load script: ' + src));
    };
    
    document.head.appendChild(script);
  }
  
  // Função para carregar CSS
  function loadCSS(href) {
    console.log('[IOS-LOADER] Carregando CSS:', href);
    
    const link = createElement('link', {
      rel: 'stylesheet',
      href: href
    });
    
    document.head.appendChild(link);
  }
  
  // Função principal de inicialização
  function initIOSApp() {
    console.log('[IOS-LOADER] Iniciando aplicação iOS...');
    
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error('[IOS-LOADER] Elemento root não encontrado');
      return;
    }
    
    // Renderizar tela de carregamento
    const loadingScreen = createLoadingScreen();
    rootElement.appendChild(loadingScreen);
    
    // Aguardar um pouco para estabilizar
    setTimeout(function() {
      console.log('[IOS-LOADER] Iniciando carregamento de recursos...');
      
      // Carregar CSS primeiro
      loadCSS('/assets/index-8d6DMauJ.css');
      
      // Aguardar um pouco antes de carregar a aplicação vanilla
      setTimeout(function() {
        console.log('[IOS-LOADER] Carregando aplicação vanilla...');
        
        // Carregar apenas a aplicação vanilla (sem React/Firebase)
        loadScript('/ios-app.js', function(error) {
          if (error) {
            console.error('[IOS-LOADER] Erro ao carregar aplicação vanilla:', error);
            // Manter tela de carregamento em caso de erro
            return;
          }
          
          console.log('[IOS-LOADER] Aplicação vanilla carregada, inicializando...');
          
          // Aguardar um pouco e inicializar
          setTimeout(function() {
            try {
              if (window.__GREEN_SKY_APP__) {
                window.__GREEN_SKY_APP__.init();
              } else {
                console.error('[IOS-LOADER] Aplicação não encontrada');
              }
            } catch (error) {
              console.error('[IOS-LOADER] Erro ao inicializar aplicação:', error);
            }
          }, 500);
        });
        
      }, 500);
      
    }, 1000);
  }
  
  // Inicializar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIOSApp);
  } else {
    initIOSApp();
  }
  
})();
