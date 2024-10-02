// @ts-nocheck
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from "vite-plugin-electron/simple"
import electronRenderer from 'vite-plugin-electron-renderer';  

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    electron({
      main:{
        entry: "./electron/main.ts"
      },
      preload:{
        input: "./electron/preload.ts"
      }
    }),
   electronRenderer()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
