import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html',
      output: {
        // Chunks muito menores para iOS - dividir em mais partes
        manualChunks: (id) => {
          // React core
          if (id.includes('react') && !id.includes('react-dom')) {
            return 'react-core';
          }
          // React DOM
          if (id.includes('react-dom')) {
            return 'react-dom';
          }
          // Router
          if (id.includes('react-router')) {
            return 'router';
          }
          // Firebase
          if (id.includes('firebase')) {
            return 'firebase';
          }
          // Radix UI components
          if (id.includes('@radix-ui')) {
            return 'radix-ui';
          }
          // Lucide icons
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          // TanStack Query
          if (id.includes('@tanstack')) {
            return 'tanstack';
          }
          // Node modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Configurações para otimizar memória e compatibilidade iOS
    minify: 'esbuild',
    sourcemap: false, // Desabilitar sourcemap para economizar memória
    chunkSizeWarningLimit: 500, // Reduzir limite para chunks menores
    emptyOutDir: true,
    // Configurar target para compatibilidade com iOS Safari
    target: ['es2015', 'safari12'] // Compatibilidade com iOS Safari
  },
  
  // Configuração de aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  
  // Configuração do servidor de desenvolvimento
  server: {
    host: "::",
    port: 8080,
    open: true,
    cors: true
  },
  
  // Pré-visualização de produção
  preview: {
    port: 5000,
    open: true
  },

  // Otimizar dependências
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['firebase']
  }
}))