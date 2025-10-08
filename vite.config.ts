import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // Asegurar que use la carpeta public
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Optimizaciones para producción
    target: 'es2015',
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
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['clsx', 'tailwind-merge'],
        },
      },
    },
    // Configuración de assets
    assetsDir: 'assets',
    sourcemap: false,
    // Optimización de chunks
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    host: true,
    // Configuración para desarrollo
    cors: true,
    // Suprimir warnings de source maps
    fs: {
      strict: false,
    },
  },
  preview: {
    port: 4173,
    host: true,
  },
  // Variables de entorno
  envPrefix: 'VITE_',
  // Optimización de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'axios',
      'lucide-react',
    ],
  },
  // Configuración de source maps para desarrollo
  css: {
    devSourcemap: true,
  },
  esbuild: {
    // Suprimir warnings de source maps faltantes
    logOverride: {
      'this-is-undefined-in-esm': 'silent',
    },
  },
});
