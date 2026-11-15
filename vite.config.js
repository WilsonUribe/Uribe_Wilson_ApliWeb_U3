import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const target = process.env.API_TARGET ?? 'http://localhost:3000'
const proxy = { '/api': { target, changeOrigin: true } }

export default defineConfig({
  plugins: [vue()],
  server: { proxy, watch: { ignored: ['**/api/**'] } },
  preview: { proxy },
})
