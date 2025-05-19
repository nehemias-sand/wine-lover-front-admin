import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    noDiscovery: true
  },
  plugins: [
    vue(),
    vueDevTools(),
    Components({
      resolvers: [PrimeVueResolver()]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
