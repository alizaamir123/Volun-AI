import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: 'react', replacement: path.resolve(__dirname, 'node_modules/react') },
      { find: 'react-dom', replacement: path.resolve(__dirname, 'node_modules/react-dom') },
      { find: '@emotion/react', replacement: path.resolve(__dirname, 'node_modules/@emotion/react') },
    ],
  },
  server: {
    host: 'localhost',
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
  },
})
