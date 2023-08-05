/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./setup-vitest-env.js'],
    coverage: {
      exclude: ['**/dist']
    },
    exclude: [
      'workspaces/homepage',
      'workspaces/idapp',
      'workspaces/rendezvous-tester'
    ],
    include: ['workspaces/**/*.test.{js,jsx,ts,tsx}']
  }
})
