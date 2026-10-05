import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Frontend-web/' : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name.replace(/^_+/, '');
          return `assets/${name}-[hash].js`;
        },
        entryFileNames: (chunkInfo) => {
          const name = chunkInfo.name.replace(/^_+/, '');
          return `assets/${name}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const name = (assetInfo.name || 'asset').replace(/^_+/, '');
          return `assets/${name}-[hash].[ext]`;
        },
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
