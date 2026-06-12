import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: true
    }
  },
  optimizeDeps: {
    force: true
  },
  build: {
    rollupOptions: {
      output: {
        // Separar librerías pesadas en chunks propios para acelerar la carga inicial
        manualChunks(id) {
          if (id.includes('node_modules/recharts')) return 'recharts';
          if (id.includes('node_modules/@supabase')) return 'supabase';
          if (id.includes('node_modules/react')) return 'react';
        }
      }
    }
  }
})
