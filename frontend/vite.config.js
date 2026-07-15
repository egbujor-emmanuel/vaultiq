import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/vaultiq/', // Replace with your repo name
  server: {
    port: 5173
  }
})