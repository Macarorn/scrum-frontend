import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin para remover crossorigin de link rel="stylesheet"
const removeCrossoriginPlugin = () => {
  return {
    name: 'remove-crossorigin',
    transformIndexHtml(html) {
      return html.replace(/<link rel="stylesheet" crossorigin href=/g, '<link rel="stylesheet" href=');
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), removeCrossoriginPlugin()],
  base: '/',
  build: {
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
          vendor: ['react', 'react-dom', 'react-router-dom'],
          bootstrap: ['react-bootstrap'],
          charts: ['recharts'],
        },
      },
    },
  },
})
