import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  // Configuração de aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  
  // Configurações de build otimizadas para evitar problemas de memória
  build: {
    outDir: 'dist',
    // Remover manual chunks que podem causar problemas de memória
    rollupOptions: {
      output: {
        // Deixar o Vite otimizar automaticamente os chunks
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Configurações para otimizar memória
    minify: 'esbuild',
    sourcemap: false, // Desabilitar sourcemap para economizar memória
    chunkSizeWarningLimit: 1000,
    emptyOutDir: true,
    // Configurar target para compatibilidade
    target: 'esnext'
  },
  
  // Configuração do servidor de desenvolvimento
  server: {
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
})