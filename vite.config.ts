import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  // Carregar variáveis de ambiente do .env e do ambiente
  const env = loadEnv(mode, process.cwd(), '')
  
  // Log para depuração (só mostra no servidor de desenvolvimento)
  if (command === 'serve') {
    console.log('\n🔥 Vite Config Debug:')
    console.log('Mode:', mode)
    console.log('Command:', command)
    console.log('Firebase vars found:', Object.keys(env).filter(key => key.startsWith('VITE_')))
    console.log('\n')
  }

  // Processar apenas as variáveis necessárias para o cliente
  const clientEnv = {}
  const firebaseVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_MEASUREMENT_ID'
  ]

  // Adicionar apenas as variáveis necessárias
  firebaseVars.forEach(key => {
    if (env[key] !== undefined) {
      clientEnv[`import.meta.env.${key}`] = JSON.stringify(env[key])
    } else if (command === 'build') {
      // No build, falhar se alguma variável estiver faltando
      throw new Error(`❌ Variável de ambiente ${key} não encontrada! Verifique suas configurações.`)
    } else {
      console.warn(`⚠️  Variável de ambiente ${key} não encontrada no modo de desenvolvimento`)
    }
  })
  
  return {
    plugins: [react()],
    
    // Configuração de aliases
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    
    // Definir variáveis de ambiente para o cliente
    define: clientEnv,
    
    // Configurações de build
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
          }
        }
      },
      // Melhorar mensagens de erro
      minify: 'esbuild',
      sourcemap: mode !== 'production',
      // Avisar sobre assets grandes
      chunkSizeWarningLimit: 1000,
      // Limpar a pasta de saída antes de construir
      emptyOutDir: true
    },
    
    // Configuração do servidor de desenvolvimento
    server: {
      port: 3000,
      open: true,
      // Habilitar CORS para desenvolvimento
      cors: true
    },
    
    // Pré-visualização de produção
    preview: {
      port: 5000,
      open: true
    }
  }
})