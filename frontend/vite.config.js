import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pluginRewriteAll from 'vite-plugin-rewrite-all';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), pluginRewriteAll()],
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
