import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Filter only the Firebase env vars to expose to client
  const firebaseEnvVars = Object.entries(env)
    .filter(([key]) => key.startsWith('VITE_FIREBASE_'))
    .reduce((acc, [key, val]) => ({
      ...acc,
      [key]: val
    }), {});
  
  return {
    base: '/',
    server: {
      host: "::",
      port: 8080,
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
          assetFileNames: `assets/[name]-[hash][extname]`
        }
      }
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Explicitly define the environment variables we want to expose
    define: {
      'import.meta.env': {
        ...firebaseEnvVars,
        MODE: mode,
        DEV: mode === 'development',
        PROD: mode === 'production'
      }
    }
  };
});
