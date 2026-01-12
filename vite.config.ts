import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - gera stats.html após build
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    // Minification otimizada
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs em produção
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    // Otimizações de chunk
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Code splitting manual para separar vendors
        manualChunks: (id) => {
          // React core em chunk separado
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }

          // React Router em chunk separado
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run')) {
            return 'router-vendor';
          }

          // Supabase em chunk separado (grande biblioteca)
          if (id.includes('node_modules/@supabase')) {
            return 'supabase-vendor';
          }

          // Outras node_modules em chunk comum
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Otimizar nomes de chunks
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Sourcemaps desabilitados em produção para reduzir tamanho
    sourcemap: false,
  },
  // Otimizações de dependências
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
  },
});
