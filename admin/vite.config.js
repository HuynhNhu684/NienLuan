import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    transformer: 'postcss', // ⚠️ ép dùng postcss thay cho lightningcss
    lightningcss: false,    // ⚠️ tắt hẳn lightningcss
  },
  optimizeDeps: {
    exclude: ['lightningcss'], // ⚠️ loại hẳn lightningcss khỏi bundle
  },
  server: {
    port: 5174,
  },
})
