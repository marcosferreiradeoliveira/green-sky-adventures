// Aplicação simplificada para iOS - vanilla JavaScript
(function() {
  'use strict';
  
  console.log('[IOS-APP] Iniciando aplicação iOS simplificada');
  
  // Componente principal da aplicação
  function createMainApp() {
    const container = createElement('div', {
      style: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }
    });
    
    // Header
    const header = createElement('header', {
      style: {
        backgroundColor: 'white',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }
    });
    
    const title = createElement('h1', {
      style: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#22c55e',
        margin: '0 0 8px 0'
      }
    }, '🛩️ Green Sky');
    
    const subtitle = createElement('p', {
      style: {
        color: '#64748b',
        fontSize: '16px',
        margin: '0'
      }
    }, 'Voe com Aventura, Voe com Propósito');
    
    header.appendChild(title);
    header.appendChild(subtitle);
    
    // Main content
    const main = createElement('main', {
      style: {
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }
    });
    
    // Hero section
    const hero = createElement('div', {
      style: {
        textAlign: 'center',
        marginBottom: '60px'
      }
    });
    
    const heroTitle = createElement('h2', {
      style: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#1f2937',
        margin: '0 0 16px 0',
        lineHeight: '1.2'
      }
    }, 'Bem-vindo ao Green Sky');
    
    const heroDescription = createElement('p', {
      style: {
        fontSize: '18px',
        color: '#6b7280',
        margin: '0 0 32px 0',
        lineHeight: '1.6'
      }
    }, 'Conectamos aventureiros a pilotos de voo livre, transformando aventuras em impacto positivo para o meio ambiente e comunidades.');
    
    const ctaButton = createElement('button', {
      style: {
        backgroundColor: '#22c55e',
        color: 'white',
        border: 'none',
        padding: '16px 32px',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
      },
      onclick: function() {
        alert('Funcionalidade em desenvolvimento! Em breve você poderá explorar voos incríveis.');
      }
    }, 'Explorar Voos');
    
    hero.appendChild(heroTitle);
    hero.appendChild(heroDescription);
    hero.appendChild(ctaButton);
    
    // Features section
    const features = createElement('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '32px',
        marginBottom: '60px'
      }
    });
    
    const featureItems = [
      {
        icon: '✈️',
        title: 'Voo Livre',
        description: 'Experiências únicas de voo livre com pilotos certificados'
      },
      {
        icon: '🌱',
        title: 'Impacto Positivo',
        description: 'Cada voo contribui para projetos ambientais e sociais'
      },
      {
        icon: '🤝',
        title: 'Comunidade',
        description: 'Conecte-se com outros aventureiros e pilotos'
      }
    ];
    
    featureItems.forEach(feature => {
      const featureCard = createElement('div', {
        style: {
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }
      });
      
      const icon = createElement('div', {
        style: {
          fontSize: '48px',
          marginBottom: '16px'
        }
      }, feature.icon);
      
      const title = createElement('h3', {
        style: {
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: '0 0 12px 0'
        }
      }, feature.title);
      
      const description = createElement('p', {
        style: {
          color: '#6b7280',
          lineHeight: '1.6',
          margin: '0'
        }
      }, feature.description);
      
      featureCard.appendChild(icon);
      featureCard.appendChild(title);
      featureCard.appendChild(description);
      features.appendChild(featureCard);
    });
    
    // Footer
    const footer = createElement('footer', {
      style: {
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center'
      }
    });
    
    const footerText = createElement('p', {
      style: {
        margin: '0',
        fontSize: '14px',
        color: '#9ca3af'
      }
    }, '© 2024 Green Sky. Transformando aventuras em impacto positivo.');
    
    footer.appendChild(footerText);
    
    // Montar a aplicação
    main.appendChild(hero);
    main.appendChild(features);
    container.appendChild(header);
    container.appendChild(main);
    container.appendChild(footer);
    
    return container;
  }
  
  // Função para criar elementos DOM (reutilizada do loader)
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
  
  // Função de inicialização global
  window.__GREEN_SKY_APP__ = {
    init: function() {
      console.log('[IOS-APP] Inicializando aplicação...');
      
      const rootElement = document.getElementById('root');
      if (!rootElement) {
        console.error('[IOS-APP] Elemento root não encontrado');
        return;
      }
      
      try {
        // Limpar conteúdo anterior
        rootElement.innerHTML = '';
        
        // Renderizar aplicação
        const app = createMainApp();
        rootElement.appendChild(app);
        
        console.log('[IOS-APP] Aplicação renderizada com sucesso!');
      } catch (error) {
        console.error('[IOS-APP] Erro ao renderizar aplicação:', error);
        
        // Fallback
        rootElement.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; font-family: system-ui;">
            <div style="text-align: center; max-width: 400px;">
              <h1 style="color: #dc2626; margin-bottom: 16px;">⚠️ Erro de Renderização</h1>
              <p style="color: #6b7280; margin-bottom: 24px;">Ocorreu um problema ao renderizar a aplicação.</p>
              <button onclick="window.location.reload()" style="background: #22c55e; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
                Recarregar Página
              </button>
            </div>
          </div>
        `;
      }
    }
  };
  
})();
