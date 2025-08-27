import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['jspdf', 'html2canvas']
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'pdf-utils': ['jspdf', 'html2canvas']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: false
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
