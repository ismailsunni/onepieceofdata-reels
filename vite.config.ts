import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// GitHub Pages serves the site at https://<user>.github.io/<repo>/.
// Override with VITE_BASE=/ for root-domain deploys or `npm run web:dev`.
const base = process.env.VITE_BASE ?? '/onepieceofdata-studio/'

export default defineConfig({
  root: path.resolve(__dirname, 'web'),
  base,
  plugins: [react()],
  resolve: {
    alias: {
      '@compositions': path.resolve(__dirname, 'src/compositions'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'web/dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
})
