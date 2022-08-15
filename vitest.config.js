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
    include: [
      'workspaces/box-office/**/*.test.{js,jsx,ts,tsx}',
      'workspaces/identity-service/**/*.test.{js,jsx,ts,tsx}',
      'workspaces/nameservice/**/*.test.{js,jsx,ts,tsx}',
      'workspaces/idbox-react-ui/**/*.test.{js,jsx,ts,tsx}'
    ]
  }
})
