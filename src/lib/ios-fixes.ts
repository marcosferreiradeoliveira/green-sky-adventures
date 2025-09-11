// src/lib/ios-fixes.ts
// Conjunto de correções específicas para iOS

/**
 * Detecta se está rodando no iOS
 */
export const isIOS = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  };
  
  /**
   * Previne zoom duplo-tap no iOS
   */
  export const preventIOSDoubleTabZoom = (): void => {
    if (!isIOS()) return;
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  };
  
  /**
   * Corrige problemas de viewport no iOS Safari
   */
  export const fixIOSViewport = (): void => {
    if (!isIOS()) return;
    
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', () => {
      setTimeout(setViewportHeight, 100);
    });
  };
  
  /**
   * Previne memory leaks relacionados a event listeners
   */
  export const cleanupEventListeners = (): (() => void) => {
    const controllers: AbortController[] = [];
    
    return () => {
      controllers.forEach(controller => {
        try {
          controller.abort();
        } catch (error) {
          console.warn('Error aborting controller:', error);
        }
      });
      controllers.length = 0;
    };
  };
  
  /**
   * Detecta se o erro é relacionado ao stack overflow
   */
  export const isStackOverflowError = (error: Error): boolean => {
    return error.message?.toLowerCase().includes('maximum call stack') ||
      error.name === 'RangeError';
  };
  
  /**
   * Safe setTimeout para iOS
   */
  export const safeSetTimeout = (callback: () => void, delay: number): number => {
    if (isIOS() && delay < 4) {
      delay = 4; // iOS tem limitação mínima de 4ms
    }
    return window.setTimeout(callback, delay);
  };
  
  /**
   * Debounce function otimizada para iOS
   */
  export const debounce = <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: number | undefined;
    
    return (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = safeSetTimeout(() => {
        func(...args);
      }, delay);
    };
  };
  
  /**
   * Inicializa correções para iOS
   */
  export const initIOSFixes = (): (() => void) => {
    if (!isIOS()) {
      return () => {}; // Noop cleanup
    }
    
    console.log('Aplicando correções para iOS');
    
    preventIOSDoubleTabZoom();
    fixIOSViewport();
    
    // Cleanup function
    const cleanup = cleanupEventListeners();
    
    return cleanup;
  };