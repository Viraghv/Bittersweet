import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "bittersweet.local",
    port: 80
  },
  resolve: {
    extensions: ['.js', '.json', '.vue'],
    alias: {
      "@": "/src/"
    }
  }
})
