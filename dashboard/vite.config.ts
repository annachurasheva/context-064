import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Дашборд astro-blog. ТОЛЬКО npm; package-lock.json — источник истины.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 4321 занят блогом Astro — у дашборда свой порт (регламент кодера).
    port: 5180,
    strictPort: true,
  },
})
