import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // --- Perbaikan: Tambahkan konfigurasi build untuk Rollup ---
  build: {
    rollupOptions: {
      external: ['pinia'], // Memberi tahu Rollup untuk memperlakukan 'pinia' sebagai dependensi eksternal
    },
  },
  // --- Akhir Perbaikan ---
})
