import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    https: false,
    host: 'localhost',
    port: 5173
  },
  build: {
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'framer-motion': ['framer-motion'],
          'three-vendor': ['three'],
          'three-react': ['@react-three/fiber', '@react-three/drei'],
          'lucide': ['lucide-react'],
          'supabase': ['@supabase/supabase-js'],
          'utils': ['./src/lib/colorClassMap.ts', './src/lib/apiClient.ts', './src/lib/supabaseClient.ts'],
          'hooks': ['./src/hooks/useAuth.ts', './src/hooks/useFileUpload.ts', './src/hooks/useMCPTasks.ts', 
                   './src/hooks/usePersonaLearning.ts', './src/hooks/useSystemStatus.ts', './src/hooks/useWebSocket.ts'],
          'contexts': ['./src/core/NexusContext.tsx', './src/core/EchoAI.ts', './src/contexts/WorkspaceContext.tsx'],
          'services': ['./src/services/api.ts', './src/services/APILayer.ts', './src/services/GeminiService.ts', './src/services/ImageOptimizer.ts']
        }
      }
    }
  }
});